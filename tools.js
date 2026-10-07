import {doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
/* Goal tools: floating button -> Chatbot + Strategy Builder. Data is saved per account in Firestore: users/{uid}/data/* */
let db,u,root,cfg=null,chat=[],mem='',compacting=false,since=0,plan=null,busy=false;
const $=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const ref=n=>doc(db,'users',u.uid,'data',n);
const CSS=`
#tl{position:fixed;z-index:40;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));font-family:inherit}
#tl[hidden]{display:none}
#tlFab{width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;font-size:1.5rem;color:#fff;background:linear-gradient(135deg,#1e3a8a,#2563eb 45%,#22d3ee);box-shadow:0 0 28px #2563eb99;transition:.3s}
#tlFab:hover{transform:scale(1.1) rotate(8deg);box-shadow:0 0 38px #22d3eecc}
#tlMenu{position:absolute;right:0;bottom:70px;display:grid;gap:8px;width:max-content}
#tlMenu[hidden]{display:none}
#tlMenu button{cursor:pointer;text-align:left;padding:12px 18px;border-radius:14px;border:1px solid #12305c;background:#03060c;color:#e6f1ff;font:inherit;font-weight:600;box-shadow:0 8px 30px #000;transition:.25s;animation:tlin .25s both}
#tlMenu button:nth-child(2){animation-delay:.06s}
#tlMenu button:hover{border-color:#2563eb;transform:translateX(-4px);box-shadow:0 0 22px #2563eb66}
@keyframes tlin{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
#tlPanel{position:fixed;z-index:41;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));width:min(430px,calc(100vw - 24px));height:min(640px,calc(100dvh - 32px));display:flex;flex-direction:column;background:#02050b;border:1px solid #12305c;border-radius:20px;box-shadow:0 0 60px #000,0 0 40px #1d4ed844;overflow:hidden;color:#e6f1ff}
#tlPanel[hidden]{display:none}
@media (max-width:600px){#tlPanel{inset:0;width:100%;height:100dvh;border-radius:0;border:0}}
.tlh{display:flex;align-items:center;gap:10px;padding:max(12px,env(safe-area-inset-top)) 14px 12px;border-bottom:1px solid #10213a;background:linear-gradient(90deg,#0b1a33,#02050b)}
.tlh b{flex:1;font-size:1.05rem}
.tlh button,.tlb{cursor:pointer;border:1px solid #1d4ed8;background:#0b1a33;color:#fff;border-radius:99px;padding:7px 14px;font:inherit;font-size:.85rem;transition:.2s}
.tlh button:hover,.tlb:hover{box-shadow:0 0 16px #2563eb88}
.tlb.go{background:linear-gradient(135deg,#1e3a8a,#2563eb 45%,#22d3ee);border:0;font-weight:700;padding:11px 22px;font-size:.95rem}
.tlb.red{border-color:#7f1d1d;background:#1a0b0b;color:#fca5a5}
.tlbody{flex:1;overflow:auto;padding:14px;-webkit-overflow-scrolling:touch}
.msg{max-width:88%;padding:10px 13px;margin-bottom:10px;border-radius:16px;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;font-size:.95rem;animation:tlin .25s both}
.msg.user{margin-left:auto;background:linear-gradient(135deg,#1e3a8a,#2563eb);border-bottom-right-radius:4px}
.msg.model{background:#05080f;border:1px solid #10213a;border-bottom-left-radius:4px}
.msg.sys{max-width:100%;text-align:center;color:#7d96b8;font-size:.85rem;background:none}
.tlin{display:flex;gap:8px;padding:10px 12px max(10px,env(safe-area-inset-bottom));border-top:1px solid #10213a}
.tlin textarea{flex:1;resize:none;max-height:110px;padding:11px 13px;border-radius:14px;border:1px solid #10213a;background:#000;color:#fff;font:inherit;font-size:16px}
.tlin textarea:focus,.tlfield:focus{outline:0;border-color:#2563eb;box-shadow:0 0 0 3px #2563eb44}
.tlin button{border:0;border-radius:14px;padding:0 18px;cursor:pointer;color:#fff;font-weight:700;background:linear-gradient(135deg,#1e3a8a,#2563eb 45%,#22d3ee)}
.tlin button:disabled{opacity:.5}
.tlg{margin:0 0 14px}.tlg h4{margin:0 0 8px;color:#93c5fd;display:flex;justify-content:space-between;align-items:center;font-size:.95rem}
.ck{display:flex;gap:10px;align-items:flex-start;padding:9px 11px;margin-bottom:6px;border:1px solid #10213a;border-radius:12px;background:#05080f;cursor:pointer;transition:.2s;font-size:.92rem}
.ck:hover{border-color:#2563eb;transform:translateX(3px)}
.ck input{margin-top:1px}
.ck.done span{text-decoration:line-through;color:#6b7f9c}
.tlfield{width:100%;padding:11px 13px;border-radius:12px;border:1px solid #10213a;background:#000;color:#fff;font:inherit;font-size:16px;margin:6px 0 14px}
.bar{height:8px;border-radius:9px;background:#0b1a33;overflow:hidden;margin:6px 0 14px}
.bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2563eb,#22d3ee);transition:width .4s}
.tln{color:#7d96b8;font-size:.85rem;margin:0 0 12px}
.dayc{border:1px solid #10213a;border-radius:14px;padding:10px 12px;margin-bottom:10px;background:#03060c}
.dayc summary{cursor:pointer;font-weight:700;color:#93c5fd;margin-bottom:8px}
.dots span{display:inline-block;width:7px;height:7px;margin:0 2px;border-radius:50%;background:#22d3ee;animation:tld 1s infinite}
.dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
@keyframes tld{50%{opacity:.2;transform:translateY(-3px)}}`;

/* ---------- AI: free providers (Groq, Mistral, OpenRouter) with automatic fallback ----------
   The admin page stores: keys = [{p:'groq',k:'...'}], chain = [{p:'groq',m:'model'}, ...] (tried in order).
   Every provider/model has its own free quota, so when one is used up the site moves to the next. */
const PROV={
  groq:'https://api.groq.com/openai/v1/chat/completions',
  mistral:'https://api.mistral.ai/v1/chat/completions',
  openrouter:'https://openrouter.ai/api/v1/chat/completions'
};
const DEF_CHAIN=[['groq','llama-3.3-70b-versatile'],['groq','openai/gpt-oss-120b'],['mistral','mistral-small-latest'],['groq','meta-llama/llama-4-scout-17b-16e-instruct'],['openrouter','meta-llama/llama-3.3-70b-instruct:free'],['groq','llama-3.1-8b-instant']];
window.DEF_CHAIN=DEF_CHAIN;
const marks=()=>{try{return JSON.parse(localStorage.tlMarks||'{}')}catch(e){return{}}};
const setMark=(id,ms)=>{const m=marks(),n=Date.now();Object.keys(m).forEach(k=>{if(m[k]<n)delete m[k]});m[id]=n+ms;try{localStorage.tlMarks=JSON.stringify(m)}catch(e){}};
const waitMs=t=>{const m=t.match(/try again in ([\dhms.]+)/i);if(!m)return 0;let s=0;m[1].replace(/([\d.]+)ms/g,(_,n)=>(n/1000)+'s').replace(/([\d.]+)([hms])/g,(_,n,u)=>{s+=n*(u==='h'?3600:u==='m'?60:1)});return Math.min(s*1000+1000,2*3600e3)};
const normKeys=a=>(Array.isArray(a)?a:Object.values(a||{})).map(x=>{
    if(typeof x==='string'){const m=x.trim().match(/^(\S+)\s+(\S+)$/);return m?{p:m[1].toLowerCase(),k:m[2]}:null}
    if(!x||typeof x!=='object')return null;
    const k=(typeof x.k==='string'||typeof x.k==='number')?String(x.k).trim():'';
    return {p:String(x.p||'').toLowerCase(),k}}).filter(x=>x&&x.p&&x.k);
async function getCfg(){
  if(cfg)return cfg;
  try{const s=await getDoc(doc(db,'content','ai'));cfg=s.exists()?s.data():{}}catch(e){cfg={}}
  cfg.keys=normKeys(cfg.keys).filter(x=>PROV[x.p]);
  const ch=(cfg.chain||[]).filter(x=>x&&PROV[x.p]&&x.m);
  cfg.chain=ch.length?ch:DEF_CHAIN.map(([p,m])=>({p,m}));
  return cfg;
}
/* msgs = [{role:'user'|'assistant',content}] ; o = {max, t} ; returns reply text */
async function ai(msgs,system,o={}){
  const c=await getCfg();
  if(!c.keys.length)throw new Error('NOKEYS');
  while(msgs.length&&msgs[0].role!=='user')msgs=msgs.slice(1);
  const all=[{role:'system',content:system},...msgs];
  for(const s of c.chain){
    const pk=c.keys.filter(k=>k.p===s.p),off=Math.floor(Math.random()*pk.length);
    for(const x of pk.slice(off).concat(pk.slice(0,off))){
      const kid=String(x.k).slice(-8),id=s.p+'|'+s.m+'|'+kid,mk=marks(),now=Date.now();
      if((mk[id]||0)>now||(mk['bad|'+kid]||0)>now)continue;
      let r,j;
      try{
        const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),35000);
        r=await fetch(PROV[s.p],{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json','Authorization':'Bearer '+String(x.k)},
          body:JSON.stringify({model:s.m,messages:all,temperature:o.t??.6,max_tokens:o.max||700})});
        clearTimeout(tm);j=await r.json().catch(()=>({}));
      }catch(e){setMark(id,20e3);continue}
      if(r.ok){const t=(j.choices?.[0]?.message?.content||'').replace(/<think>[\s\S]*?<\/think>/g,'').trim();if(t)return t;setMark(id,20e3);continue}
      const txt=JSON.stringify(j.error||j);
      if(r.status===429)setMark(id,Math.max(waitMs(txt),/per day|TPD|RPD|daily/i.test(txt)?30*60e3:20e3));   /* quota used up: try next */
      else if(r.status===401)setMark('bad|'+kid,6*3600e3);        /* wrong key */
      else if(r.status===403)setMark(id,3600e3);
      else if(r.status===413)setMark(id,60e3);                     /* request too big for this model */
      else if(r.status===400||r.status===404)setMark(id,10*60e3);  /* wrong model name */
      else setMark(id,30e3);
    }
  }
  throw new Error('BUSY');
}
const aiErr=e=>e.message==='NOKEYS'?'The AI is not set up yet. Please tell the owner.':e.message==='BUSY'?'The free AI is busy or used up for now. Please try again in a few minutes.':'Something went wrong: '+e.message;

/* ---------- UI shell ---------- */
function build(){
  if(root)return;
  const st=$('style');st.textContent=CSS;document.head.append(st);
  root=$('div');root.id='tl';root.hidden=true;
  root.innerHTML='<div id="tlMenu" hidden><button data-t="chat">💬 AI Chatbot</button><button data-t="plan">🎯 Strategy Builder</button></div><button id="tlFab" aria-label="Study tools">✨</button>';
  const panel=$('div');panel.id='tlPanel';panel.hidden=true;
  document.body.append(root,panel);
  const menu=root.querySelector('#tlMenu');
  root.querySelector('#tlFab').onclick=()=>{menu.hidden=!menu.hidden};
  menu.onclick=e=>{const t=e.target.dataset.t;if(!t)return;menu.hidden=true;t==='chat'?openChat():openPlan()};
  document.addEventListener('click',e=>{if(!root.contains(e.target))menu.hidden=true});
}
function shell(title){
  const p=document.getElementById('tlPanel');p.hidden=false;p.innerHTML='';root.hidden=true;
  const h=$('div','tlh');h.append($('b',0,title));
  const x=$('button',0,'✕');x.onclick=()=>{p.hidden=true;root.hidden=false};h.append(x);
  const b=$('div','tlbody');p.append(h,b);return{p,h,b};
}

/* ---------- Chatbot with memory ---------- */
async function openChat(){
  const {p,h,b}=shell('💬 Study Buddy');
  const nw=$('button',0,'New chat'),fg=$('button',0,'Forget me');h.insertBefore(fg,h.lastChild);h.insertBefore(nw,fg);
  const draw=()=>{b.innerHTML='';if(!chat.length)b.append($('div','msg sys','Hi! Ask me anything from your Class 10 chapters. I remember what we talked about and what you find hard, even after a new chat.'));chat.forEach(m=>b.append($('div','msg '+m.r,m.t)));b.scrollTop=b.scrollHeight};
  if(!chat.length){try{const s=await getDoc(ref('chat'));chat=s.exists()?(s.data().msgs||[]):[];mem=s.exists()?(s.data().sum||''):''}catch(e){}}
  await loadPlan();draw();
  const inp=$('div','tlin'),ta=$('textarea');ta.rows=1;ta.placeholder='Type your doubt…';const sd=$('button',0,'Send');inp.append(ta,sd);p.append(inp);
  const save=()=>setDoc(ref('chat'),{msgs:chat.slice(-40),sum:mem,ts:Date.now()}).catch(()=>{});
  nw.onclick=async()=>{if(!chat.length)return;nw.disabled=true;nw.textContent='Saving…';await remember(chat.slice(-16),save);chat=[];save();draw();nw.disabled=false;nw.textContent='New chat'};
  fg.onclick=()=>{if(confirm('Delete this chat AND everything I remember about you?')){chat=[];mem='';since=0;save();draw()}};
  const send=async()=>{
    const t=ta.value.trim();if(!t||busy)return;busy=true;sd.disabled=true;ta.value='';
    chat.push({r:'user',t});draw();const dots=$('div','msg model');dots.innerHTML='<span class="dots"><span></span><span></span><span></span></span>';b.append(dots);b.scrollTop=b.scrollHeight;
    try{
      const reply=await ai(chat.slice(-12).map(m=>({role:m.r==='user'?'user':'assistant',content:m.t})),sysPrompt(),{max:600});
      chat.push({r:'model',t:reply});
    }catch(e){console.error('AI error',e);chat.pop();draw();b.append($('div','msg sys','⚠️ '+aiErr(e)));ta.value=t;busy=false;sd.disabled=false;return}
    save();busy=false;sd.disabled=false;draw();ta.focus();compact(save);
  };
  sd.onclick=send;ta.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&innerWidth>600){e.preventDefault();send()}};
}
/* long-term memory: when the chat gets long, the oldest messages are squeezed into a short note */
/* notes about the student: refreshed every few messages and when a chat is closed, so nothing is forgotten */
const MEMSYS='You keep a short memory about a Class 10 student for a study chatbot. Merge the existing memory with the new conversation into at most 150 words of plain notes: subjects and chapters they struggle with or are strong in, doubts already solved, goals, exam dates, language preference (English/Hinglish), mood or stress, study habits. Keep old facts that are still true. No filler.';
async function remember(msgs,save){
  if(compacting||!msgs.length)return false;compacting=true;
  try{
    const n=await ai([{role:'user',content:'Existing memory:\n'+(mem||'(none)')+'\n\nNew conversation:\n'+msgs.map(m=>(m.r==='user'?'Student: ':'Buddy: ')+m.t.slice(0,400)).join('\n')}],MEMSYS,{max:350,t:.2});
    mem=n.slice(0,1100);since=0;save();compacting=false;return true;
  }catch(e){compacting=false;return false}
}
async function compact(save){
  if(chat.length>30&&!compacting){const old=chat.slice(0,14);if(await remember(old,save)){chat=chat.slice(14);save()}return}
  if(++since>=6)remember(chat.slice(-12),save);
}
function sysPrompt(){
  let s='You are a friendly, concise study buddy for a Class 10 (CBSE/NCERT) student in India. Explain simply with short examples, use the same language style as the student (English or Hinglish), and keep answers under about 150 words unless asked for more. Stay on studies and motivation. If unsure, say so. Never ask for personal information.';
  s+=' Student name: '+(u.displayName||'student')+'.';
  if(mem)s+=' Your memory notes about this student from earlier chats (use them naturally, do not recite them): '+mem;
  if(plan&&plan.sched){const all=plan.sched.flatMap(d=>d.tasks),dn=all.filter(t=>t.d).length;const nx=plan.sched.find(d=>d.tasks.some(t=>!t.d));
    s+=' Their study plan: '+dn+' of '+all.length+' tasks done.'+(nx?' Next unfinished day: "'+nx.title+'" with tasks: '+nx.tasks.filter(t=>!t.d).map(t=>t.t).join('; ')+'.':'')}
  return s;
}

/* ---------- Strategy builder ---------- */
const ALL=[];
Object.entries(CHAPTERS).forEach(([sub,d])=>{if(typeof d==='string')return;const arr=Array.isArray(d);
  Object.entries(arr?{[sub]:d}:d).forEach(([g,a])=>a.forEach((n,i)=>ALL.push({k:chKey(sub,arr?'':g,i),g,n,l:g+' · '+n})))});
async function loadPlan(){if(plan!==null)return;try{const s=await getDoc(ref('plan'));plan=s.exists()?s.data():false}catch(e){plan=false}}
const savePlan=()=>setDoc(ref('plan'),plan).catch(()=>{});
async function openPlan(){
  const {b}=shell('🎯 Strategy Builder');b.append($('p','tln','Loading…'));
  await loadPlan();plan&&plan.sched?checklist(b):form(b);
}
function form(b){
  b.innerHTML='';
  b.append($('p','tln','Tick the chapters you have finished 100% (all steps done). Everything else goes into your plan.'));
  const done=new Set((plan&&plan.done)||[]);const groups={};ALL.forEach(c=>(groups[c.g]=groups[c.g]||[]).push(c));
  Object.entries(groups).forEach(([g,list])=>{
    const w=$('div','tlg'),hd=$('h4',0,g),all=$('button','tlb','Select all');hd.append(all);w.append(hd);
    const boxes=list.map(c=>{const l=$('label','ck'),i=$('input');i.type='checkbox';i.checked=done.has(c.k);i.dataset.k=c.k;l.append(i,$('span',0,c.n));w.append(l);return i});
    all.onclick=()=>{const v=boxes.some(x=>!x.checked);boxes.forEach(x=>x.checked=v);all.textContent=v?'Clear all':'Select all'};b.append(w);
  });
  b.append($('label','tln','How many days can you give to finish the leftover chapters?'));
  const d=$('input','tlfield');d.type='number';d.min=1;d.max=60;d.value=(plan&&plan.days)||14;b.append(d);
  const go=$('button','tlb go','Build my plan with AI'),msg=$('p','tln');b.append(go,msg);
  go.onclick=async()=>{
    const dn=[...b.querySelectorAll('input[type=checkbox]:checked')].map(x=>x.dataset.k),days=Math.max(1,Math.min(60,+d.value||0));
    const left=ALL.filter(c=>!dn.includes(c.k));
    if(!left.length){msg.textContent='🎉 All chapters are marked done! Keep revising with flashcards and quizzes.';return}
    go.disabled=true;msg.textContent='Building your plan… this takes a few seconds.';
    let sched=null,by='AI';
    try{sched=await aiPlan(left,days)}catch(e){by='builtin';msg.textContent=''}
    if(!sched){sched=localPlan(left,days);by='builtin'}
    plan={done:dn,days,sched,by,ts:Date.now()};await savePlan();checklist(b);
  };
}
async function aiPlan(left,days){
  const sys='You are a study-planning assistant. Reply with JSON only.';
  const q='Make a '+days+'-day study plan for a Class 10 student. Chapters still to finish (each needs these steps in order: 1 Audio overview, 2 Read notes + NCERT, 3 Flashcards (repeat wrong ones until 0 wrong), 4 Quiz): '+left.map(c=>c.l).join('; ')+
  '. Rules: use exactly '+days+' days; cover every chapter; spread them evenly and keep a balanced load of about 3-7 short tasks per day; repeat flashcards of each chapter again 1 day and 3 days after first learning (spaced repetition); optional slide deck / flowchart skim as extra; last day is a final revision day (if days>=4). Each task is one short string that starts with the chapter name. JSON format: {"days":[{"title":"short title","tasks":["..."]}]}';
  const t=await ai([{role:'user',content:q}],sys,{max:3500,t:.3});
  const j=JSON.parse(t.slice(t.indexOf('{'),t.lastIndexOf('}')+1)),a=j.days;
  if(!Array.isArray(a)||!a.length||a.some(x=>!Array.isArray(x.tasks)||!x.tasks.length))throw new Error('bad');
  return a.slice(0,days).map((x,i)=>({title:'Day '+(i+1)+' · '+String(x.title||'Study').slice(0,60),tasks:x.tasks.map(s=>({t:String(s).slice(0,160),d:false}))}));
}
function localPlan(left,days){
  const fin=days>=4?1:0,W=Math.max(1,days-fin),per=Math.ceil(left.length/W),learn=[];
  for(let i=0;i<W;i++)learn.push(left.slice(i*per,(i+1)*per));
  const S=[];
  for(let i=0;i<days;i++){
    const t=[];
    (learn[i]||[]).forEach(c=>t.push('Audio overview: '+c.l,'Read notes + NCERT: '+c.l,'Flashcards (repeat until 0 wrong): '+c.l,'Quiz: '+c.l));
    [1,3].forEach(o=>(learn[i-o]||[]).forEach(c=>t.push('Flashcards again: '+c.l)));
    if(i>=W)t.push('Final revision: redo flashcards of your weakest chapters','Take quizzes again and fix mistakes','Skim slide decks and flowcharts');
    if(!t.length)t.push('Free revision: flashcards of any chapter you find hard');
    S.push({title:'Day '+(i+1)+' · '+(i>=W?'Final revision':(learn[i]||[]).map(c=>c.n).join(', ').slice(0,50)||'Revision'),tasks:t.map(x=>({t:x,d:false}))});
  }
  return S;
}
function checklist(b){
  b.innerHTML='';const all=plan.sched.flatMap(d=>d.tasks);
  const pct=()=>{const n=all.filter(t=>t.d).length;return[n,Math.round(n*100/all.length)]};
  const [n0,p0]=pct(),pt=$('p','tln','✅ '+n0+' of '+all.length+' tasks done ('+p0+'%)'),bar=$('div','bar'),fill=$('i');fill.style.width=p0+'%';bar.append(fill);
  const note=$('p','tln',plan.by==='AI'?'Plan built by AI':'Plan built with the built-in planner (AI was unavailable)');
  b.append(pt,bar,note);
  const firstOpen=plan.sched.findIndex(d=>d.tasks.some(t=>!t.d));let timer;
  plan.sched.forEach((d,di)=>{
    const c=$('details','dayc'),s=$('summary',0,d.title);if(di===firstOpen||plan.sched.length===1)c.open=true;c.append(s);
    d.tasks.forEach(t=>{const l=$('label','ck'+(t.d?' done':'')),i=$('input');i.type='checkbox';i.checked=t.d;l.append(i,$('span',0,t.t));
      i.onchange=()=>{t.d=i.checked;l.classList.toggle('done',t.d);const [n,p]=pct();pt.textContent='✅ '+n+' of '+all.length+' tasks done ('+p+'%)';fill.style.width=p+'%';clearTimeout(timer);timer=setTimeout(savePlan,600)};c.append(l)});
    b.append(c);
  });
  const rb=$('button','tlb','Rebuild plan');rb.onclick=()=>form(b);
  const rs=$('button','tlb red','Delete plan');rs.style.marginLeft='8px';rs.onclick=async()=>{if(confirm('Delete your plan?')){plan=false;await setDoc(ref('plan'),{}).catch(()=>{});form(b)}};
  const w=$('div');w.style.margin='14px 0 4px';w.append(rb,rs);b.append(w);
}

export function startTools(d,user){if(u&&u.uid!==user.uid){chat=[];mem='';since=0;plan=null;cfg=null}db=d;u=user;build();if(document.getElementById('tlPanel').hidden)root.hidden=false}
export function stopTools(){if(!root)return;root.hidden=true;document.getElementById('tlPanel').hidden=true;chat=[];mem='';since=0;plan=null;cfg=null}
