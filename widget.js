// widget-chat.js
(function () {
  if (window.__my_chat_widget_loaded) return;
  window.__my_chat_widget_loaded = true;

  // ---------- Styles (injected) ----------
  const style = document.createElement('style');
  style.textContent = `
  :root {
    --chat-accent: #0b84ff;
    --chat-bg: #ffffff;
    --chat-text: #0f1724;
    --chat-muted: #6b7280;
    --chat-shadow: 0 10px 30px rgba(2,6,23,0.12);
    --chat-radius: 14px;
    --z-widget: 999999;
    --glass: rgba(255,255,255,0.85);
  }

  .mychat-wrapper { position: fixed; right: 20px; bottom: 20px; z-index: var(--z-widget); font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
  .mychat-fab {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg,var(--chat-accent) 0%, #0066f0 100%);
    color: #fff; border: none; cursor: pointer;
    box-shadow: 0 6px 20px rgba(11,132,255,0.28);
    display: inline-flex; align-items: center; justify-content: center;
    font-weight: 600; font-size: 15px;
    transition: transform .18s ease, box-shadow .18s ease, opacity .18s ease;
  }
  .mychat-fab:active { transform: scale(.96); }
  .mychat-panel {
    width: 360px; max-width: calc(100vw - 40px);
    height: 520px; max-height: calc(100vh - 120px);
    background: var(--chat-bg); color: var(--chat-text);
    border-radius: var(--chat-radius); box-shadow: var(--chat-shadow);
    overflow: hidden; display: flex; flex-direction: column;
    transform-origin: bottom right;
    animation: panelIn .16s cubic-bezier(.2,.9,.3,1);
  }
  @keyframes panelIn { from { opacity: 0; transform: translateY(12px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

  .mychat-header {
    padding: 12px 14px; display: flex; align-items: center; gap: 10px;
    border-bottom: 1px solid #eef2f7; background: linear-gradient(180deg,var(--glass), rgba(255,255,255,0.9));
    backdrop-filter: blur(6px);
  }
  .mychat-title { font-weight: 700; font-size: 15px; }
  .mychat-sub { font-size: 12px; color: var(--chat-muted); margin-top: 2px; }
  .mychat-header .spacer { flex: 1; }

  .mychat-close, .mychat-min {
    background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 8px;
    display:inline-flex; align-items:center; justify-content:center;
  }
  .mychat-close:hover, .mychat-min:hover { background: rgba(0,0,0,0.04); }

  .mychat-body { padding: 12px; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .mychat-msg { max-width: 82%; padding: 10px 12px; border-radius: 12px; font-size: 14px; line-height: 1.35; box-shadow: 0 1px 0 rgba(11,20,34,0.03); }
  .mychat-msg.user { margin-left: auto; background: linear-gradient(180deg,#0b84ff,#0066f0); color: white; border-bottom-right-radius: 6px; }
  .mychat-msg.bot { background: #f6f8fb; color: var(--chat-text); border-bottom-left-radius: 6px; }
  .mychat-meta { font-size: 11px; color: var(--chat-muted); margin-top: 4px; }

  .mychat-input-area {
    padding: 10px; border-top: 1px solid #eef2f7; background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.98));
    display: flex; gap: 8px; align-items: center;
  }
  .mychat-input {
    flex: 1; min-height: 40px; max-height: 120px;
    padding: 10px 12px; border-radius: 12px; border: 1px solid #e6eefc; outline: none;
    resize: none; font-size: 14px; line-height: 1.3; background: #fff;
    box-shadow: inset 0 1px 0 rgba(11,20,34,0.02);
  }
  .mychat-send {
    background: var(--chat-accent); color: white; border: none; padding: 10px 14px; border-radius: 10px; cursor: pointer;
    font-weight: 600; box-shadow: 0 6px 18px rgba(11,132,255,0.14);
  }
  .mychat-send:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }

  /* Floating container when panel hidden (keeps fab + optional badge) */
  .mychat-container { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }

  /* Small screen adjustments */
  @media (max-width: 420px) {
    .mychat-panel { width: calc(100vw - 28px); height: calc(70vh); right: 14px; bottom: 14px; border-radius: 12px; }
    .mychat-fab { width: 56px; height: 56px; }
  }
  `;
  document.head.appendChild(style);

  // ---------- Elements ----------
  const wrapper = document.createElement('div');
  wrapper.className = 'mychat-wrapper';

  const container = document.createElement('div');
  container.className = 'mychat-container';

  // Floating button (FAB)
  const fab = document.createElement('button');
  fab.className = 'mychat-fab';
  fab.setAttribute('aria-label', 'Open chat');
  fab.title = 'Chat with us';
  fab.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white"/>
    </svg>
  `;

  // Panel (hidden initially)
  const panel = document.createElement('div');
  panel.className = 'mychat-panel';
  panel.style.display = 'none';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-hidden', 'true');

  // Header
  const header = document.createElement('div');
  header.className = 'mychat-header';
  header.innerHTML = `
    <div style="display:flex;flex-direction:column;">
      <div class="mychat-title">Helpful Bot</div>
      <div class="mychat-sub">Ask me anything — I'm friendly.</div>
    </div>
    <div class="spacer" style="flex:1"></div>
  `;
  // Minimize and close
  const minBtn = document.createElement('button');
  minBtn.className = 'mychat-min';
  minBtn.title = 'Minimize';
  minBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M6 12h12v2H6z" fill="#374151"/></svg>`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'mychat-close';
  closeBtn.title = 'Close';
  closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path d="M6 6l12 12M6 18L18 6" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  header.appendChild(minBtn);
  header.appendChild(closeBtn);

  // Body (messages)
  const body = document.createElement('div');
  body.className = 'mychat-body';
  body.setAttribute('aria-live', 'polite');

  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'mychat-input-area';
  const input = document.createElement('textarea');
  input.className = 'mychat-input';
  input.placeholder = 'Type a message...';
  input.rows = 1;
  input.setAttribute('aria-label', 'Type a message');

  const sendBtn = document.createElement('button');
  sendBtn.className = 'mychat-send';
  sendBtn.textContent = 'Send';
  sendBtn.disabled = true;

  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(inputArea);

  container.appendChild(fab);
  container.appendChild(panel);
  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  // ---------- Helpers ----------
  function appendMessage(text, who = 'bot') {
    const msgWrap = document.createElement('div');
    const msg = document.createElement('div');
    msg.className = 'mychat-msg ' + (who === 'user' ? 'user' : 'bot');
    msg.textContent = text;
    msgWrap.appendChild(msg);

    // timestamp/meta
    const meta = document.createElement('div');
    meta.className = 'mychat-meta';
    const now = new Date();
    meta.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgWrap.appendChild(meta);

    body.appendChild(msgWrap);
    body.scrollTop = body.scrollHeight;
  }

  function botReply(userText) {
    // very simple simulated reply — replace this with API calls if you want
    const safeText = String(userText || '').trim();
    setTimeout(() => {
      if (!safeText) {
        appendMessage("Hey — I didn't get that. Could you type something?", 'bot');
        return;
      }
      // simple canned responses for a nicer demo
      const lower = safeText.toLowerCase();
      if (lower.includes('hello') || lower.includes('hi')) {
        appendMessage("Hi there! 👋 How can I help you today?", 'bot');
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('pricing')) {
        appendMessage("Pricing depends on your needs — tell me what you'd like and I'll give a quick estimate.", 'bot');
      } else if (lower.includes('thanks') || lower.includes('thank')) {
        appendMessage("You're welcome! If there's anything else, just ask.", 'bot');
      } else {
        // a short "typing" illusion
        const dot = document.createElement('div');
        dot.className = 'mychat-msg bot';
        dot.textContent = '…';
        body.appendChild(dot);
        body.scrollTop = body.scrollHeight;
        setTimeout(() => {
          // remove the dot
          if (dot && dot.parentNode) dot.parentNode.removeChild(dot);
          // generic reply
          appendMessage("Nice question — I'm a demo bot. To connect to a real assistant, swap `botReply()` with an API call.", 'bot');
        }, 800 + Math.random() * 700);
      }
    }, 300 + Math.random() * 400);
  }

  function openPanel() {
    panel.style.display = 'flex';
    panel.setAttribute('aria-hidden', 'false');
    // focus input after open
    setTimeout(() => input.focus(), 180);
  }

  function closePanel() {
    panel.style.display = 'none';
    panel.setAttribute('aria-hidden', 'true');
    fab.focus();
  }

  function togglePanel() {
    if (panel.style.display === 'none' || panel.style.display === '') {
      openPanel();
    } else {
      closePanel();
    }
  }

  // ---------- Initial sample greeting ----------
  // Keep a friendly first message ready, but show when panel opens
  let greeted = false;
  function maybeGreet() {
    if (!greeted) {
      appendMessage("Hello! I'm your helpful widget. Ask me anything.", 'bot');
      greeted = true;
    }
  }

  // ---------- Events ----------
  fab.addEventListener('click', () => {
    togglePanel();
    if (panel.style.display !== 'none') maybeGreet();
  });

  closeBtn.addEventListener('click', () => {
    closePanel();
  });

  minBtn.addEventListener('click', () => {
    // minimize -> hide panel (but keep fab)
    closePanel();
  });

  // Enable send when there is text
  function refreshSendState() {
    sendBtn.disabled = !input.value.trim();
  }
  input.addEventListener('input', refreshSendState);

  // Pressing Enter (without Shift) sends
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      if (input.value.trim()) doSend();
    }
  });

  sendBtn.addEventListener('click', doSend);

  function doSend() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    refreshSendState();
    body.scrollTop = body.scrollHeight;
    botReply(text);
  }

  // Accessibility: close when Escape pressed and panel open
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && panel.style.display !== 'none') {
      closePanel();
    }
  });

  // If widget is injected after page load, ensure body exists
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // no-op (structure already appended)
    });
  }

  // Quick performance: low-priority greeting after a few seconds (if page still open)
  setTimeout(() => {
    // only greet if panel visible or if you want a subtle indicator (we just keep ready)
    // For now we won't auto-open, but we prepare greeting content so it shows on first open.
    // maybeGreet();
  }, 6000);

  // ---------- Clean up if the site unloads (prevent leaks on SPA route changes) ----------
  window.addEventListener('beforeunload', () => {
    try { document.head.removeChild(style); } catch(e){}
  });

})();

