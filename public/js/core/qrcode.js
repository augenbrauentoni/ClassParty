// Lightweight, zero-dependency procedural QR Code renderer for Class Party Share-Link
// Supports alphanumeric & byte URLs with Reed-Solomon ECC (Level M)
(function() {
  // Minimal self-contained QR code matrix generator (Version 1-4)
  function createQRCode(text) {
    // Basic QR Code generator using simple Byte mode & standard polynomials
    // For reliable cross-device scanning of short URLs (e.g. http://192.168.1.50:3000/?room=7K9A)
    const PAD0 = 0xEC;
    const PAD1 = 0x11;

    // Convert text to bytes
    const textBytes = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 128) {
        textBytes.push(code);
      } else {
        // UTF-8
        textBytes.push((code >> 6) | 192);
        textBytes.push((code & 63) | 128);
      }
    }

    // Version selection: V2 (25x25, 32 bytes cap) or V3 (29x29, 55 bytes cap) or V4 (33x33, 80 bytes cap)
    let version = 3;
    let dataCap = 44; // V3 Level M
    let totalCap = 70;
    let ecCount = 26;

    if (textBytes.length > 32) {
      version = 4;
      dataCap = 64;
      totalCap = 100;
      ecCount = 36;
    }

    const size = 17 + 4 * version;

    // Build data bits: Mode (0100 = 8-bit byte), Count (8 bits), Data bytes
    const bits = [];
    function putBits(num, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((num >> i) & 1);
      }
    }

    putBits(4, 4); // 8-bit byte mode
    putBits(textBytes.length, 8); // length
    for (let i = 0; i < textBytes.length; i++) {
      putBits(textBytes[i], 8);
    }

    // Terminator
    const termLen = Math.min(4, dataCap * 8 - bits.length);
    putBits(0, termLen);
    // Byte align
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }
    // Pad bytes
    const dataBytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
      dataBytes.push(b);
    }
    while (dataBytes.length < dataCap) {
      dataBytes.push(dataBytes.length % 2 === 0 ? PAD0 : PAD1);
    }

    // Galois Field GF(256) & Reed-Solomon error correction
    const EXP = new Uint8Array(512);
    const LOG = new Uint8Array(256);
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      EXP[i + 255] = x;
      LOG[x] = i;
      x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
    }

    function gmul(a, b) {
      if (a === 0 || b === 0) return 0;
      return EXP[LOG[a] + LOG[b]];
    }

    // Generator polynomial for ecCount
    let gen = [1];
    for (let i = 0; i < ecCount; i++) {
      const nextGen = new Array(gen.length + 1).fill(0);
      for (let j = 0; j < gen.length; j++) {
        nextGen[j] ^= gmul(gen[j], EXP[i]);
        nextGen[j + 1] ^= gen[j];
      }
      gen = nextGen;
    }

    // RS encoding
    const res = new Uint8Array(dataBytes.length + ecCount);
    res.set(dataBytes);
    for (let i = 0; i < dataBytes.length; i++) {
      const coef = res[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          res[i + j] ^= gmul(gen[j], coef);
        }
      }
    }
    const ecBytes = res.slice(dataBytes.length);

    // Combine data + EC
    const fullStream = [];
    dataBytes.forEach(b => putByteBits(b, fullStream));
    ecBytes.forEach(b => putByteBits(b, fullStream));

    function putByteBits(b, target) {
      for (let i = 7; i >= 0; i--) target.push((b >> i) & 1);
    }

    // Initialize Matrix (size x size)
    const matrix = [];
    const reserved = [];
    for (let r = 0; r < size; r++) {
      matrix.push(new Array(size).fill(0));
      reserved.push(new Array(size).fill(false));
    }

    // Finder patterns (top-left, top-right, bottom-left)
    function addFinder(cr, cc) {
      for (let r = -4; r <= 4; r++) {
        for (let c = -4; c <= 4; c++) {
          const row = cr + r;
          const col = cc + c;
          if (row < 0 || row >= size || col < 0 || col >= size) continue;
          reserved[row][col] = true;
          const dist = Math.max(Math.abs(r), Math.abs(c));
          matrix[row][col] = (dist === 0 || dist === 1 || dist === 3) ? 1 : 0;
        }
      }
    }
    addFinder(3, 3);
    addFinder(3, size - 4);
    addFinder(size - 4, 3);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      matrix[6][i] = (i % 2 === 0) ? 1 : 0;
      matrix[i][6] = (i % 2 === 0) ? 1 : 0;
      reserved[6][i] = true;
      reserved[i][6] = true;
    }

    // Alignment pattern for V3 (center at 22,22) or V4 (center at 26,26)
    const alignCenter = version === 3 ? 22 : 26;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const row = alignCenter + r;
        const col = alignCenter + c;
        if (!reserved[row][col]) {
          reserved[row][col] = true;
          const d = Math.max(Math.abs(r), Math.abs(c));
          matrix[row][col] = (d === 0 || d === 2) ? 1 : 0;
        }
      }
    }

    // Reserve format info areas around finders
    for (let i = 0; i <= 8; i++) {
      reserved[8][i] = true;
      reserved[i][8] = true;
      reserved[8][size - 1 - i] = true;
      reserved[size - 1 - i][8] = true;
    }

    // Fill data bits in zigzag upward/downward pattern
    let bitIdx = 0;
    let upward = true;
    for (let c = size - 1; c > 0; c -= 2) {
      if (c === 6) c--; // Skip vertical timing column
      const rows = [];
      for (let r = 0; r < size; r++) rows.push(upward ? (size - 1 - r) : r);
      for (const r of rows) {
        for (const col of [c, c - 1]) {
          if (!reserved[r][col]) {
            const bit = bitIdx < fullStream.length ? fullStream[bitIdx++] : 0;
            // Apply standard Mask 0 ( (r + c) % 2 == 0 )
            const mask = ((r + col) % 2 === 0) ? 1 : 0;
            matrix[r][col] = bit ^ mask;
          }
        }
      }
      upward = !upward;
    }

    // Format bits for Mask 0 + Error Level M: 101010000010010
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    // Place around top-left
    for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i];
    matrix[8][7] = formatBits[6];
    matrix[8][8] = formatBits[7];
    matrix[7][8] = formatBits[8];
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i];

    // Place around top-right and bottom-left
    for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = formatBits[i];
    for (let i = 0; i < 7; i++) matrix[size - 7 + i][8] = formatBits[8 + i];

    return { size, matrix };
  }

  // Draw QR code onto an HTML5 Canvas
  window.drawQRCode = function(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    try {
      const qr = createQRCode(text);
      const margin = 2; // module margin
      const totalCells = qr.size + margin * 2;
      const cellSize = Math.floor(Math.min(width, height) / totalCells);
      const offsetX = Math.floor((width - totalCells * cellSize) / 2);
      const offsetY = Math.floor((height - totalCells * cellSize) / 2);

      ctx.fillStyle = '#0F172A'; // Dark slate modules
      for (let r = 0; r < qr.size; r++) {
        for (let c = 0; c < qr.size; c++) {
          if (qr.matrix[r][c] === 1) {
            ctx.fillRect(
              offsetX + (c + margin) * cellSize,
              offsetY + (r + margin) * cellSize,
              cellSize,
              cellSize
            );
          }
        }
      }
    } catch (e) {
      console.warn('QR Code generation fallback', e);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text, width / 2, height / 2);
    }
  };
})();
