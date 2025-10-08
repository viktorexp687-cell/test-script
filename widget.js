(function () {
  if (window.__center_chat_loaded) return;
  window.__center_chat_loaded = true;

  const style = document.createElement('style');
  style.textContent = `
  :root {
    --cc-blue: #00658f;
    --cc-bg: #ffffff;
    --cc-gray: #f6f8fb;
    --cc-text: #0f1724;
    --cc-muted: #6b7280;
    --cc-shadow: 0 10px 30px rgba(0,0,0,0.08);
    --cc-radius: 16px;
    --z-chat: 999999;
  }

  .cc-wrapper {
    position: fixed; right: 24px; bottom: 24px;
    z-index: var(--z-chat);
    font-family: 'Inter', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }

  .cc-fab {
    width: 64px; height: 64px;
    border-radius: 50%;
    border: none;
    background: var(--cc-blue);
    color: #fff;
    box-shadow: 0 6px 20px rgba(0,101,143,0.25);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: transform .2s ease;
  }
  .cc-fab:hover { transform: scale(1.05); }

  .cc-panel {
    width: 380px; max-width: calc(100vw - 40px);
    height: 560px; max-height: calc(100vh - 120px);
    background: var(--cc-bg);
    color: var(--cc-text);
    border-radius: var(--cc-radius);
    box-shadow: var(--cc-shadow);
    display: none; flex-direction: column; overflow: hidden;
    animation: fadeIn .2s ease;
  }

  @keyframes fadeIn { from {opacity: 0; transform: translateY(10px);} to {opacity: 1; transform: translateY(0);} }

  .cc-header {
    background: var(--cc-blue);
    color: white;
    padding: 18px 20px;
  }
  .cc-header-title { font-weight: 700; font-size: 17px; }
  .cc-header-sub { font-size: 13px; opacity: .9; margin-top: 4px; }

  .cc-body {
    flex: 1;
    background: #fff;
    padding: 14px;
    display: flex; flex-direction: column; gap: 10px;
    overflow-y: auto;
  }

  .cc-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.4; position: relative; }
  .cc-msg.bot { background: var(--cc-gray); color: var(--cc-text); border-bottom-left-radius: 6px; display: flex; align-items: flex-start; gap: 8px; }
  .cc-msg.bot::before {
    content: ''; width: 20px; height: 20px; flex-shrink: 0;
    background: url('https://cdn-icons-png.flaticon.com/512/869/869869.png') center/contain no-repeat;
    opacity: 0.6;
  }
  .cc-msg.user { background: var(--cc-blue); color: white; margin-left: auto; border-bottom-right-radius: 6px; }

  .cc-meta { font-size: 11px; color: var(--cc-muted); margin-top: 3px; }

  .cc-input-area {
    border-top: 1px solid #e3ebf9;
    background: #f9fafc;
    padding: 10px 14px;
    display: flex; align-items: center; gap: 8px;
  }

  .cc-input {
    flex: 1;
    border: none;
    border-radius: 20px;
    background: #fff;
    padding: 10px 16px;
    font-size: 14px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
    outline: none;
  }

  .cc-send {
    background: transparent;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity .2s ease;
  }
  .cc-send svg { width: 22px; height: 22px; fill: var(--cc-blue); }
  .cc-send:hover { opacity: 1; }

  @media(max-width:420px){
    .cc-panel { width: calc(100vw - 24px); height: 70vh; }
    .cc-fab { width: 56px; height: 56px; }
  }
  `;
  document.head.appendChild(style);

  // ---------- Elements ----------
  const wrapper = document.createElement('div');
  wrapper.className = 'cc-wrapper';

  const fab = document.createElement('button');
  fab.className = 'cc-fab';
  fab.innerHTML = `<svg width="28" height="28" fill="white" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

  const panel = document.createElement('div');
  panel.className = 'cc-panel';

  const header = document.createElement('div');
  header.className = 'cc-header';
  header.innerHTML = `
    <div class="cc-header-title">Чат с нами</div>
    <div class="cc-header-sub">Мы здесь чтобы ответить на любые вопросы<br>и помочь подобрать круиз</div>
  `;

  const body = document.createElement('div');
  body.className = 'cc-body';

  const inputArea = document.createElement('div');
  inputArea.className = 'cc-input-area';
  const input = document.createElement('input');
  input.className = 'cc-input';
  input.placeholder = 'Спросите что-нибудь';
  const sendBtn = document.createElement('button');
  sendBtn.className = 'cc-send';
  sendBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>`;
  inputArea.append(input, sendBtn);

  panel.append(header, body, inputArea);
  wrapper.append(fab, panel);
  document.body.append(wrapper);

  // ---------- Logic ----------
  let userEmail = null;
  let greeted = false;

  function appendMessage(text, who = 'bot') {
    const wrap = document.createElement('div');
    const msg = document.createElement('div');
    msg.className = 'cc-msg ' + who;
    msg.innerHTML = text;
    wrap.append(msg);
    body.append(wrap);
    body.scrollTop = body.scrollHeight;
  }

  function askEmail() {
    appendMessage('Добро пожаловать в наш чатбот !<br><br>Перед началом чата укажите пожалуйста имейл, это поможет улучшить нашу работу', 'bot');
    const box = document.createElement('div');
    box.innerHTML = `
      <input type="email" placeholder="eg.john@gmail.com" id="cc-email-input"
      style="margin-top:10px;width:100%;padding:10px 14px;border-radius:10px;border:1px solid #ddd;font-size:14px;">
      <button id="cc-email-btn" style="margin-top:8px;width:100%;padding:10px;border:none;border-radius:10px;
      background:var(--cc-blue);color:white;font-weight:600;cursor:pointer;">Продолжить</button>
    `;
    body.append(box);
    body.scrollTop = body.scrollHeight;

    const emailInput = box.querySelector('#cc-email-input');
    const emailBtn = box.querySelector('#cc-email-btn');
    emailBtn.addEventListener('click', () => {
      const val = emailInput.value.trim();
      if (!/^[\\w.-]+@[\\w.-]+\\.\\w+$/.test(val)) {
        alert('Введите корректный e-mail');
        return;
      }
      userEmail = val;
      box.remove();
      appendMessage('<span style="color:#6b7280;font-weight:600;">Center Cruises</span><br>Задайте свой вопрос', 'bot');
    });
  }

  function botReply(txt) {
    if (!userEmail) {
      appendMessage('Пожалуйста, укажите e-mail перед началом чата', 'bot');
      return;
    }
    const lower = txt.toLowerCase();
    setTimeout(() => {
      if (lower.includes('привет')) appendMessage('Здравствуйте! Чем могу помочь?', 'bot');
      else if (lower.includes('круиз')) appendMessage('Мы подберем для вас идеальный круиз 🌊', 'bot');
      else appendMessage('Спасибо! Наш менеджер скоро ответит.', 'bot');
    }, 400);
  }

  function sendMessage() {
    const txt = input.value.trim();
    if (!txt) return;
    appendMessage(txt, 'user');
    input.value = '';
    botReply(txt);
  }

  fab.addEventListener('click', () => {
    if (panel.style.display === 'flex') {
      panel.style.display = 'none';
    } else {
      panel.style.display = 'flex';
      if (!greeted) { greeted = true; setTimeout(askEmail, 200); }
    }
  });

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
  });

})();
