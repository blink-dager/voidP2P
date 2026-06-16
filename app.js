/* ── VoidChat — P2P Anonymous Chat ── */

const $ = id => document.getElementById(id);

// ── Screens
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

// ── State
let peer = null;
let conn = null;

// ── Routing
const params = new URLSearchParams(location.search);
const roomId = params.get('room');

if (roomId) {
  showScreen('chat');
  joinRoom(roomId);
} else {
  showScreen('home');
}

// ── Home screen
$('btn-create').addEventListener('click', createRoom);

// ── Copy button
$('btn-copy').addEventListener('click', () => {
  navigator.clipboard.writeText($('invite-link').value).then(() => {
    const btn = $('btn-copy');
    btn.classList.add('copied');
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    }, 2000);
  });
});

// ── Textarea: auto-resize + send on Enter
const msgInput = $('msg-input');
msgInput.addEventListener('input', () => {
  msgInput.style.height = 'auto';
  msgInput.style.height = Math.min(msgInput.scrollHeight, 120) + 'px';
});
msgInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
});
$('btn-send').addEventListener('click', sendMessage);

// ── CREATE (host)
function createRoom() {
  peer = newPeer();
  peer.on('open', id => {
    const link = `${location.origin}${location.pathname}?room=${id}`;
    $('invite-link').value = link;
    showScreen('waiting');
  });
  peer.on('connection', incoming => {
    conn = incoming;
    $('waiting-status').textContent = 'Contact found, connecting…';
    setupConn();
  });
  peer.on('error', handlePeerError);
}

// ── JOIN (guest)
function joinRoom(id) {
  peer = newPeer();
  peer.on('open', () => {
    conn = peer.connect(id, { reliable: true });
    setupConn();
  });
  peer.on('error', handlePeerError);
}

function newPeer() {
  return new Peer(undefined, { debug: 0 });
}

// ── Wire connection events
function setupConn() {
  conn.on('open', () => {
    showScreen('chat');
    setConnStatus(true);
    $('btn-send').disabled = false;
    msgInput.focus();
    appendSystem('You\'re connected. This conversation is end-to-end encrypted.');
  });
  conn.on('data', data => {
    if (data?.type === 'msg') appendMessage('them', data.text, data.time);
  });
  conn.on('close', onDisconnect);
  conn.on('error', onDisconnect);
}

// ── SEND
function sendMessage() {
  const text = msgInput.value.trim();
  if (!text || !conn?.open) return;
  const time = nowTime();
  conn.send({ type: 'msg', text, time });
  appendMessage('me', text, time);
  msgInput.value = '';
  msgInput.style.height = 'auto';
}

// ── Render a message bubble
function appendMessage(side, text, time) {
  const msgs = $('messages');

  // check if we should merge with previous bubble (same sender, no big gap)
  const last = msgs.querySelector('.msg:last-child');
  const sameGroup = last && last.classList.contains(side);

  const wrap = document.createElement('div');
  wrap.className = `msg ${side}`;

  if (!sameGroup) {
    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    meta.textContent = side === 'me' ? `You · ${time}` : `Contact · ${time}`;
    wrap.appendChild(meta);
  }

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  wrap.appendChild(bubble);

  msgs.appendChild(wrap);
  scrollDown();
}

// ── System / notice messages
function appendSystem(text) {
  const el = document.createElement('div');
  el.className = 'msg-notice';
  el.textContent = text;
  $('messages').appendChild(el);
  scrollDown();
}

function scrollDown() {
  const m = $('messages');
  m.scrollTop = m.scrollHeight;
}

// ── Disconnect
function onDisconnect() {
  setConnStatus(false);
  $('btn-send').disabled = true;
  appendSystem('Contact left the chat. Connection closed.');
}

function setConnStatus(online) {
  const el = $('conn-status');
  el.classList.toggle('connected', online);
  el.classList.toggle('disconnected', !online);
  $('conn-label').textContent = online ? 'Connected' : 'Disconnected';
}

// ── Errors
function handlePeerError(err) {
  console.error('PeerJS:', err);
  if (err.type === 'peer-unavailable') {
    showScreen('chat');
    setConnStatus(false);
    appendSystem('Room not found. The link may have expired.');
  }
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
