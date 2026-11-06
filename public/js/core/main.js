// Main Entry Point & UI/Event Controller for "Class Party"
document.addEventListener('DOMContentLoaded', () => {
  const game = window.partyGame;
  const net = window.networkManager;
  const audio = window.soundEngine;

  // Initialize Network & Audio on first user interaction
  net.init();
  const initAudioOnce = () => {
    audio.ensureContext();
    window.removeEventListener('click', initAudioOnce);
    window.removeEventListener('keydown', initAudioOnce);
  };
  window.addEventListener('click', initAudioOnce);
  window.addEventListener('keydown', initAudioOnce);

  // Audio Toggle Button
  const muteBtn = document.getElementById('btn-toggle-sound');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      const isMuted = audio.toggleMute();
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  // --- AVATAR SYSTEM & STATE (100% ONLINE MULTIPLAYER) ---
  let currentSelectedChar = (window.characterRegistry && window.characterRegistry.getAll()[0]) || {
    id: 'pc_schrauber',
    name: 'Der PC-Schrauber',
    avatar: 'assets/avatars/char1_pc_schrauber.png'
  };

  function selectAvatar(charId, broadcast = true) {
    if (!window.characterRegistry) return;
    const char = window.characterRegistry.getById(charId);
    if (!char) return;

    currentSelectedChar = char;
    try {
      localStorage.setItem('classParty_selectedAvatar', char.id);
    } catch (e) {}

    // Update active display badge
    const previewImg = document.getElementById('avatar-selected-preview-img');
    const previewName = document.getElementById('avatar-selected-name');
    if (previewImg) previewImg.src = char.avatar;
    if (previewName) previewName.textContent = char.name;

    // Highlight card in all picker grids
    document.querySelectorAll('.avatar-card').forEach(card => {
      const isSelected = card.dataset.charId === char.id;
      if (isSelected) {
        card.classList.add('selected', 'border-yellow-400', 'ring-2', 'ring-yellow-400/50', 'bg-amber-500/10');
        const badge = card.querySelector('.avatar-check-badge');
        if (badge) badge.classList.remove('hidden');
      } else {
        card.classList.remove('selected', 'border-yellow-400', 'ring-2', 'ring-yellow-400/50', 'bg-amber-500/10');
        const badge = card.querySelector('.avatar-check-badge');
        if (badge) badge.classList.add('hidden');
      }
    });

    // If host name or join name has not been custom typed, prefill character name
    const hostInput = document.getElementById('input-host-name');
    if (hostInput && (!hostInput.dataset.userEdited || hostInput.value === 'Spieler 1')) {
      hostInput.value = char.name;
    }
    const joinInput = document.getElementById('input-join-name');
    if (joinInput && (!joinInput.dataset.userEdited || joinInput.value === '')) {
      joinInput.value = char.name;
    }

    // If in an active online room, broadcast avatar change to server
    if (broadcast && net && net.roomId) {
      net.sendSelectAvatar(char.avatar, char.id, char.name);
    }
  }

  function renderAvatarPickers() {
    if (!window.characterRegistry) return;
    const allChars = window.characterRegistry.getAll();
    const mainGrid = document.getElementById('avatar-picker-grid');
    const lobbyGrid = document.getElementById('lobby-avatar-picker-grid');

    const generateCardsHtml = () => allChars.map(c => {
      const isSelected = c.id === currentSelectedChar.id;
      return `
        <button type="button" class="avatar-card group relative p-1.5 sm:p-2 rounded-2xl bg-slate-900/90 border-2 transition-all flex flex-col items-center text-center gap-1 cursor-pointer shadow ${
          isSelected
            ? 'selected border-yellow-400 ring-2 ring-yellow-400/50 bg-amber-500/10'
            : 'border-slate-700/80 hover:border-amber-400'
        }" data-char-id="${c.id}">
          <div class="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 shadow bg-slate-950 flex items-center justify-center flex-shrink-0" style="border-color: ${c.color}">
            <img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover">
            <span class="avatar-check-badge ${isSelected ? '' : 'hidden'} absolute top-0.5 right-0.5 bg-yellow-400 text-slate-950 rounded-full w-4 h-4 text-[10px] font-black flex items-center justify-center shadow">✓</span>
          </div>
          <div class="w-full truncate">
            <span class="text-[10px] sm:text-[11px] font-black text-white group-hover:text-yellow-300 block truncate">${c.name}</span>
            <span class="text-[9px] text-slate-400 hidden sm:block truncate">${c.title || ''}</span>
          </div>
        </button>
      `;
    }).join('');

    const html = generateCardsHtml();
    if (mainGrid) {
      mainGrid.innerHTML = html;
      mainGrid.querySelectorAll('.avatar-card').forEach(btn => {
        btn.addEventListener('click', () => selectAvatar(btn.dataset.charId, true));
      });
    }
    if (lobbyGrid) {
      lobbyGrid.innerHTML = html;
      lobbyGrid.querySelectorAll('.avatar-card').forEach(btn => {
        btn.addEventListener('click', () => selectAvatar(btn.dataset.charId, true));
      });
    }
  }

  // Restore saved avatar if present
  try {
    const saved = localStorage.getItem('classParty_selectedAvatar');
    if (saved && window.characterRegistry && window.characterRegistry.getById(saved)) {
      currentSelectedChar = window.characterRegistry.getById(saved);
    }
  } catch (e) {}

  renderAvatarPickers();
  selectAvatar(currentSelectedChar.id, false);

  // Main menu navigation buttons
  const menuBtnHost = document.getElementById('menu-btn-host');
  const menuBtnJoin = document.getElementById('menu-btn-join');
  const menuBtnAvatar = document.getElementById('menu-btn-avatar');

  if (menuBtnHost) {
    menuBtnHost.addEventListener('click', () => {
      const card = document.getElementById('online-create-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inp = document.getElementById('input-host-name');
        if (inp) inp.focus();
      }
    });
  }

  if (menuBtnJoin) {
    menuBtnJoin.addEventListener('click', () => {
      const card = document.getElementById('online-join-card');
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inp = document.getElementById('input-join-code');
        if (inp) inp.focus();
      }
    });
  }

  if (menuBtnAvatar) {
    menuBtnAvatar.addEventListener('click', () => {
      const sec = document.getElementById('avatar-selection-section');
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sec.classList.add('ring-4', 'ring-amber-400');
        setTimeout(() => sec.classList.remove('ring-4', 'ring-amber-400'), 1500);
      }
    });
  }

  // Online: Create Room
  const btnCreateRoom = document.getElementById('btn-create-room');
  const inputHostName = document.getElementById('input-host-name');
  const selectRoundsOnline = document.getElementById('select-rounds-online');
  const selectMaxPlayers = document.getElementById('select-max-players');
  const toggleEnableBots = document.getElementById('toggle-enable-bots');
  const containerBotCount = document.getElementById('container-bot-count');
  const selectBotCount = document.getElementById('select-bot-count');
  const selectBoard = document.getElementById('select-board');
  const labelBotStatus = document.getElementById('label-bot-status');

  if (toggleEnableBots) {
    toggleEnableBots.addEventListener('change', () => {
      const isEnabled = toggleEnableBots.checked;
      if (containerBotCount) {
        containerBotCount.style.display = isEnabled ? 'flex' : 'none';
      }
      if (labelBotStatus) {
        labelBotStatus.textContent = isEnabled
          ? 'EIN = Freie Plätze werden mit Bots aufgefüllt'
          : 'AUS = Spiel startet exakt mit anwesenden Menschen';
      }
    });
  }

  if (inputHostName) {
    inputHostName.addEventListener('input', () => {
      inputHostName.dataset.userEdited = 'true';
    });
  }

  if (btnCreateRoom) {
    btnCreateRoom.addEventListener('click', () => {
      const name = (inputHostName && inputHostName.value.trim()) || currentSelectedChar.name || 'Spieler 1';
      const rounds = parseInt(selectRoundsOnline ? selectRoundsOnline.value : 10, 10) || 10;
      const maxPlayers = parseInt(selectMaxPlayers ? selectMaxPlayers.value : 4, 10) || 4;
      const enableBots = toggleEnableBots ? toggleEnableBots.checked : true;
      const botCountVal = selectBotCount ? selectBotCount.value : 'auto';
      const botCount = (botCountVal === 'auto') ? Math.max(0, maxPlayers - 1) : (parseInt(botCountVal, 10) || 0);
      const boardId = (selectBoard ? selectBoard.value : 'board_1') || 'board_1';

      net.createRoom(
        name,
        rounds,
        false,
        null,
        null,
        currentSelectedChar.id,
        currentSelectedChar.avatar,
        maxPlayers,
        enableBots,
        botCount,
        boardId
      );
    });
  }

  // Online: Join Room
  const btnJoinRoom = document.getElementById('btn-join-room');
  const inputJoinCode = document.getElementById('input-join-code');
  const inputJoinName = document.getElementById('input-join-name');

  if (inputJoinName) {
    inputJoinName.addEventListener('input', () => {
      inputJoinName.dataset.userEdited = 'true';
    });
  }

  if (btnJoinRoom) {
    btnJoinRoom.addEventListener('click', () => {
      const code = (inputJoinCode && inputJoinCode.value.trim().toUpperCase()) || '';
      const name = (inputJoinName && inputJoinName.value.trim()) || currentSelectedChar.name || 'Spieler';
      if (!code) {
        alert('Bitte gib einen 4-stelligen Raum-Code ein.');
        return;
      }
      net.joinRoom(code, name, currentSelectedChar.id, currentSelectedChar.avatar);
    });
  }

  // Server Network Info cache (Local IP & Public Tunnel URL)
  let serverNetworkInfo = null;
  let activeLinkMode = 'auto'; // 'auto', 'wlan', 'tunnel'

  async function fetchServerNetworkInfo() {
    try {
      const res = await fetch('/api/server-info', {
        headers: {
          'Bypass-Tunnel-Reminder': 'true',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      if (res.ok) {
        serverNetworkInfo = await res.json();
        const roomCodeBadge = document.getElementById('lobby-room-code-badge');
        const currentRoomId = (roomCodeBadge && roomCodeBadge.textContent !== '----') ? roomCodeBadge.textContent.trim() : null;
        if (currentRoomId) {
          updateLobbyShareLink(currentRoomId);
        }
      }
    } catch (e) {
      console.warn('Could not fetch server network info', e);
    }
  }
  fetchServerNetworkInfo();

  // Auto-detect room code from URL query parameter (e.g. ?room=ABCD)
  function syncRoomUrlParam(roomId) {
    if (!roomId) return;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('room') !== roomId) {
        url.searchParams.set('room', roomId);
        window.history.replaceState({}, '', url.toString());
      }
    } catch (e) {}
  }

  function clearRoomUrlParam() {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('room')) {
        url.searchParams.delete('room');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      }
    } catch (e) {}
  }

  const urlParams = new URLSearchParams(window.location.search);
  const roomQueryCode = urlParams.get('room');
  if (roomQueryCode && inputJoinCode) {
    const cleanCode = roomQueryCode.trim().toUpperCase();
    inputJoinCode.value = cleanCode;
    if (tabOnline) tabOnline.click();

    const banner = document.getElementById('invite-welcome-banner');
    const bannerCode = document.getElementById('invite-banner-room-code');
    if (banner && bannerCode) {
      bannerCode.textContent = cleanCode;
      banner.classList.remove('hidden');
    }

    const joinCard = document.getElementById('online-join-card');
    if (joinCard) {
      joinCard.classList.add('ring-2', 'ring-yellow-400', 'shadow-2xl', 'shadow-yellow-400/20');
    }

    // Auto-reconnect if returning player with existing session
    const savedRoom = localStorage.getItem('class_party_active_room');
    const sessionId = localStorage.getItem('class_party_session_id');
    if (savedRoom === cleanCode && sessionId) {
      console.log(`[Auto-Reconnect] Vorherige Sitzung für Raum [${cleanCode}] gefunden. Reconnect läuft...`);
      net.reconnectRoom(cleanCode);
    } else {
      setTimeout(() => {
        if (inputJoinName) {
          inputJoinName.focus();
          inputJoinName.select();
        }
        if (game && game.showToast) {
          game.showToast(`🎉 Eingeladen in Raum [${cleanCode}]! Gib deinen Namen ein.`);
        }
      }, 450);
    }
  }

  // Allow pressing Enter in name or code input to join directly
  if (inputJoinName) {
    inputJoinName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (btnJoinRoom) btnJoinRoom.click();
      }
    });
  }
  if (inputJoinCode) {
    inputJoinCode.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (inputJoinName) inputJoinName.focus();
      }
    });
  }

  // Copy Invite Link Button in Lobby
  const btnCopyInviteLink = document.getElementById('btn-copy-invite-link');
  const inputInviteLink = document.getElementById('input-invite-link');
  if (btnCopyInviteLink && inputInviteLink) {
    btnCopyInviteLink.addEventListener('click', () => {
      const linkText = inputInviteLink.value.trim();
      if (!linkText) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkText).then(() => {
          btnCopyInviteLink.innerHTML = '<span>✅</span> Kopiert!';
          setTimeout(() => {
            btnCopyInviteLink.innerHTML = '<span>📋</span> Link kopieren';
          }, 2000);
        }).catch(() => {
          inputInviteLink.select();
          document.execCommand('copy');
          btnCopyInviteLink.innerHTML = '<span>✅</span> Kopiert!';
          setTimeout(() => {
            btnCopyInviteLink.innerHTML = '<span>📋</span> Link kopieren';
          }, 2000);
        });
      } else {
        inputInviteLink.select();
        document.execCommand('copy');
        btnCopyInviteLink.innerHTML = '<span>✅</span> Kopiert!';
        setTimeout(() => {
          btnCopyInviteLink.innerHTML = '<span>📋</span> Link kopieren';
        }, 2000);
      }
    });
  }

  // --- MICROSOFT TEAMS INVITATION COPY ---
  const btnCopyTeamsInvite = document.getElementById('btn-copy-teams-invite');
  const btnLobbyCopyTeams = document.getElementById('btn-lobby-copy-teams');
  const teamsFeedback = document.getElementById('teams-copy-feedback');

  function fallbackCopyText(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta);
  }

  function showTeamsCopyToast() {
    if (teamsFeedback) {
      teamsFeedback.classList.remove('hidden');
      if (audio && audio.playCoinCollect) audio.playCoinCollect();
      setTimeout(() => {
        teamsFeedback.classList.add('hidden');
      }, 3500);
    }
  }

  function getInviteUrlForRoom(roomCode) {
    const linkInput = document.getElementById('input-invite-link');
    if (linkInput && linkInput.value && linkInput.value.includes('?room=')) {
      return linkInput.value;
    }

    const hasTunnel = serverNetworkInfo && serverNetworkInfo.publicTunnelUrl;
    const hasWlan = serverNetworkInfo && serverNetworkInfo.localIp && serverNetworkInfo.localIp !== 'localhost' && serverNetworkInfo.localIp !== '127.0.0.1';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let base = window.location.origin;
    if (hasTunnel) {
      base = serverNetworkInfo.publicTunnelUrl;
    } else if (isLocalhost && hasWlan) {
      const port = window.location.port ? `:${window.location.port}` : (serverNetworkInfo.port ? `:${serverNetworkInfo.port}` : '');
      base = `http://${serverNetworkInfo.localIp}${port}`;
    }
    base = base.replace(/\/+$/, '');
    return roomCode ? `${base}/?room=${encodeURIComponent(roomCode)}` : `${base}/`;
  }

  function copyTeamsInviteToClipboard() {
    const roomCodeBadge = document.getElementById('lobby-room-code-badge');
    const roomCode = (roomCodeBadge && roomCodeBadge.textContent !== '----') ? roomCodeBadge.textContent.trim() : '';
    const joinUrl = getInviteUrlForRoom(roomCode);

    // Format fuer Microsoft Teams & Messenger Chats
    const teamsText = roomCode 
      ? `🎉 Kommt in unsere Class-Party-Runde! Klickt einfach auf den Link: ${joinUrl} (Raum-Code: ${roomCode})`
      : `🎉 Kommt in unsere Class-Party-Runde! Klickt einfach auf den Link: ${joinUrl}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(teamsText).then(() => {
        showTeamsCopyToast();
      }).catch(() => {
        fallbackCopyText(teamsText);
        showTeamsCopyToast();
      });
    } else {
      fallbackCopyText(teamsText);
      showTeamsCopyToast();
    }
  }

  if (btnCopyTeamsInvite) {
    btnCopyTeamsInvite.addEventListener('click', copyTeamsInviteToClipboard);
  }

  if (btnLobbyCopyTeams) {
    btnLobbyCopyTeams.addEventListener('click', () => {
      copyTeamsInviteToClipboard();
      btnLobbyCopyTeams.innerHTML = '<span>✅</span> Teams-Text kopiert!';
      setTimeout(() => {
        btnLobbyCopyTeams.innerHTML = '<span>💬</span> Teams-Text kopieren';
      }, 2000);
    });
  }

  // --- SETTINGS MODAL & SHORTCUT CONTROLS ---
  const menuBtnSettings = document.getElementById('menu-btn-settings');
  const settingsModal = document.getElementById('settings-modal');

  if (menuBtnSettings && settingsModal) {
    menuBtnSettings.addEventListener('click', () => {
      settingsModal.classList.remove('hidden');
    });
  }

  // --- BUTTONS "EIGENES BILD / WEITEREN CHARAKTER HINZUFÜGEN" ---
  const btnAddCustomCharLocal = document.getElementById('btn-add-custom-char-local');
  const btnAddCustomCharOnline = document.getElementById('btn-add-custom-char-online');
  if (btnAddCustomCharLocal) {
    btnAddCustomCharLocal.addEventListener('click', () => {
      if (customCharModal) customCharModal.classList.remove('hidden');
    });
  }
  if (btnAddCustomCharOnline) {
    btnAddCustomCharOnline.addEventListener('click', () => {
      if (customCharModal) customCharModal.classList.remove('hidden');
    });
  }

  // --- CHARACTER GALLERY MODAL ---
  const galleryModal = document.getElementById('character-gallery-modal');
  const btnOpenGallery = document.getElementById('btn-open-gallery');
  const btnCloseGallery = document.getElementById('btn-close-gallery');
  const btnCloseGalleryBottom = document.getElementById('btn-close-gallery-bottom');
  const galleryGrid = document.getElementById('gallery-characters-grid');
  const btnGalleryToUpload = document.getElementById('btn-gallery-to-upload');

  function renderGallery() {
    if (!galleryGrid || !window.characterRegistry) return;
    galleryGrid.innerHTML = '';
    const allChars = window.characterRegistry.getAll();
    allChars.forEach((c) => {
      const isSelected = c.id === currentSelectedChar.id;
      const card = document.createElement('div');
      card.className = `p-4 rounded-2xl bg-slate-800/90 border-2 transition flex flex-col items-center text-center gap-2 shadow-lg ${
        isSelected ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800' : 'border-slate-700 hover:border-amber-400 hover:bg-slate-800'
      }`;
      card.innerHTML = `
        <div class="relative w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-lg bg-slate-950 flex items-center justify-center" style="border-color: ${c.color}">
          <img src="${c.avatar}" alt="${c.name}" class="w-full h-full object-cover">
          <span class="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-900/90 text-white border" style="border-color: ${c.color}">
            ${c.aura ? c.aura.toUpperCase() : 'HERO'}
          </span>
        </div>
        <div class="font-extrabold text-sm text-white">${c.name}</div>
        <div class="text-[11px] font-semibold text-amber-300">${c.title}</div>
        <p class="text-[10px] text-slate-300 font-sans leading-tight line-clamp-2">${c.description}</p>
        <div class="text-[10px] italic text-slate-400 font-serif">"${c.quote}"</div>
        <button type="button" class="btn-select-from-gallery mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95 cursor-pointer" data-char-id="${c.id}">
          ${isSelected ? '✓ Bereits gewählt' : 'Als mein Avatar wählen ✓'}
        </button>
      `;
      galleryGrid.appendChild(card);
    });

    galleryGrid.querySelectorAll('.btn-select-from-gallery').forEach(b => {
      b.addEventListener('click', (e) => {
        const charId = e.currentTarget.dataset.charId;
        selectAvatar(charId, true);
        if (galleryModal) galleryModal.classList.add('hidden');
        const char = window.characterRegistry.getById(charId);
        if (game && game.showToast && char) {
          game.showToast(`🎭 Avatar gewählt: ${char.name}`);
        }
      });
    });
  }

  if (btnOpenGallery && galleryModal) {
    btnOpenGallery.addEventListener('click', () => {
      renderGallery();
      galleryModal.classList.remove('hidden');
    });
  }
  if (btnCloseGallery && galleryModal) {
    btnCloseGallery.addEventListener('click', () => galleryModal.classList.add('hidden'));
  }
  if (btnCloseGalleryBottom && galleryModal) {
    btnCloseGalleryBottom.addEventListener('click', () => galleryModal.classList.add('hidden'));
  }
  if (btnGalleryToUpload) {
    btnGalleryToUpload.addEventListener('click', () => {
      if (galleryModal) galleryModal.classList.add('hidden');
      if (customCharModal) customCharModal.classList.remove('hidden');
    });
  }

  // --- CUSTOM CHARACTER UPLOAD MODAL ---
  const customCharModal = document.getElementById('custom-character-modal');
  const btnOpenUploadChar = document.getElementById('btn-open-upload-char');
  const btnCloseUploadChar = document.getElementById('btn-close-upload-char');
  const btnCancelUploadChar = document.getElementById('btn-cancel-upload-char');
  const uploadDropzone = document.getElementById('upload-dropzone');
  const inputCustomAvatar = document.getElementById('input-custom-avatar');
  const uploadPreviewContainer = document.getElementById('upload-preview-container');
  const uploadPreviewImg = document.getElementById('upload-preview-img');
  const uploadPlaceholderIcon = document.getElementById('upload-placeholder-icon');
  const uploadLabel = document.getElementById('upload-label');
  const btnSaveCustomChar = document.getElementById('btn-save-custom-char');

  let currentUploadedDataUrl = '';

  if (btnOpenUploadChar && customCharModal) {
    btnOpenUploadChar.addEventListener('click', () => {
      customCharModal.classList.remove('hidden');
    });
  }
  if (btnCloseUploadChar && customCharModal) {
    btnCloseUploadChar.addEventListener('click', () => customCharModal.classList.add('hidden'));
  }
  if (btnCancelUploadChar && customCharModal) {
    btnCancelUploadChar.addEventListener('click', () => customCharModal.classList.add('hidden'));
  }

  function processAvatarFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Bitte wähle eine gültige Bilddatei aus (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      currentUploadedDataUrl = ev.target.result;
      if (uploadPreviewImg && uploadPreviewContainer) {
        uploadPreviewImg.src = currentUploadedDataUrl;
        uploadPreviewContainer.classList.remove('hidden');
        if (uploadPlaceholderIcon) uploadPlaceholderIcon.classList.add('hidden');
        if (uploadLabel) uploadLabel.textContent = file.name;
      }
    };
    reader.readAsDataURL(file);
  }

  if (uploadDropzone && inputCustomAvatar) {
    uploadDropzone.addEventListener('click', () => inputCustomAvatar.click());

    uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadDropzone.classList.add('border-purple-300', 'bg-purple-950/60');
    });

    uploadDropzone.addEventListener('dragleave', () => {
      uploadDropzone.classList.remove('border-purple-300', 'bg-purple-950/60');
    });

    uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadDropzone.classList.remove('border-purple-300', 'bg-purple-950/60');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processAvatarFile(e.dataTransfer.files[0]);
      }
    });

    inputCustomAvatar.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processAvatarFile(e.target.files[0]);
      }
    });
  }

  if (btnSaveCustomChar) {
    btnSaveCustomChar.addEventListener('click', () => {
      const name = document.getElementById('input-custom-name').value.trim() || 'Neuer Klassen-Star';
      const title = document.getElementById('input-custom-title').value.trim() || 'Klassen-Herausforderer';
      const quote = document.getElementById('input-custom-quote').value.trim() || '„Bereit für den Stern!“';
      const color = document.getElementById('select-custom-color').value || '#A855F7';
      const aura = document.getElementById('select-custom-aura').value || 'rgb';

      if (!currentUploadedDataUrl) {
        alert('Bitte wähle zuerst ein Bild für deine Spielfigur aus.');
        return;
      }

      if (window.characterRegistry) {
        const newChar = window.characterRegistry.addCustomCharacter({
          name,
          title,
          quote,
          color,
          aura,
          avatarDataUrl: currentUploadedDataUrl
        });

        if (game.players && game.players[0]) {
          game.players[0].name = newChar.name;
          game.players[0].avatar = newChar.avatar;
          game.players[0].archetype = newChar.id;
          game.players[0].color = newChar.color;
          const hostInput = document.getElementById('input-host-name');
          if (hostInput) hostInput.value = newChar.name;
          const p1Input = document.getElementById('input-local-p1');
          if (p1Input) p1Input.value = newChar.name;
        }

        if (customCharModal) customCharModal.classList.add('hidden');
        if (game.showToast) game.showToast(`✨ Charakter "${newChar.name}" erfolgreich hinzugefügt!`);
        if (audio && audio.playSuccess) audio.playSuccess();
        renderAvatarPickers();
        selectAvatar(newChar.id, true);
        if (renderGallery) renderGallery();
      }
    });
  }

  // --- BOARD CAMERA CONTROLS ---
  const btnCamOverview = document.getElementById('btn-cam-overview');
  const btnCamZoomin = document.getElementById('btn-cam-zoomin');
  const btnCamZoomout = document.getElementById('btn-cam-zoomout');
  const btnCamRecenter = document.getElementById('btn-cam-recenter');

  if (btnCamOverview) {
    btnCamOverview.addEventListener('click', () => {
      if (game.board && game.board.camera) {
        game.board.camera.overview = !game.board.camera.overview;
      }
    });
  }

  if (btnCamZoomin) {
    btnCamZoomin.addEventListener('click', () => {
      if (game.board && game.board.camera) {
        game.board.camera.overview = false;
        game.board.camera.zoom = Math.min(2.2, game.board.camera.zoom + 0.2);
        game.board.camera.targetZoom = game.board.camera.zoom;
      }
    });
  }

  if (btnCamZoomout) {
    btnCamZoomout.addEventListener('click', () => {
      if (game.board && game.board.camera) {
        game.board.camera.zoom = Math.max(0.42, game.board.camera.zoom - 0.2);
        game.board.camera.targetZoom = game.board.camera.zoom;
      }
    });
  }

  if (btnCamRecenter) {
    btnCamRecenter.addEventListener('click', () => {
      if (game.board && game.board.camera) {
        game.board.camera.overview = false;
        game.board.camera.isDragging = false;
        const p = game.players[game.turnIndex];
        if (p) {
          const coords = game.board.getTileScreenCoords(p.boardPosition);
          game.board.camera.targetX = coords.x;
          game.board.camera.targetY = coords.y;
        }
      }
    });
  }

  // Online Team-Mode Toggle Button
  const btnToggleTeamMode = document.getElementById('btn-toggle-team-mode');
  const teamModeLabel = document.getElementById('team-mode-label');
  let onlineTeamMode = false;

  if (btnToggleTeamMode) {
    btnToggleTeamMode.addEventListener('click', () => {
      onlineTeamMode = !onlineTeamMode;
      net.toggleTeamMode(onlineTeamMode);
      if (teamModeLabel) {
        teamModeLabel.textContent = onlineTeamMode
          ? 'Team-Modus: AN (2er-Teams)'
          : 'Team-Modus: AUS (Einzelspieler)';
      }
      btnToggleTeamMode.className = onlineTeamMode
        ? 'px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 border-2 border-yellow-400 shadow-lg shadow-purple-600/40 transition active:scale-95 animate-pulse'
        : 'px-4 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 border border-purple-400 shadow transition active:scale-95';
    });
  }

  // Online Room Lobby Host controls
  const btnStartOnlineGame = document.getElementById('btn-start-online-game');
  if (btnStartOnlineGame) {
    btnStartOnlineGame.addEventListener('click', () => {
      net.startGame();
    });
  }

  // Board Turn: Dice Button
  const btnRollDice = document.getElementById('btn-roll-dice');
  if (btnRollDice) {
    btnRollDice.addEventListener('click', () => {
      game.executeDiceRoll();
    });
  }

  // --- NETWORK EVENT HANDLERS ---

  function updateLobbyShareLink(roomId) {
    let baseUrl = `${window.location.origin}${window.location.pathname}`;

    const hasTunnel = serverNetworkInfo && serverNetworkInfo.publicTunnelUrl;
    const hasWlan = serverNetworkInfo && serverNetworkInfo.localIp && serverNetworkInfo.localIp !== 'localhost' && serverNetworkInfo.localIp !== '127.0.0.1';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let currentMode = activeLinkMode;
    if (currentMode === 'auto') {
      if (hasTunnel) currentMode = 'tunnel';
      else if (isLocalhost && hasWlan) currentMode = 'wlan';
      else currentMode = 'origin';
    }

    if (currentMode === 'tunnel' && hasTunnel) {
      const cleanTunnel = serverNetworkInfo.publicTunnelUrl.replace(/\/+$/, '');
      baseUrl = `${cleanTunnel}${window.location.pathname}`;
    } else if (currentMode === 'wlan' && hasWlan) {
      const port = window.location.port ? `:${window.location.port}` : (serverNetworkInfo.port ? `:${serverNetworkInfo.port}` : '');
      baseUrl = `http://${serverNetworkInfo.localIp}${port}${window.location.pathname}`;
    }

    baseUrl = baseUrl.replace(/\/+$/, '');
    const inviteUrl = `${baseUrl}/?room=${encodeURIComponent(roomId)}`;
    const linkInput = document.getElementById('input-invite-link');
    if (linkInput) linkInput.value = inviteUrl;

    const qrCanvas = document.getElementById('lobby-qr-canvas');
    if (qrCanvas && window.drawQRCode) {
      window.drawQRCode(qrCanvas, inviteUrl);
    }

    const hintEl = document.getElementById('lobby-network-hint');
    if (hintEl) {
      if (currentMode === 'tunnel') {
        hintEl.innerHTML = `🌐 <span class="text-emerald-400 font-bold">Internet-Tunnel aktiv!</span> Mitschüler können weltweit von jedem Gerät & Netz beitreten.`;
      } else if (currentMode === 'wlan') {
        hintEl.innerHTML = `📶 <span class="text-yellow-300 font-bold">WLAN-Link:</span> Mitschüler im selben WLAN / Handy-Hotspot können direkt beitreten.`;
      } else if (!isLocalhost) {
        hintEl.innerHTML = `🌐 <span class="text-emerald-400 font-bold">Cloud-Hosting aktiv!</span> Mitschüler können weltweit von jedem Gerät & Netz direkt beitreten.`;
      } else {
        hintEl.innerHTML = `💻 <span class="text-indigo-300 font-bold">Direkt-Link:</span> Über diesen Link beitreten.`;
      }
    }

    // Toggle button for switching between WLAN and Tunnel if both exist
    const btnToggleLink = document.getElementById('btn-toggle-link-mode');
    if (btnToggleLink) {
      if (hasTunnel && hasWlan) {
        btnToggleLink.classList.remove('hidden');
        btnToggleLink.onclick = () => {
          activeLinkMode = (currentMode === 'tunnel') ? 'wlan' : 'tunnel';
          updateLobbyShareLink(roomId);
        };
        btnToggleLink.innerHTML = (currentMode === 'tunnel')
          ? `<span>📶</span> Zu WLAN wechseln`
          : `<span>🌐</span> Zu Internet wechseln`;
      } else {
        btnToggleLink.classList.add('hidden');
      }
    }
  }

  net.on('tunnel_ready', ({ publicTunnelUrl, tunnelType }) => {
    if (publicTunnelUrl) {
      if (!serverNetworkInfo) {
        serverNetworkInfo = {};
      }
      serverNetworkInfo.publicTunnelUrl = publicTunnelUrl;
      const roomCodeBadge = document.getElementById('lobby-room-code-badge');
      const currentRoomId = (roomCodeBadge && roomCodeBadge.textContent !== '----') ? roomCodeBadge.textContent.trim() : null;
      if (currentRoomId) {
        updateLobbyShareLink(currentRoomId);
      }
      const hint = document.getElementById('lobby-network-hint');
      if (hint) {
        hint.innerHTML = `🌐 <span class="text-emerald-400 font-bold">Internet-Tunnel aktiv!</span> Mitschüler können weltweit von jedem Gerät & Netz beitreten.`;
      }
      if (game && game.showToast) {
        game.showToast('🌐 Weltweiter Internet-Link aktiv! Einladungs-Link aktualisiert.');
      }
    }
  });

  net.on('room_created', ({ roomId, playerIndex, room }) => {
    syncRoomUrlParam(roomId);
    document.getElementById('online-setup-forms').classList.add('hidden');
    document.getElementById('online-room-lobby').classList.remove('hidden');
    document.getElementById('lobby-room-code-badge').textContent = roomId;
    updateOnlineLobbySlots(room, true);
    updateLobbyShareLink(roomId);
  });

  net.on('room_joined', ({ roomId, playerIndex, room }) => {
    syncRoomUrlParam(roomId);
    document.getElementById('online-setup-forms').classList.add('hidden');
    document.getElementById('online-room-lobby').classList.remove('hidden');
    document.getElementById('lobby-room-code-badge').textContent = roomId;
    document.getElementById('btn-start-online-game').classList.add('hidden'); // Only host starts
    updateOnlineLobbySlots(room, false);
    updateLobbyShareLink(roomId);
  });

  net.on('board_state_synced', ({ players, starTileIndex, jackpotCoins, eventMessage }) => {
    if (Array.isArray(players)) {
      players.forEach((p, idx) => {
        if (game.players[idx]) {
          game.players[idx].coins = p.coins;
          game.players[idx].stars = p.stars;
          game.players[idx].boardPosition = p.boardPosition;
          if (p.inventory) game.players[idx].inventory = p.inventory;
          if (p.emote) game.setPlayerEmote(game.players[idx], p.emote);
        }
      });
    }
    if (typeof starTileIndex === 'number') game.starTileIndex = starTileIndex;
    if (typeof jackpotCoins === 'number') game.board.jackpotCoins = jackpotCoins;
    game.updateHUD();
    if (eventMessage) game.showToast(eventMessage);
  });

  net.on('join_error', ({ message }) => {
    alert(message);
  });

  net.on('reconnect_failed', ({ message } = {}) => {
    console.log('[Auto-Reconnect] Keine Sitzung gefunden:', message);
    try {
      localStorage.removeItem('class_party_active_room');
    } catch (e) {}
  });

  net.on('start_error', ({ message }) => {
    alert(`⚠️ Spiel konnte nicht gestartet werden:\n${message}`);
  });

  net.on('room_reconnected', ({ roomId, playerIndex, room }) => {
    syncRoomUrlParam(roomId);
    console.log('✅ Erfolgreich wiederverbunden zu Raum', roomId, 'als Spieler', playerIndex);
    if (room.state !== 'LOBBY') {
      game.syncWithRoom(room, playerIndex);
      game.showToast('✅ Verbindung wiederhergestellt! Willkommen zurück im Spiel.');
    } else {
      document.getElementById('online-setup-forms').classList.add('hidden');
      document.getElementById('online-room-lobby').classList.remove('hidden');
      document.getElementById('lobby-room-code-badge').textContent = roomId;
      updateOnlineLobbySlots(room, (playerIndex === 0));
      updateLobbyShareLink(roomId);
      game.showToast('✅ Verbindung zur Raum-Lobby wiederhergestellt!');
    }
  });

  net.on('player_reconnected', ({ playerIndex, room }) => {
    const p = room.players && room.players[playerIndex];
    if (p) {
      game.showToast(`🟢 ${p.name} ist wieder online!`);
    }
    updateOnlineLobbySlots(room, net.isHost);
  });

  net.on('room_updated', ({ room }) => {
    updateOnlineLobbySlots(room, net.isHost);
  });

  net.on('game_started', ({ room }) => {
    game.syncWithRoom(room, net.myPlayerIndex);
  });

  net.on('dice_rolled', ({ turnIndex, roll }) => {
    game.handleDiceRollResult(turnIndex, roll);
  });

  net.on('player_moved', ({ playerIndex, newTileIndex }) => {
    if (game.players[playerIndex]) {
      game.players[playerIndex].boardPosition = newTileIndex;
    }
  });

  net.on('star_bought', ({ playerIndex, newCoins, newStars, newStarTileIndex }) => {
    const p = game.players[playerIndex];
    if (p) {
      p.coins = newCoins;
      p.stars = newStars;
    }
    game.starTileIndex = newStarTileIndex;
    game.updateHUD();
    game.showToast(`⭐ ${p.name} kauft einen Stern! Neuer Stern auf Feld #${newStarTileIndex}`);
  });

  net.on('turn_advanced', ({ turnIndex, players }) => {
    game.turnIndex = turnIndex;
    game.players = players;
    game.updateHUD();
    game.checkActiveTurn();
  });

  net.on('minigame_intro', ({ minigameId, seed, round, maxRounds, players }) => {
    game.round = round;
    game.maxRounds = maxRounds;
    game.players = players;
    game.setState('MINIGAME_INTRO');
    game.prepareMinigame(minigameId, seed);
  });

  net.on('minigame_action_sync', ({ playerIndex, input, state }) => {
    if (game.currentMinigameInstance) {
      if (input) {
        game.currentMinigameInstance.handleInput(playerIndex, input.action, input.isDown);
      }
    }
  });

  net.on('minigame_results', ({ results, players }) => {
    game.players = players;
    game.showMinigameResults(results);
  });

  net.on('new_round_started', ({ round, maxRounds, players }) => {
    game.round = round;
    game.maxRounds = maxRounds;
    game.players = players;
    game.turnIndex = 0;
    game.setState('BOARD_TURN');
  });

  net.on('game_over', ({ players }) => {
    game.players = players;
    game.setState('GAME_OVER');
  });

  net.on('game_restarted', ({ room }) => {
    game.syncWithRoom(room, net.myPlayerIndex);
  });

  net.on('party_item_effect', (data) => {
    game.handlePartyItemEffect(data);
  });

  net.on('player_left', (data) => {
    game.handlePlayerLeft(data);
  });

  net.on('new_host', (data) => {
    game.handleNewHost(data);
  });

  function updateOnlineLobbySlots(room, isHost) {
    const slotsContainer = document.getElementById('online-slots-list');
    if (!slotsContainer || !room) return;
    slotsContainer.innerHTML = '';

    const maxPlayers = room.maxPlayers || 4;
    const enableBots = (room.enableBots !== false);
    const humanPlayers = (room.players || []).filter(p => p.type === 'human_online' && p.socketId);
    const humanCount = humanPlayers.length;

    // Badges oben in der Raum-Lobby aktualisieren
    const badgePlayers = document.getElementById('lobby-player-count-badge');
    if (badgePlayers) {
      badgePlayers.textContent = `👥 ${humanCount} / ${maxPlayers} Spieler`;
    }

    const badgeBots = document.getElementById('lobby-bots-badge');
    if (badgeBots) {
      if (!enableBots) {
        badgeBots.textContent = '🤖 Bots: AUS (Nur Menschen)';
        badgeBots.className = 'px-2.5 py-1 rounded-lg text-xs font-black bg-rose-950 text-rose-300 border border-rose-600';
      } else {
        const botCount = (room.botCount !== undefined) ? room.botCount : Math.max(0, maxPlayers - humanCount);
        badgeBots.textContent = `🤖 Bots: EIN (+${botCount} Bots)`;
        badgeBots.className = 'px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-600';
      }
    }

    const badgeBoard = document.getElementById('lobby-board-badge');
    if (badgeBoard) {
      badgeBoard.textContent = (room.boardId === 'board_classic') ? '🗺️ 5 Inselwelten (Klassisch)' : '🗺️ Spielbrett 1 (Vier Welten)';
    }

    // Start-Button Validierung & Hinweistext
    const btnStart = document.getElementById('btn-start-online-game');
    const startHint = document.getElementById('start-game-hint');
    if (btnStart) {
      if (!enableBots) {
        // Wenn AUS (false): Es werden keinerlei KI-Gegner generiert. Mindestens 2 menschliche Spieler erforderlich!
        if (humanCount >= 2) {
          btnStart.disabled = false;
          btnStart.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          btnStart.classList.add('cursor-pointer');
          if (startHint) startHint.textContent = `Bereit! ${humanCount} menschliche Spieler online.`;
        } else {
          btnStart.disabled = true;
          btnStart.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          btnStart.classList.remove('cursor-pointer');
          if (startHint) startHint.textContent = 'Mindestens 2 menschliche Spieler erforderlich (oder aktiviere Bots).';
        }
      } else {
        // Wenn EIN (true): Kann auch mit 1 Mensch + X Bots starten
        const total = humanCount + ((room.botCount !== undefined) ? room.botCount : Math.max(0, maxPlayers - humanCount));
        if (total >= 2) {
          btnStart.disabled = false;
          btnStart.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          btnStart.classList.add('cursor-pointer');
          if (startHint) startHint.textContent = `Bereit! Spiel startet mit ${humanCount} Spieler(n) + Bots.`;
        } else {
          btnStart.disabled = true;
          btnStart.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
          btnStart.classList.remove('cursor-pointer');
          if (startHint) startHint.textContent = 'Mindestens 2 Teilnehmer (Spieler + Bots) erforderlich.';
        }
      }
    }

    const btnToggleTeamMode = document.getElementById('btn-toggle-team-mode');
    const teamModeLabel = document.getElementById('team-mode-label');
    if (teamModeLabel && typeof room.isTeamMode === 'boolean') {
      onlineTeamMode = room.isTeamMode;
      teamModeLabel.textContent = room.isTeamMode
        ? 'Team-Modus: AN (2er-Teams)'
        : 'Team-Modus: AUS (Einzelspieler)';
      if (btnToggleTeamMode) {
        btnToggleTeamMode.className = room.isTeamMode
          ? 'px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 border-2 border-yellow-400 shadow-lg shadow-purple-600/40 transition active:scale-95 animate-pulse'
          : 'px-4 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 border border-purple-400 shadow transition active:scale-95';
        btnToggleTeamMode.style.display = isHost ? 'flex' : 'none';
      }
    }

    // Spieler-Slots rendern
    if (!enableBots) {
      // Wenn Bots AUS: Rendere die menschlichen Spieler und offene Einlade-Plätze bis maxPlayers
      for (let i = 0; i < maxPlayers; i++) {
        const human = humanPlayers[i];
        if (human) {
          const isMe = (human.socketId === net.socket?.id || i === net.myPlayerIndex);
          const isHostPlayer = (i === 0);
          const charObj = (window.characterRegistry && human.archetype) ? window.characterRegistry.getById(human.archetype) : null;
          const avatarSrc = human.avatar || (charObj ? charObj.avatar : 'assets/avatars/char1_pc_schrauber.png');

          const slotCard = document.createElement('div');
          slotCard.className = `flex items-center justify-between p-3.5 rounded-2xl border transition shadow-md ${
            isMe ? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-800/70 border-slate-700'
          }`;

          slotCard.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="relative w-12 h-12 rounded-xl border-2 overflow-hidden flex-shrink-0 shadow bg-slate-950 flex items-center justify-center" style="border-color: ${human.color}">
                <img src="${avatarSrc}" alt="${human.name}" class="w-full h-full object-cover">
                <span class="absolute -bottom-1 -right-1 text-[8px] px-1 rounded-full font-black text-white bg-slate-900 border" style="border-color: ${human.color}">P${i + 1}</span>
              </div>
              <div>
                <div class="font-extrabold text-sm text-white flex items-center gap-2">
                  <span class="truncate max-w-[140px]">${human.name}</span>
                  ${isMe ? '<span class="px-2 py-0.5 rounded text-[10px] bg-yellow-400 text-slate-950 font-black shadow animate-pulse">DU</span>' : ''}
                  ${isHostPlayer ? '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black shadow">HOST</span>' : '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-600">Online</span>'}
                </div>
                <div class="text-xs text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span class="text-amber-300 font-bold">${charObj ? charObj.name : (human.archetype || 'Held')}</span>
                  <span class="text-slate-500">•</span>
                  <span class="text-slate-400">${human.colorName}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-xs font-bold text-emerald-400 flex items-center gap-1">● Bereit</span>
            </div>
          `;
          slotsContainer.appendChild(slotCard);
        } else {
          // Offener Platz
          const emptyCard = document.createElement('div');
          emptyCard.className = 'flex items-center justify-between p-3.5 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-900/40 text-slate-400';
          emptyCard.innerHTML = `
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl border border-dashed border-slate-600/70 flex items-center justify-center text-xl text-slate-500 bg-slate-950/40">
                👤
              </div>
              <div>
                <div class="font-bold text-xs text-slate-300">Freier Spieler-Platz (Slot ${i + 1})</div>
                <div class="text-[11px] text-slate-500 font-sans">Wartet auf Klassenkamerad per Link...</div>
              </div>
            </div>
            <span class="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-mono">Offen</span>
          `;
          slotsContainer.appendChild(emptyCard);
        }
      }
    } else {
      // Wenn Bots EIN: Zeige Slots bis maxPlayers
      const slotsToShow = (room.players || []).slice(0, maxPlayers);
      slotsToShow.forEach((p, idx) => {
        const isMe = (idx === net.myPlayerIndex);
        const isHostPlayer = (idx === 0);
        const charObj = (window.characterRegistry && p.archetype) ? window.characterRegistry.getById(p.archetype) : null;
        const avatarSrc = p.avatar || (charObj ? charObj.avatar : 'assets/avatars/char1_pc_schrauber.png');

        const slotCard = document.createElement('div');
        slotCard.className = `flex items-center justify-between p-3.5 rounded-2xl border transition shadow-md ${
          isMe ? 'bg-slate-800/95 border-amber-400 ring-2 ring-amber-400/30' : 'bg-slate-800/70 border-slate-700'
        }`;

        let typeBadge = '';
        if (isHostPlayer) {
          typeBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-black shadow">HOST</span>';
        } else if (p.type === 'human_online') {
          typeBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 font-bold border border-emerald-600">Online</span>';
        } else {
          typeBadge = '<span class="px-2 py-0.5 rounded text-[10px] bg-slate-700 text-slate-300 font-bold">Bot</span>';
        }

        const teamDetails = room.isTeamMode
          ? `<div class="text-[11px] text-purple-300 font-semibold mt-0.5">👥 A: ${p.playerA || p.name} & B: ${p.playerB || 'Spieler ' + (idx + 1) + 'B'}</div>`
          : '';

        slotCard.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="relative w-12 h-12 rounded-xl border-2 overflow-hidden flex-shrink-0 shadow bg-slate-950 flex items-center justify-center" style="border-color: ${p.color}">
              <img src="${avatarSrc}" alt="${p.name}" class="w-full h-full object-cover">
              <span class="absolute -bottom-1 -right-1 text-[8px] px-1 rounded-full font-black text-white bg-slate-900 border" style="border-color: ${p.color}">P${idx + 1}</span>
            </div>
            <div>
              <div class="font-extrabold text-sm text-white flex items-center gap-2">
                <span class="truncate max-w-[120px] sm:max-w-[180px]">${p.name}</span>
                ${isMe ? '<span class="px-2 py-0.5 rounded text-[10px] bg-yellow-400 text-slate-950 font-black shadow animate-pulse">DU</span>' : ''}
                ${typeBadge}
              </div>
              <div class="text-xs text-slate-300 font-semibold flex items-center gap-1.5 mt-0.5">
                <span class="text-amber-300 font-bold">${charObj ? charObj.name : (p.archetype || 'Held')}</span>
                <span class="text-slate-500">•</span>
                <span class="text-slate-400">${p.colorName}</span>
              </div>
              ${teamDetails}
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            ${
              isHost && idx !== 0
                ? `<button class="btn-toggle-slot text-xs px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 transition font-bold" data-slot="${idx}">
                    ${p.type === 'bot' ? 'Als Mensch' : 'Als Bot'}
                  </button>`
                : ''
            }
          </div>
        `;
        slotsContainer.appendChild(slotCard);
      });
    }

    if (isHost) {
      document.querySelectorAll('.btn-toggle-slot').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const slot = parseInt(e.target.dataset.slot, 10);
          const current = room.players[slot].type;
          const newType = current === 'bot' ? 'human_online' : 'bot';
          net.updateSlot(slot, newType);
        });
      });
    }
  }

  // --- CONFIGURABLE KEYBOARD CONTROLS SYSTEM ---
  const STORAGE_KEY = 'classParty_keybindings';

  const DEFAULT_KEYBINDINGS = [
    // Player 1 (Rot)
    { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', action: 'Space' },
    // Player 2 (Blau)
    { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', action: 'Enter' },
    // Player 3 (Grün)
    { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL', action: 'KeyU' },
    // Player 4 (Gelb)
    { up: 'Numpad8', down: 'Numpad5', left: 'Numpad4', right: 'Numpad6', action: 'Numpad0' },
    // Player 5 (Lila)
    { up: 'KeyT', down: 'KeyG', left: 'KeyF', right: 'KeyH', action: 'KeyY' },
    // Player 6 (Orange)
    { up: 'KeyP', down: 'Semicolon', left: 'KeyL', right: 'Quote', action: 'BracketRight' },
    // Player 7 (Cyan)
    { up: 'Numpad9', down: 'Numpad3', left: 'Numpad1', right: 'Numpad7', action: 'NumpadDecimal' },
    // Player 8 (Pink)
    { up: 'KeyC', down: 'KeyB', left: 'KeyV', right: 'KeyN', action: 'KeyM' }
  ];

  let currentKeybindings = JSON.parse(JSON.stringify(DEFAULT_KEYBINDINGS));

  function loadKeybindings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 4) {
          currentKeybindings = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load keybindings from localStorage', e);
    }
  }

  function saveKeybindings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentKeybindings));
    } catch (e) {
      console.warn('Could not save keybindings to localStorage', e);
    }
  }

  loadKeybindings();

  // Helper to format keyCode for human-friendly display
  function formatKeyCode(code) {
    if (!code) return '—';
    if (code.startsWith('Key')) return code.substring(3);
    if (code.startsWith('Digit')) return code.substring(5);
    if (code.startsWith('Numpad')) return 'NUM ' + code.substring(6);
    if (code === 'ArrowUp') return '↑';
    if (code === 'ArrowDown') return '↓';
    if (code === 'ArrowLeft') return '←';
    if (code === 'ArrowRight') return '→';
    if (code === 'Space') return 'SPACE';
    if (code === 'Enter') return 'ENTER';
    if (code === 'ShiftLeft') return 'L-SHIFT';
    if (code === 'ShiftRight') return 'R-SHIFT';
    if (code === 'ControlLeft') return 'L-CTRL';
    if (code === 'ControlRight') return 'R-CTRL';
    return code;
  }

  // Conflict detection
  function checkConflicts() {
    const counts = {};
    const conflicts = new Set();
    currentKeybindings.forEach(p => {
      ['up', 'down', 'left', 'right', 'action'].forEach(act => {
        const k = p[act];
        if (k) {
          counts[k] = (counts[k] || 0) + 1;
          if (counts[k] > 1) conflicts.add(k);
        }
      });
    });

    const warnBox = document.getElementById('key-conflict-warning');
    const warnText = document.getElementById('key-conflict-text');
    if (warnBox && warnText) {
      if (conflicts.size > 0) {
        const conflictKeys = Array.from(conflicts).map(formatKeyCode).join(', ');
        warnText.textContent = `Achtung: Taste(n) [${conflictKeys}] wird von mehreren Aktionen verwendet!`;
        warnBox.classList.remove('hidden');
      } else {
        warnBox.classList.add('hidden');
      }
    }
    return conflicts;
  }

  // Rebind UI state
  let listeningTarget = null; // { playerIndex, action, buttonEl }

  function renderKeybindingsTable() {
    const tbody = document.getElementById('keybindings-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const conflicts = checkConflicts();

    const playerMeta = [
      { name: 'Spieler 1 (Rot)', color: '#EF4444' },
      { name: 'Spieler 2 (Blau)', color: '#3B82F6' },
      { name: 'Spieler 3 (Grün)', color: '#10B981' },
      { name: 'Spieler 4 (Gelb)', color: '#F59E0B' }
    ];

    const actions = ['up', 'down', 'left', 'right', 'action'];

    currentKeybindings.forEach((pBindings, pIdx) => {
      const meta = playerMeta[pIdx];
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-800/40 transition';

      // Player column
      let html = `
        <td class="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
          <span class="w-3 h-3 rounded-full inline-block" style="background-color: ${meta.color}"></span>
          ${meta.name}
        </td>
      `;

      // 5 Action columns
      actions.forEach(act => {
        const code = pBindings[act];
        const isConflicted = conflicts.has(code);
        const isCurrentListening = listeningTarget && listeningTarget.playerIndex === pIdx && listeningTarget.action === act;

        const btnClass = isCurrentListening
          ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-300 ring-2 ring-yellow-400 animate-pulse'
          : isConflicted
            ? 'bg-amber-950/80 text-amber-200 border-amber-500 hover:bg-amber-900'
            : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700';

        const label = isCurrentListening ? 'Taste drücken...' : formatKeyCode(code);

        html += `
          <td class="py-2 px-3">
            <button class="btn-bind-key w-full py-1.5 px-2 rounded-lg border text-center transition font-mono text-xs ${btnClass}"
                    data-player="${pIdx}" data-action="${act}">
              ${label}
            </button>
          </td>
        `;
      });

      tr.innerHTML = html;
      tbody.appendChild(tr);
    });

    // Attach click listeners to all rebind buttons
    tbody.querySelectorAll('.btn-bind-key').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pIdx = parseInt(e.currentTarget.dataset.player, 10);
        const action = e.currentTarget.dataset.action;

        if (listeningTarget && listeningTarget.playerIndex === pIdx && listeningTarget.action === action) {
          listeningTarget = null;
          renderKeybindingsTable();
          return;
        }

        listeningTarget = { playerIndex: pIdx, action, buttonEl: e.currentTarget };
        renderKeybindingsTable();
      });
    });
  }

  // Window key capture for rebind mode
  window.addEventListener('keydown', (e) => {
    if (!listeningTarget) return;

    e.preventDefault();
    e.stopPropagation();

    // Escape cancels rebind
    if (e.code === 'Escape') {
      listeningTarget = null;
      renderKeybindingsTable();
      return;
    }

    const { playerIndex, action } = listeningTarget;
    currentKeybindings[playerIndex][action] = e.code;
    saveKeybindings();
    listeningTarget = null;
    renderKeybindingsTable();
  }, true);

  // Settings Modal Open/Close
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const btnResetKeybindings = document.getElementById('btn-reset-keybindings');

  if (btnOpenSettings && settingsModal) {
    btnOpenSettings.addEventListener('click', () => {
      listeningTarget = null;
      settingsModal.classList.remove('hidden');
      renderKeybindingsTable();
    });
  }

  if (btnCloseSettings && settingsModal) {
    btnCloseSettings.addEventListener('click', () => {
      listeningTarget = null;
      settingsModal.classList.add('hidden');
    });
  }

  if (btnSaveSettings && settingsModal) {
    btnSaveSettings.addEventListener('click', () => {
      listeningTarget = null;
      settingsModal.classList.add('hidden');
    });
  }

  if (btnResetKeybindings) {
    btnResetKeybindings.addEventListener('click', () => {
      currentKeybindings = JSON.parse(JSON.stringify(DEFAULT_KEYBINDINGS));
      saveKeybindings();
      listeningTarget = null;
      renderKeybindingsTable();
    });
  }

  // Quick Minigame Launcher Modal & Buttons
  const testMinigameModal = document.getElementById('test-minigame-modal');
  const btnQuickMinigames = document.getElementById('btn-quick-minigames');
  const btnCloseTestMinigames = document.getElementById('btn-close-test-minigames');

  if (btnQuickMinigames && testMinigameModal) {
    btnQuickMinigames.addEventListener('click', () => {
      testMinigameModal.classList.remove('hidden');
    });
  }

  if (btnCloseTestMinigames && testMinigameModal) {
    btnCloseTestMinigames.addEventListener('click', () => {
      testMinigameModal.classList.add('hidden');
    });
  }

  document.querySelectorAll('.btn-launch-minigame').forEach(btn => {
    btn.addEventListener('click', () => {
      const gameId = btn.dataset.minigame;
      if (testMinigameModal) testMinigameModal.classList.add('hidden');
      game.testMinigameDirectly(gameId);
    });
  });

  // Leave Game Confirmation Modal & Disconnect Logic
  const btnLeaveGame = document.getElementById('btn-leave-game');
  const leaveModal = document.getElementById('leave-confirm-modal');
  const btnCancelLeave = document.getElementById('btn-cancel-leave');
  const btnConfirmLeave = document.getElementById('btn-confirm-leave');

  if (btnLeaveGame && leaveModal) {
    btnLeaveGame.addEventListener('click', () => {
      leaveModal.classList.remove('hidden');
    });
  }

  if (btnCancelLeave && leaveModal) {
    btnCancelLeave.addEventListener('click', () => {
      leaveModal.classList.add('hidden');
    });
  }

  if (btnConfirmLeave && leaveModal) {
    btnConfirmLeave.addEventListener('click', () => {
      leaveModal.classList.add('hidden');
      try {
        localStorage.removeItem('class_party_active_room');
      } catch (e) {}
      clearRoomUrlParam();
      game.leaveGame();
    });
  }

  // Handle Gameplay Keyboard Inputs
  const handleKey = (code, isDown) => {
    // If user is currently rebinding a key, don't trigger game inputs
    if (listeningTarget) return;

    // Minigame Intro Phase - Pressing Space/Enter marks ready immediately
    if (game.state === 'MINIGAME_INTRO' && isDown && (code === 'Space' || code === 'Enter')) {
      const btnStart = document.getElementById('btn-start-minigame-now');
      if (btnStart) {
        btnStart.click();
        return;
      }
    }

    // Board phase & Action Modals: Space, Enter or player's action key
    if (game.state === 'BOARD_TURN' && isDown) {
      // 1. Modals interaction with Space/Enter
      if (code === 'Space' || code === 'Enter') {
        const rouletteModal = document.getElementById('roulette-modal');
        if (rouletteModal && !rouletteModal.classList.contains('hidden')) {
          const btnStop = document.getElementById('btn-stop-roulette');
          if (btnStop && !btnStop.disabled) {
            btnStop.click();
            return;
          }
        }

        const duelModal = document.getElementById('duel-modal');
        if (duelModal && !duelModal.classList.contains('hidden')) {
          const btnStrike = document.getElementById('btn-duel-strike');
          if (btnStrike && !btnStrike.classList.contains('hidden')) {
            btnStrike.click();
            return;
          }
        }

        const bowserModal = document.getElementById('bowser-modal');
        if (bowserModal && !bowserModal.classList.contains('hidden')) {
          const btnBowserOk = document.getElementById('btn-bowser-ok');
          if (btnBowserOk && !btnBowserOk.classList.contains('hidden')) {
            btnBowserOk.click();
            return;
          }
        }
      }

      // 2. Normal Dice Roll
      const active = game.players[game.turnIndex];
      const isMyTurn = (game.isLocalMode && active && active.type === 'human_local') ||
                       (!game.isLocalMode && game.turnIndex === net.myPlayerIndex);
      if (isMyTurn) {
        const pBinding = currentKeybindings[game.turnIndex];
        const actionKey = pBinding ? pBinding.action : 'Space';
        if (code === actionKey || code === 'Space' || code === 'Enter') {
          game.executeDiceRoll();
          return;
        }
      }
    }

    // Minigame Play Phase
    if (game.state === 'MINIGAME_PLAY' && game.currentMinigameInstance) {
      if (game.isLocalMode) {
        // Check which player and action matches `code`
        currentKeybindings.forEach((pMap, pIdx) => {
          if (code === pMap.up) game.currentMinigameInstance.handleInput(pIdx, 'up', isDown);
          else if (code === pMap.down) game.currentMinigameInstance.handleInput(pIdx, 'down', isDown);
          else if (code === pMap.left) game.currentMinigameInstance.handleInput(pIdx, 'left', isDown);
          else if (code === pMap.right) game.currentMinigameInstance.handleInput(pIdx, 'right', isDown);
          else if (code === pMap.action) game.currentMinigameInstance.handleInput(pIdx, 'action', isDown);
        });
      } else {
        // Online mode: player controls their assigned slot
        let action = null;
        const myBindings = currentKeybindings[net.myPlayerIndex] || currentKeybindings[0];
        if (code === myBindings.up) action = 'up';
        else if (code === myBindings.down) action = 'down';
        else if (code === myBindings.left) action = 'left';
        else if (code === myBindings.right) action = 'right';
        else if (code === myBindings.action) action = 'action';

        // Fallbacks for online players if custom key not matching
        if (!action) {
          if (code === 'KeyW' || code === 'ArrowUp') action = 'up';
          if (code === 'KeyS' || code === 'ArrowDown') action = 'down';
          if (code === 'KeyA' || code === 'ArrowLeft') action = 'left';
          if (code === 'KeyD' || code === 'ArrowRight') action = 'right';
          if (code === 'Space' || code === 'Enter') action = 'action';
        }

        if (action) {
          game.currentMinigameInstance.handleInput(net.myPlayerIndex, action, isDown);
          net.sendMinigameAction(net.myPlayerIndex, { action, isDown });
        }
      }
    }
  };

  window.addEventListener('keydown', (e) => {
    if (listeningTarget) return; // Handled by rebind listener
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault(); // Prevent page scroll
    }
    handleKey(e.code, true);
  });

  window.addEventListener('keyup', (e) => {
    if (listeningTarget) return;
    handleKey(e.code, false);
  });
});
