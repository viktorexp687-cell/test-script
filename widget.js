(function () {
  if (window.__center_chat_loaded) return;
  window.__center_chat_loaded = true;

  // ---------- Стили ----------
  const style = document.createElement('style');
  style.textContent = `
  :root {
    --cc-accent: #007aff;
    --cc-bg: #ffffff;
    --cc-text: #0f1724;
    --cc-muted: #6b7280;
    --cc-shadow: 0 10px 30px rgba(0,0,0,0.08);
    --cc-radius: 16px;
    --z-chat: 999999;
  }
  .cc-wrapper{position:fixed;right:24px;bottom:24px;z-index:var(--z-chat);font-family:'Inter',system-ui;}
  .cc-fab{width:64px;height:64px;border-radius:50%;border:none;background:linear-gradient(135deg,#007aff,#005fd4);
    color:#fff;box-shadow:0 6px 20px rgba(0,122,255,0.25);display:flex;align-items:center;justify-content:center;
    cursor:pointer;font-size:18px;transition:transform .2s ease,box-shadow .2s ease;}
  .cc-fab:hover{transform:scale(1.05);box-shadow:0 8px 24px rgba(0,122,255,0.32);}
  .cc-panel{width:380px;max-width:calc(100vw - 40px);height:560px;max-height:calc(100vh - 120px);
    background:var(--cc-bg);color:var(--cc-text);border-radius:var(--cc-radius);box-shadow:var(--cc-shadow);
    overflow:hidden;display:none;flex-direction:column;animation:fadeIn .2s ease;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  .cc-header{background:linear-gradient(180deg,#f8fbff,#eef4ff);border-bottom:1px solid #e3ebf9;
    padding:16px 18px;display:flex;align-items:center;}
  .cc-header-logo{font-weight:700;font-size:16px;color:var(--cc-accent);}
  .cc-header-text{margin-left:10px;}
  .cc-header-title{font-weight:700;font-size:15px;}
  .cc-header-sub{font-size:12px;color:var(--cc-muted);margin-top:2px;}
  .cc-body{flex:1;padding:14px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:#f9fafc;}
  .cc-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.35;}
  .cc-msg.bot{background:#fff;border:1px solid #e3ebf9;color:var(--cc-text);border-bottom-left-radius:6px;}
  .cc-msg.user{background:var(--cc-accent);color:#fff;margin-left:auto;border-bottom-right-radius:6px;}
  .cc-meta{font-size:11px;color:var(--cc-muted);margin-top:3px;}
  .cc-input-area{border-top:1px solid #e3ebf9;background:#fff;padding:10px;display:flex;gap:8px;}
  .cc-input{flex:1;border:1px solid #dce5f7;border-radius:12px;padding:10px 12px;font-size:14px;outline:none;resize:none;}
  .cc-send{background:var(--cc-accent);color:white;border:none;border-radius:10px;padding:10px 16px;font-weight:600;cursor:pointer;}
  .cc-send:disabled{opacity:.5;cursor:not-allowed;}
  @media(max-width:420px){.cc-panel{width:calc(100vw - 24px);height:70vh;}.cc-fab{width:56px;height:56px;}}
  `;
  document.head.appendChild(style);

  // ---------- Элементы ----------
  const wrapper=document.createElement('div');
  wrapper.className='cc-wrapper';
  const fab=document.createElement('button');
  fab.className='cc-fab';
  fab.innerHTML=`<svg width="26" height="26" fill="none" viewBox="0 0 24 24">
  <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white"/></svg>`;
  const panel=document.createElement('div');
  panel.className='cc-panel';
  panel.setAttribute('aria-hidden','true');
  const header=document.createElement('div');
  header.className='cc-header';
  header.innerHTML=`<div class="cc-header-logo">Center Cruises</div>
    <div class="cc-header-text">
      <div class="cc-header-title">Чат с нами</div>
      <div class="cc-header-sub">Мы здесь чтобы ответить на любые вопросы<br>и помочь подобрать круиз</div>
    </div>`;
  const body=document.createElement('div');
  body.className='cc-body';
  const inputArea=document.createElement('div');
  inputArea.className='cc-input-area';
  const input=document.createElement('textarea');
  input.className='cc-input';
  input.placeholder='Введите сообщение...';
  const sendBtn=document.createElement('button');
  sendBtn.className='cc-send';
  sendBtn.textContent='Отправить';
  sendBtn.disabled=true;
  inputArea.append(input,sendBtn);
  panel.append(header,body,inputArea);
  wrapper.append(fab,panel);
  document.body.append(wrapper);

  // ---------- Логика ----------
  let userEmail=null,greeted=false;
  function appendMessage(text,who='bot'){
    const w=document.createElement('div'),m=document.createElement('div');
    m.className='cc-msg '+who;m.textContent=text;w.append(m);
    const meta=document.createElement('div');meta.className='cc-meta';
    meta.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    w.append(meta);body.append(w);body.scrollTop=body.scrollHeight;
  }

  function askEmail(){
    appendMessage('Добро пожаловать в наш чатбот! Перед началом чата укажите, пожалуйста, имейл — это поможет улучшить нашу работу.','bot');
    const box=document.createElement('div');
    box.style.marginTop='10px';
    box.innerHTML=`<input type="email" placeholder="eg. john@gmail.com" id="cc-email-input"
      style="width:100%;padding:10px;border-radius:10px;border:1px solid #dce5f7;font-size:14px;">
      <button id="cc-email-btn" style="margin-top:8px;width:100%;padding:10px 0;border:none;border-radius:10px;
      background:var(--cc-accent);color:white;font-weight:600;cursor:pointer;">Продолжить</button>`;
    body.append(box);body.scrollTop=body.scrollHeight;
    const emailInput=box.querySelector('#cc-email-input');
    const emailBtn=box.querySelector('#cc-email-btn');
    emailBtn.addEventListener('click',()=>{
      const val=emailInput.value.trim();
      if(!/^[\\w.-]+@[\\w.-]+\\.\\w+$/.test(val)){alert('Введите корректный e-mail');return;}
      userEmail=val;box.remove();
      appendMessage('Спасибо! Теперь вы можете задать свой вопрос.','bot');
    });
  }

  function botReply(txt){
    if(!userEmail){appendMessage('Пожалуйста, укажите e-mail перед началом чата.','bot');return;}
    const lower=txt.toLowerCase();
    setTimeout(()=>{
      if(lower.includes('привет')) appendMessage('Здравствуйте! Чем могу помочь?','bot');
      else if(lower.includes('круиз')) appendMessage('Мы подберем для вас идеальный круиз 🌊 Уточните направление или даты.','bot');
      else appendMessage('Спасибо! Наш менеджер свяжется с вами в ближайшее время.','bot');
    },400);
  }

  function refresh(){sendBtn.disabled=!input.value.trim();}
  input.addEventListener('input',refresh);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();if(input.value.trim())send();}});
  sendBtn.addEventListener('click',send);

  function send(){
    const t=input.value.trim();if(!t)return;
    appendMessage(t,'user');input.value='';refresh();botReply(t);
  }

  function openPanel(){
    panel.style.display='flex';panel.setAttribute('aria-hidden','false');
    if(!greeted){greeted=true;setTimeout(askEmail,200);}
    setTimeout(()=>input.focus(),250);
  }
  function closePanel(){panel.style.display='none';panel.setAttribute('aria-hidden','true');}

  fab.addEventListener('click',()=>{(panel.style.display==='none'||panel.style.display==='')?openPanel():closePanel();});
})();
