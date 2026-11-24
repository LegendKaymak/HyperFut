'use strict';
/* ======================= MENÜLER ======================= */
const UI=$('ui');let SEL=null,VS_T=null,FLOW={pick:'match',players:'1',count:4},BACK=null,GUESS=-1,CANCEL_CAP=null;
function mount(name,html,dim=false){clearTimeout(VS_T);SCREEN=name;$('game').classList.toggle('noHud',name==='select'||name==='vs'||dim);UI.className=`layer show screen-${name}${dim?' dim':''}`;UI.innerHTML=html;$('game').classList.toggle('uiOn',true);paintDiscs()}
function hideUI(){clearTimeout(VS_T);$('game').classList.remove('noHud');UI.className='layer';UI.innerHTML='';$('game').classList.toggle('uiOn',false);document.activeElement?.blur?.()}
function bind(map){for(const[act,fn]of Object.entries(map))UI.querySelectorAll(`[data-act="${act}"]`).forEach(b=>b.addEventListener('click',()=>{sfx.unlock();sfx.ui();fn(b)}))}
function focusFirst(){UI.querySelector('[data-nav]')?.focus({preventScroll:true})}
function discCanvas(ci,size,team){return`<canvas data-disc="${ci}" data-team="${team??''}" width="${size*2}" height="${size*2}"></canvas>`}
function paintDiscs(){UI.querySelectorAll('canvas[data-disc]').forEach(cn=>{const c=cn.getContext('2d');c.clearRect(0,0,cn.width,cn.height);const ci=+cn.dataset.disc,ch=CHARS[ci];const r=cn.width*.4;drawDisc(c,cn.width/2,cn.height/2-r*.08,r,ch,ch)})}
function homeChrome(step){const steps=['Mod','Oyuncu','Ayarlar','Karakter'];
 return`<div class="scrim"></div><div class="brand">${LOGO}<span>HyperFut</span><small class="by">By LegendKaymak</small></div>
 ${step?`<div class="steps">${steps.map((n,i)=>`<span class="${i+1===step?'on':i+1<step?'done':''}">${i+1}. ${n}</span>`).join('<i></i>')}</div>`:''}
 <div class="homeIcons"><button data-nav data-act="stats" class="iconBtn" title="İstatistikler" aria-label="İstatistikler">${icon('stats',20)}</button><button data-nav data-act="settings" class="iconBtn" title="Ayarlar" aria-label="Ayarlar">${icon('settings',20)}</button></div>`}
function bindChrome(){bind({stats:()=>showStats(),settings:()=>showSettings()})}
const MODES=[['match','Maç','Yapay zekaya ya da arkadaşına karşı'],['tour','Turnuva','2–8 kişi, eleme usulü'],['pens','Penaltı atışı','Seri penaltılar, kaleyi de sen korursun'],['train','Antrenman','Kaleciye karşı şut ve yetenek çalış'],['watch','İzle','İki yapay zekayı izle, kazananı tahmin et']];
function playerChoices(pick){return{match:[['1','1 Oyuncu','Yapay zekaya karşı'],['2','2 Oyuncu',TOUCH.on?'Klavye ya da 2 oyun kolu gerekir':'Karşılıklı, aynı klavyede']],pens:[['1','1 Oyuncu','Yapay zekaya karşı'],['2','2 Oyuncu',TOUCH.on?'Klavye ya da 2 oyun kolu gerekir':'Karşılıklı, aynı klavyede']],train:[['1']],watch:[['0']]}[pick]||null}
function showMain(){
 BACK=null;ensureDemo();
 const tourSt=TOUR&&!TOUR.isOver?`Devam eden turnuva: ${TOUR.roundName(TOUR.nextMatch()?.r??0)}`:null;
 mount('home',`<div class="home">${homeChrome(0)}
  <nav class="menu">${MODES.map(([id,n,sub])=>`<button data-nav data-pick="${id}" class="mItem"><b>${n}</b><small>${id==='tour'&&tourSt?tourSt:sub}</small></button>`).join('')}</nav>
  <div class="homeFoot">${CAREER.matches?`${CAREER.matches} maç oynandı · ${CAREER.goals} gol`:'Hoş geldin'}${CAREER.best?` · En uzun galibiyet serisi ${CAREER.best}`:''}</div>${!STANDALONE&&(DEFER||IS_IOS)?`<button data-nav data-act="install" class="btn primary installBtn">${icon('install',18)}Uygulamayı yükle</button>`:''}</div>`);
 bind({install:()=>doInstall()});
 UI.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>{sfx.unlock();sfx.ui();const pick=b.dataset.pick;
  if(pick==='tour'&&TOUR&&!TOUR.isOver){FLOW={pick,players:'multi'};showBracket();return}
  FLOW={pick,players:FLOW.pick===pick?FLOW.players:'1',count:FLOW.count||4};const ch=playerChoices(pick);
  if(ch&&ch.length===1){FLOW.players=ch[0][0];showOptionsStep()}else showPlayersStep()}));
 bindChrome();
 const back=UI.querySelector(`[data-pick="${FLOW.pick}"]`);(back||UI.querySelector('[data-nav]'))?.focus({preventScroll:true});
}
function doInstall(){
 if(DEFER){const d=DEFER;d.prompt();d.userChoice.then(r=>{DEFER=null;if(r&&r.outcome==='accepted')toast('HyperFut yükleniyor…');if(SCREEN==='home')showMain()}).catch(()=>{});return}
 BACK=()=>showMain();
 mount('install',`<div class="dialog" style="width:440px"><div class="headline">Ana ekrana ekle</div><div class="supporting">iPhone ve iPad'de Safari ile:</div><ol class="iosSteps"><li>Alttaki <b>Paylaş</b> simgesine dokun</li><li><b>Ana Ekrana Ekle</b>'yi seç</li><li><b>Ekle</b>'ye dokun; HyperFut uygulama gibi tam ekran açılır</li></ol><div class="dactions"><button data-nav data-act="back" class="btn primary">Tamam</button></div></div>`,true);
 bind({back:()=>showMain()});focusFirst();
}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();DEFER=e;if(SCREEN==='home'&&!UI.querySelector('.installBtn'))showMain()});
addEventListener('appinstalled',()=>{DEFER=null;toast('HyperFut yüklendi');if(SCREEN==='home')showMain()});
function showPlayersStep(){
 BACK=showMain;const f=FLOW,ch=playerChoices(f.pick),title={match:'Maç',pens:'Penaltı atışı',tour:'Turnuva'}[f.pick];let body;
 if(ch)body=`<nav class="menu modeMenu">${ch.map(([v,n,sub])=>`<button data-nav data-ch="${v}" class="mItem ${f.players===v?'sel':''}"><b>${n}</b><small>${sub}</small></button>`).join('')}</nav>`;
 else{let saved=null;try{saved=JSON.parse(localStorage.getItem('hf_entrants')||'null')}catch(e){}const cur=f.count||Math.max(2,Math.min(8,saved?.length||4));
  body=`<div class="countWrap"><div class="countQ">Kaç kişi oynayacak?</div><div class="countPick">${[2,3,4,5,6,7,8].map(n=>`<button data-nav data-count="${n}" class="${n===cur?'on':''}">${n}</button>`).join('')}</div><div class="countSub">İsimleri ayarlardan sonra yazacaksınız; istediğiniz yere yapay zeka koyabilirsiniz.</div></div>`}
 mount('players',`<div class="home">${homeChrome(2)}<div class="stepTitle">${title}</div>${body}<div class="stepNav"><button data-nav data-act="back" class="btn text">Geri</button></div></div>`);
 UI.querySelectorAll('[data-ch]').forEach(b=>b.addEventListener('click',()=>{sfx.ui();f.players=b.dataset.ch;showOptionsStep()}));
 UI.querySelectorAll('[data-count]').forEach(b=>b.addEventListener('click',()=>{sfx.ui();f.players='multi';f.count=+b.dataset.count;showOptionsStep()}));
 bind({back:()=>showMain()});bindChrome();
 (UI.querySelector('.mItem.sel,.countPick .on')||UI.querySelector('[data-ch],[data-count]'))?.focus({preventScroll:true});
}
function showOptionsStep(focusSel){
 const f=FLOW,s=S,ch=playerChoices(f.pick);BACK=()=>ch&&ch.length===1?showMain():showPlayersStep();
 const title={match:f.players==='2'?'Maç · 2 Oyuncu':'Maç · 1 Oyuncu',pens:f.players==='2'?'Penaltı · 2 Oyuncu':'Penaltı · 1 Oyuncu',tour:'Turnuva',train:'Antrenman',watch:'İzle'}[f.pick];
 const seg=(label,key,opts,cur,idx)=>`<div class="opt"><span class="ol">${label}</span><div class="seg">${opts.map(([v,n,t])=>`<button data-nav data-o="${key}" ${idx!=null?`data-i="${idx}"`:''} data-v="${v}" class="${String(cur)===String(v)?'on':''}" ${t?`title="${t}"`:''}>${n}</button>`).join('')}</div></div>`;
 const rows=[],p=f.pick;
 if(p==='match'||p==='tour'||p==='watch')rows.push(seg('Format','format',Object.entries(FORMATS).map(([k,v])=>[k,v.n,v.s]),s.format));
 if((p==='match'||p==='pens')&&f.players!=='2'||p==='watch')rows.push(seg(p==='watch'?'Zorluk':'Rakip','diff',DIFF.map((d,i)=>[i,d.n]),s.diff));
 if(p==='match'||p==='tour'||p==='watch'){rows.push(seg('Süre','dur',[[2,'2 dk'],[3,'3 dk'],[5,'5 dk'],[8,'8 dk']],s.dur));
  rows.push(`<div class="opt"><span class="ol">Kurallar</span><button data-nav data-tog="et" class="tog ${s.et?'on':''}" aria-pressed="${s.et}">${icon('check',14)}Uzatma</button><button data-nav data-tog="golden" class="tog ${s.golden?'on':''}" aria-pressed="${s.golden}" title="Uzatmada ilk gol maçı bitirir">${icon('check',14)}Altın gol</button>${p==='tour'?'':`<button data-nav data-tog="pens" class="tog ${s.pens?'on':''}" aria-pressed="${s.pens}">${icon('check',14)}Penaltı</button>`}</div>`)}
 const kqOpts=KQN.map((n,i)=>[i,n]);
 if(p==='train')rows.push(seg('Kaleci','kq',kqOpts,s.kq[1],1));
 else if(p==='pens'&&f.players!=='2')rows.push(seg('Kaleci','kq',kqOpts,s.kq[1],1));
 else if((p==='match'||p==='tour'||p==='watch')&&s.format!=='duel'){rows.push(seg('Kaleci 1','kq',kqOpts,s.kq[0],0));rows.push(seg('Kaleci 2','kq',kqOpts,s.kq[1],1))}
 if(p==='tour')rows.push('<div class="optNote">Berabere biten turnuva maçları penaltılarla biter.</div>');
 if(p==='pens')rows.push('<div class="optNote">5’er penaltı, eşitlikte seri penaltı. Rakip atarken kaleyi sen korursun.</div>');
 if(p==='train')rows.push('<div class="optNote">Süre yok. Top geri gelirse yeniden yerleşir. Yeteneklerini dene.</div>');
 const next=p==='tour'?'Oyuncuları gir':'Karakter seç';
 mount('options',`<div class="home">${homeChrome(3)}<div class="stepTitle">${title}</div>
  <div class="optCols"><div class="optsCol">${rows.join('')}</div>
  <div class="arenaCol"><div class="ol">Saha</div><div class="arenaPick">${ARENAS.map(a=>`<button data-nav data-arena="${a.id}" class="arenaCard ${s.arena===a.id?'on':''}" aria-pressed="${s.arena===a.id}"><span class="thumb" style="background:${a.thumb}"></span><b>${a.name}</b>${a.note?`<small>${a.note}</small>`:''}</button>`).join('')}</div></div></div>
  <div class="stepNav"><button data-nav data-act="back" class="btn text">Geri</button><button data-nav data-act="next" class="btn primary">${next}</button></div></div>`);
 UI.querySelectorAll('[data-o]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.o,v=b.dataset.v;
  if(k==='kq')s.kq[+b.dataset.i]=+v;else s[k]=k==='format'?v:+v;saveS();sfx.uiMove();
  if(k==='format'){showOptionsStep(`[data-o="format"][data-v="${v}"]`);return}
  UI.querySelectorAll(`[data-o="${k}"]${b.dataset.i!=null?`[data-i="${b.dataset.i}"]`:''}`).forEach(x=>x.classList.toggle('on',x===b))}));
 UI.querySelectorAll('[data-tog]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.tog;s[k]=!s[k];saveS();b.classList.toggle('on',s[k]);b.setAttribute('aria-pressed',s[k]);sfx.uiMove()}));
 UI.querySelectorAll('[data-arena]').forEach(b=>b.addEventListener('click',()=>{s.arena=b.dataset.arena;saveS();if(G&&G.demo)G.cfg.arena=s.arena;UI.querySelectorAll('[data-arena]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});sfx.uiMove()}));
 bind({back:()=>BACK(),next:()=>launch()});bindChrome();
 (focusSel&&UI.querySelector(focusSel)||UI.querySelector('[data-act="next"]'))?.focus({preventScroll:true});
}
function baseCfg(mode){return{mode,format:S.format,ctrl:['p1x','ai'],chars:[0,1],diffT:[S.diff,S.diff],dur:S.dur,et:S.et,golden:S.golden,pens:S.pens,kq:[...S.kq],arena:S.arena,names:null}}
function launch(){
 const f=FLOW;
 if(f.pick==='tour'){showTourSetup(f.count);return}
 const two=f.players==='2';
 let sides;
 if(f.pick==='watch')sides=[{name:'Yapay zeka 1',ai:false},{name:'Yapay zeka 2',ai:false}];
 else if(f.pick==='train')sides=[{name:'Oyuncu 1',ai:false},{name:'Kaleci',ai:true}];
 else sides=[{name:'Oyuncu 1',ai:false},{name:two?'Oyuncu 2':`Yapay zeka (${DIFF[S.diff].n})`,ai:!two}];
 showSelect({sides,prev:S.c,solo:f.pick==='train',onBack:()=>showOptionsStep(),onDone:(picks)=>{
  S.c=picks;saveS();const cfg=baseCfg(f.pick);cfg.chars=picks;
  if(f.pick==='watch'){cfg.ctrl=['ai','ai'];showGuess(cfg);return}
  if(f.pick==='train'){cfg.ctrl=['p1x','ai'];cfg.format='duel'}
  else{cfg.ctrl=two?['p1','p2']:['p1x','ai'];if(f.pick==='pens'){cfg.format='duel'}}
  showVs(cfg,()=>beginMatch(cfg))}});
}
function beginMatch(cfg){wake(true);hideUI();SCREEN='match';$('game').classList.add('inMatch');$('game').classList.remove('inVs');down.clear();clearEdges();startMatch(cfg)}
function ensureDemo(){if(!G||!G.demo)startDemo()}
function startDemo(){const a=rnd()*CHARS.length|0;let b;do{b=rnd()*CHARS.length|0}while(b===a);const cfg={mode:'demo',format:'squad',ctrl:['ai','ai'],chars:[a,b],diffT:[2,2],dur:3,et:false,pens:false,kq:[2,2],arena:S.arena,names:null};startMatch(cfg);$('game').classList.remove('inMatch')}

/* ----- karakter seçimi ----- */
function showSelect({sides,prev=[0,1],solo=false,onDone,onBack,title}){
 document.activeElement?.blur?.();BACK=()=>{SEL=null;onBack&&onBack()};
 const anyAi=sides.some(x=>x.ai),n=CHARS.length;
 const start=p=>{const i=prev[p];return i!=null&&i>=0&&i<n?i:p?n-1:0};
 SEL={sides,solo,done:false,onDone,mode:anyAi?'1p':'2p',players:sides.map((x,p)=>({idx:start(p),picked:null,ready:false,ai:x.ai,name:x.name}))};
 if(SEL.players[1].idx===SEL.players[0].idx&&!solo)SEL.players[1].idx=(SEL.players[0].idx+1)%n;
 const k=S.keys,keys1=`<kbd>${keyLabel(k.p1.up)}${keyLabel(k.p1.left)}${keyLabel(k.p1.down)}${keyLabel(k.p1.right)}</kbd> gez <kbd>${keyLabel(k.p1.kick)}</kbd> seç <kbd>${keyLabel(k.p1.ab)}</kbd> geri <kbd>R</kbd> zar`,keys2=`<kbd>Oklar</kbd> gez <kbd>${keyLabel(k.p2.kick)}</kbd> seç <kbd>${keyLabel(k.p2.ab)}</kbd> geri <kbd>Sağ Ctrl</kbd> zar`;
 const fighter=p=>`<div class="fighter f${p}"><div class="who">${esc(sides[p].name)}</div><div class="fname"></div><div class="fstyle"></div>
  <div class="fstage"><div class="fglow"></div><div class="fbody"></div><div class="stamp">Hazır</div></div>
  <div class="fstats"></div><div class="fbtns"><button class="btn fpick" data-p="${p}">${sides[p].ai?'Bekliyor':'Seç'}</button>${sides[p].ai?'':`<button class="btn fdice" data-p="${p}" title="Rastgele karakter" aria-label="Rastgele karakter">${icon('shuffle',18)}</button>`}</div><div class="fabs"></div></div>`;
 mount('select',`<div class="mk ${solo?'solo':''}"><div class="mkTitle">${title||(solo?'Antrenman: karakterini seç':'Karakterini seç')}</div>${fighter(0)}
  <div class="mkCenter"><div class="mkGrid">${CHARS.map((c,i)=>`<button class="tile" data-i="${i}" style="--c:${c.ui}" aria-label="${c.name}">${discCanvas(i,20)}<span class="tag t1">1</span><span class="tag t2">2</span></button>`).join('')}</div>
  <div class="mkKeys">${TOUCH.on?'<div>Karaktere dokun, sonra <b>Seç</b> düğmesine bas</div>':''}${TOUCH.on||sides[0].ai?'':`<div><span class="kp k1">1</span>${anyAi?keys1.replace('</kbd> gez',' / Oklar</kbd> gez'):keys1}</div>`}${TOUCH.on||sides[1].ai||solo?'':`<div><span class="kp k2">2</span>${keys2}</div>`}<button class="btn text mkBack" data-act="back">Geri</button></div></div>${fighter(1)}</div>`);
 UI.querySelectorAll('button').forEach(b=>{b.tabIndex=-1;b.addEventListener('mousedown',e=>e.preventDefault())});
 bind({back:()=>BACK()});
 const picker=()=>SEL.players.findIndex(pl=>!pl.ai&&!pl.ready);
 UI.querySelectorAll('.tile').forEach(t=>{t.addEventListener('click',()=>{const p=picker();if(p<0||SEL.done)return;sfx.unlock();const i=+t.dataset.i;if(SEL.players[p].idx!==i){SEL.players[p].idx=i;sfx.selectMove();renderSelect()}});t.addEventListener('dblclick',()=>{const p=picker();if(p>=0)selConfirm(p)})});
 UI.querySelectorAll('.fpick').forEach(b=>b.addEventListener('click',()=>{const p=+b.dataset.p;sfx.unlock();if(SEL.players[p].ready)selBack(p);else selConfirm(p)}));
 UI.querySelectorAll('.fdice').forEach(b=>b.addEventListener('click',()=>{sfx.unlock();selRoll(+b.dataset.p)}));
 SEL.last=[-1,-1];renderSelect();
}
function charStats(c){let sp=72,sh=72,te=72,po=72;const P=c.passive,A=ACTIVES[c.active].cat;
 if(P==='hizli')sp+=16;if(P==='cevik'){sp+=10;te+=8}if(P==='dev'){po+=18;sp-=8}if(P==='sert')sh+=16;if(P==='yapiskan')te+=18;
 ({shot:()=>sh+=9,move:()=>sp+=8,ball:()=>te+=9,aoe:()=>po+=9,def:()=>po+=9,debuff:()=>te+=5,save:()=>po+=6,attack:()=>sh+=5})[A]?.();
 if(c.star){sp+=8;sh+=9;te+=8;po+=4}
 if(c.weak){sp-=42;sh-=48;te-=44;po-=36}
 let h=0;for(const ch of c.id)h=(h*31+ch.charCodeAt(0))%997;const j=k=>((h>>k)%7)-3;
 return[['Hız',sp+j(0)],['Şut',sh+j(1)],['Teknik',te+j(2)],['Güç',po+j(3)]].map(([n,v])=>[n,clamp(Math.round(v),c.weak?20:50,99)])}
function isTaken(p,i){if(SEL.solo)return false;const o=SEL.players[1-p];return o.ready&&o.picked===i}
function renderSelect(){
 if(!SEL)return;const P=SEL.players;
 UI.querySelectorAll('.tile').forEach(t=>{const i=+t.dataset.i;const on1=!P[0].ai&&(P[0].ready?P[0].picked===i:P[0].idx===i);const on2=!P[1].ai?(P[1].ready?P[1].picked===i:P[1].idx===i):P[1].ready&&P[1].picked===i;
  t.classList.toggle('c1',on1);t.classList.toggle('c2',on2&&!SEL.solo);t.classList.toggle('locked',(P[0].ready&&P[0].picked===i)||(P[1].ready&&P[1].picked===i))});
 P.forEach((pl,p)=>{const el=UI.querySelector(`.fighter.f${p}`);if(!el)return;const waiting=pl.ai&&!pl.ready,ci=pl.ready?pl.picked:pl.idx,c=CHARS[ci];
  el.classList.toggle('waiting',waiting);el.classList.toggle('isReady',pl.ready);el.style.setProperty('--c',waiting?'#2a4e63':c.ui);
  const btn=el.querySelector('.fpick');btn.disabled=pl.ai||(!pl.ready&&isTaken(p,pl.idx));btn.textContent=pl.ai?(pl.ready?'Hazır':'Bekliyor'):pl.ready?'Vazgeç':isTaken(p,pl.idx)?'Rakipte':'Seç';
  if(waiting){if(SEL.last[p]!=='w'){SEL.last[p]='w';el.querySelector('.fstats').innerHTML='';el.querySelector('.fname').textContent='?';el.querySelector('.fstyle').textContent=SEL.solo?'':'Sen seçince seçecek';el.querySelector('.fbody').innerHTML='';el.querySelector('.fabs').innerHTML=''}return}
  if(SEL.last[p]===ci)return;SEL.last[p]=ci;
  const ps=PASSIVES[c.passive],ac=ACTIVES[c.active],hy=HYPERS[c.hyper];
  const fn=el.querySelector('.fname');fn.textContent=c.name;fn.classList.toggle('long',c.name.length>7);el.querySelector('.fstyle').textContent=c.style;
  const body=el.querySelector('.fbody');body.innerHTML=discCanvas(ci,52);paintDiscs();body.classList.remove('enter');void body.offsetWidth;body.classList.add('enter');
  el.querySelector('.fstats').innerHTML=charStats(c).map(([n,v])=>`<div class="st"><span>${n}</span><i><b style="width:${v}%"></b></i><em>${v}</em></div>`).join('');
  el.querySelector('.fabs').innerHTML=`<div class="ab"><span class="k">Pasif</span><b>${ps.n}</b><i>${ps.d}</i></div><div class="ab"><span class="k">Aktif</span><b>${ac.n}</b><i>${ac.d}&nbsp;(${Math.round(ac.cd*(c.cdMul||1))}&nbsp;sn)</i></div><div class="ab hy"><span class="k">Hyper</span><b>${hy.n}</b><i>${hy.d}</i></div>`});
}
function selMove(p,dx,dy){const pl=SEL.players[p];if(!pl||pl.ai||pl.ready||SEL.done)return;const n=CHARS.length,c=6;let i=pl.idx;if(dx)i=(i+dx+n)%n;if(dy)i=(i+dy*c+n)%n;pl.idx=i;sfx.selectMove();renderSelect()}
function selConfirm(p){const pl=SEL.players[p];if(!pl||pl.ai||pl.ready||SEL.done)return;if(isTaken(p,pl.idx)){sfx.uiMove();return}
 pl.picked=pl.idx;pl.ready=true;sfx.selectConfirm();const o=SEL.players[1-p];
 if(o.ai&&!o.ready){const pool=CHARS.map((_,i)=>i).filter(i=>i!==pl.picked);o.picked=o.idx=pick(pool);o.ready=true}
 if(SEL.solo&&!o.ready){o.picked=o.idx=(pl.picked+1)%CHARS.length;o.ready=true}
 renderSelect();if(!SEL.done&&SEL.players.every(x=>x.ready)){SEL.done=true;const picks=SEL.players.map(x=>x.picked),cb=SEL.onDone;VS_T=setTimeout(()=>{SEL=null;cb(picks)},650)}}
function selBack(p){const pl=SEL.players[p];if(!pl||pl.ai||SEL.done||!pl.ready)return;pl.ready=false;sfx.uiMove();renderSelect()}
function selRoll(p){const pl=SEL.players[p];if(!pl||pl.ai||pl.ready||SEL.done||pl.rolling)return;const pool=CHARS.map((_,i)=>i).filter(i=>!isTaken(p,i));pl.rolling=true;let k=0;const st=()=>{if(!SEL||SEL.players[p]!==pl)return;pl.idx=pick(pool);sfx.selectMove();renderSelect();if(++k<9)setTimeout(st,45+k*12);else pl.rolling=false};st()}
function selectKey(code){
 if(!SEL)return false;const k=S.keys;const sets=[['p1',0],['p2',1]];
 for(const[s,p0]of sets){let p=p0;if(SEL.mode==='1p'||SEL.solo)p=SEL.players[0].ai?1:0;const m=k[s];
  if(code===m.left){selMove(p,-1,0);return true}if(code===m.right){selMove(p,1,0);return true}if(code===m.up){selMove(p,0,-1);return true}if(code===m.down){selMove(p,0,1);return true}
  if(code===m.kick){selConfirm(p);return true}if(code===m.ab){if(SEL.players[p].ready)selBack(p);return true}}
 if(code==='KeyR'){selRoll(SEL.mode==='1p'&&SEL.players[0].ai?1:0);return true}if(code==='ControlRight'){selRoll(SEL.mode==='1p'?(SEL.players[0].ai?1:0):1);return true}
 if(code==='Enter'||code==='NumpadEnter'){selConfirm(SEL.mode==='2p'?1:0);return true}
 return false;
}
function showVs(cfg,done){
 setTeamLooks(cfg.chars[0],cfg.mode==='train'?null:cfg.chars[1]);$('game').classList.add('inVs');
 const names=cfg.names||[cfg.ctrl[0]==='ai'?'Yapay zeka':'Oyuncu 1',cfg.mode==='train'?'Kaleci':cfg.ctrl[1]==='ai'?`Yapay zeka (${DIFF[cfg.diffT[1]].n})`:'Oyuncu 2'];
 const side=(p)=>{const ci=cfg.chars[p],c=CHARS[ci];if(cfg.mode==='train'&&p===1)return`<div class="vsSide s1" style="--c:#2a4e63"><div class="vsName">KALECİ</div><div class="vsWho">${KQN[cfg.kq[1]]}</div></div>`;
  return`<div class="vsSide s${p}" style="--c:${c.color}"><div class="vsBody">${discCanvas(ci,85)}</div><div class="vsName">${c.name}</div><div class="vsWho">${esc(names[p])}</div></div>`};
 mount('vs',`<div class="vs">${side(0)}<div class="vsMid">VS</div>${side(1)}</div>`);sfx.vs();
 VS_T=setTimeout(done,1700);
}
function showGuess(cfg){
 BACK=()=>showOptionsStep();setTeamLooks(cfg.chars[0],cfg.chars[1]);
 const btn=p=>{const c=CHARS[cfg.chars[p]];return`<button data-nav class="guessBtn" data-g="${p}" style="--c:${c.ui}">${discCanvas(cfg.chars[p],32)}<b>${c.name}</b><span style="font-size:12px;color:var(--sand-dim)">${PASSIVES[c.passive].n} · ${ACTIVES[c.active].n}</span></button>`};
 mount('guess',`<div class="dialog"><div class="headline">Kim kazanır?</div><div class="supporting">${FORMATS[cfg.format].n} · ${DIFF[cfg.diffT[0]].n} yapay zekalar · ${cfg.dur} dk</div><div class="guessRow">${btn(0)}<span class="vsTxt">VS</span>${btn(1)}</div><div class="dactions"><button data-nav data-act="back" class="btn text">Geri</button></div></div>`,true);
 UI.querySelectorAll('[data-g]').forEach(b=>b.addEventListener('click',()=>{sfx.ui();GUESS=+b.dataset.g;showVs(cfg,()=>beginMatch(cfg))}));
 bind({back:()=>BACK()});focusFirst();
}
/* ----- duraklatma / maç sonu ----- */
function togglePause(){if(!G||G.demo||G.phase==='over')return;if(G.paused){G.paused=false;hideUI();SCREEN='match'}else{G.paused=true;showPause()}down.clear();clearEdges()}
function showPause(){
 BACK=()=>togglePause();const k=S.keys,two=G.cfg.ctrl.filter(c=>c==='p1'||c==='p2').length===2;
 const row=(s,dot)=>`<div><span class="dot ${dot}"></span><kbd>${keyLabel(k[s].up)}${keyLabel(k[s].left)}${keyLabel(k[s].down)}${keyLabel(k[s].right)}</kbd> hareket <kbd>${keyLabel(k[s].kick)}</kbd> şut (basılı tut) <kbd>${keyLabel(k[s].ab)}</kbd> yetenek</div>`;
 mount('pause',`<div class="dialog" style="width:430px"><div class="headline">${G.cfg.mode==='train'?'Antrenman':'Duraklatıldı'}</div>
  <div class="controls">${row('p1','o')}${two?row('p2','b'):''}<div class="dim"><kbd>Esc</kbd> duraklat <kbd>M</kbd> ses · Hyper barı dolunca yetenek Hyper'la güçlenir</div></div>
  <div class="pauseTools"><button data-nav data-act="mute" class="btn secondary"></button><button data-nav data-act="fs" class="btn secondary"></button></div>
  <div class="dactions"><button data-nav data-act="quit" class="btn text">Ana menü</button><button data-nav data-act="restart" class="btn secondary">Yeniden başla</button><button data-nav data-act="resume" class="btn primary">Devam et</button></div></div>`,true);
 const paint=()=>{UI.querySelector('[data-act="mute"]').innerHTML=`${icon(S.muted?'volumeOff':'volumeOn',18)}<span>${S.muted?'Ses kapalı':'Ses açık'}</span>`;UI.querySelector('[data-act="fs"]').innerHTML=`${icon(document.fullscreenElement?'fsExit':'fs',18)}<span>${document.fullscreenElement?'Tam ekrandan çık':'Tam ekran'}</span>`};paint();
 bind({resume:()=>togglePause(),quit:()=>quitToMenu(),restart:()=>{const cfg=G.cfg;G.paused=false;beginMatch(cfg)},mute:()=>{toggleMute();paint()},fs:()=>{toggleFs();setTimeout(paint,300)}});
 UI.querySelector('[data-act="resume"]').focus({preventScroll:true});
}
function quitToMenu(){wake(false);$('game').classList.remove('inMatch','inVs');G=null;startDemo();showMain()}
function pickMvp(w){let best=null,bs=.9;for(const p of G.players){const t=p.st,sc=t.g*3+t.a*2+t.on*.4+t.sv*1.3+t.hy*.3+(p.team===w?.8:0);if(sc>bs){bs=sc;best=p}}
 if(!best)return null;const t=best.st,parts=[];if(t.g)parts.push(`${t.g} gol`);if(t.a)parts.push(`${t.a} asist`);if(t.sv)parts.push(`${t.sv} kurtarış`);if(!parts.length&&t.on)parts.push(`${t.on} isabetli şut`);
 return{n:best.role==='keeper'?`${TEAM[best.team].name} kalecisi`:best.ch.name,d:parts.join(', ')}}
function showEnd(w){
 const c=G.cfg,s=G.score,ps=G.penScore,T=TEAM[w<0?0:w],st=G.stats;
 const names=[c.ctrl[0]==='ai'?TEAM[0].name:(c.ctrl[1]==='ai'?'Sen':TEAM[0].name),c.ctrl[1]==='ai'?(c.mode==='watch'?TEAM[1].name:'Yapay zeka'):TEAM[1].name];
 let title=w<0?'Berabere':`${TEAM[w].name} kazandı`,sub='';
 if(c.mode==='watch')sub=GUESS<0?'':(GUESS===w?'Tahminin tuttu!':'Tahminin tutmadı.');
 else if(c.ctrl.filter(x=>x!=='ai').length===1&&w>=0){sub=w===0?`Yapay zekayı (${DIFF[c.diffT[1]].n}) yendin.`:`Yapay zeka (${DIFF[c.diffT[1]].n}) kazandı.`}
 if(ps)sub=(sub?sub+' ':'')+`Penaltılar ${ps[0]}–${ps[1]}`;
 const tp=st.poss[0]+st.poss[1]||1,p0=Math.round(st.poss[0]/tp*100);
 const row=(l,a,b)=>`<tr><th>${l}</th><td class="o">${a}</td><td class="b">${b}</td></tr>`;
 const gl=t=>G.goals.filter(g=>g.team===t).map(g=>`${esc(g.name)} ${g.min}'${g.own?' (k.k.)':''}`).join(' · ')||'<i>gol yok</i>';
 const mvp=pickMvp(w);
 BACK=()=>quitToMenu();
 mount('end',`<div class="dialog end" style="--team:${T.color}"><div class="endTop"><div><div class="headline">${title}</div>${sub?`<div class="supporting">${sub}</div>`:''}</div>
  <div class="finalScore"><span class="o">${s[0]}</span><span class="sep">–</span><span class="b">${s[1]}</span></div></div>
  ${c.mode==='pens'?'':`<table class="mstats"><thead><tr><th></th><td class="o">${esc(names[0])}</td><td class="b">${esc(names[1])}</td></tr></thead><tbody>${row('Şut',st.shots[0],st.shots[1])}${row('İsabetli şut',st.onT[0],st.onT[1])}${row('Topla oynama','%'+p0,'%'+(100-p0))}${row('Kurtarış',st.saves[0],st.saves[1])}${row('Başarılı pas',st.passes[0],st.passes[1])}${row('Yetenek kullanımı',st.abil[0],st.abil[1])}</tbody></table>
  <div class="glist"><div><span class="o">●</span> ${gl(0)}</div><div><span class="b">●</span> ${gl(1)}</div>${mvp?`<div class="mvp">Maçın oyuncusu <b>${esc(mvp.n)}</b> <small>${mvp.d}</small></div>`:''}</div>
  <div class="mfoot">En hızlı şut <b>${Math.round(st.fast*60*.105*3.6*.55)} km/sa</b><span class="sp"></span>Süre <b>${c.dur} dk${G.period>2?' + uzatma':''}</b></div>`}
  <div class="dactions"><button data-nav data-act="quit" class="btn text">Ana menü</button><button data-nav data-act="change" class="btn secondary">Karakter değiştir</button><button data-nav data-act="rematch" class="btn primary">Tekrar oyna</button></div></div>`,true);
 bind({quit:()=>quitToMenu(),rematch:()=>beginMatch(c),change:()=>{$('game').classList.remove('inMatch');G=null;startDemo();launch()}});
 setTimeout(()=>UI.querySelector('[data-act="rematch"]')?.focus({preventScroll:true}),50);
}
/* ----- ayarlar / istatistik / kontroller ----- */
function showStats(){
 const c=CAREER,fmt=sec=>sec>=3600?`${Math.floor(sec/3600)} sa ${Math.floor(sec%3600/60)} dk`:`${Math.floor(sec/60)} dk`;const big=(n,l)=>`<div class="big"><b>${n}</b><span>${l}</span></div>`;
 const row=(d,i)=>{const r=c.ai[i]||{w:0,l:0},tot=r.w+r.l,pct=tot?Math.round(r.w/tot*100):0;return`<tr><th>${d.n}</th><td>${r.w}</td><td>${r.l}</td><td><span class="bar"><i style="width:${pct}%"></i></span>${tot?'%'+pct:'–'}</td></tr>`};
 const prev=SCREEN,ret=BACK;BACK=()=>showMain();
 mount('stats',`<div class="dialog stats"><div class="headline">İstatistikler</div><div class="bigs">${big(c.matches,'maç')}${big(c.goals,'gol')}${big(c.shots,'şut')}${big(c.wins,'galibiyet')}${big(c.best,'en uzun galibiyet serisi')}${big(fmt(c.seconds),'oyun süresi')}</div>
  <div class="achH">Başarımlar <span>${ACH.filter(a=>(c.ach||{})[a[0]]).length}/${ACH.length}</span></div><div class="achs">${ACH.map(([id,n,d])=>`<div class="ach ${(c.ach||{})[id]?'on':''}" title="${d}"><b>${n}</b><small>${d}</small></div>`).join('')}</div>
  <table class="wl"><thead><tr><th>Yapay zekaya karşı</th><td>G</td><td>M</td><td>Oran</td></tr></thead><tbody>${DIFF.map(row).join('')}</tbody></table>
  <div class="dactions"><button data-nav data-act="reset" class="btn text">Sıfırla</button><button data-nav data-act="back" class="btn primary">Tamam</button></div></div>`,true);
 const rs=UI.querySelector('[data-act="reset"]');rs.addEventListener('click',()=>{if(rs.dataset.c){CAREER={matches:0,goals:0,shots:0,wins:0,streak:0,best:0,seconds:0,ai:[{w:0,l:0},{w:0,l:0},{w:0,l:0}]};saveC();sfx.ui();showStats();return}rs.dataset.c='1';rs.textContent='Emin misin? Tekrar bas'});
 bind({back:()=>showMain()});UI.querySelector('[data-act="back"]').focus({preventScroll:true});
}
function showSettings(){
 BACK=()=>showMain();
 const sw=(key,t,sub)=>`<button data-nav data-toggle="${key}" class="listItem" role="switch" aria-checked="${!!S[key]}"><span class="liTx"><b>${t}</b><small>${sub}</small></span><span class="switch ${S[key]?'on':''}"><i>${S[key]?icon('check',14):''}</i></span></button>`;
 const vol=(key,t)=>`<label class="listItem slider"><span class="liTx"><b>${t}</b></span><input data-nav type="range" min="0" max="100" step="5" value="${Math.round(S[key]*100)}" data-vol="${key}" aria-label="${t}"><span class="val">${Math.round(S[key]*100)}</span></label>`;
 mount('settings',`<div class="dialog settings"><div class="headline">Ayarlar</div><div class="list">
  ${sw('lowFx','Efektleri azalt','Daha az parçacık, sarsıntı ve flaş')}${sw('replay','Gol tekrarı','Her golden sonra son 2.5 saniye, 0.5x')}${sw('showFps','FPS göstergesi','Köşede küçük kare hızı yazısı')}${sw('vibe','Titreşim','Telefonda şut, direk ve golde titrer')}
  <div class="listItem qrow"><span class="liTx"><b>Grafik</b><small>Kasarsa Düşük</small></span><div class="seg">${[['auto','Otomatik'],['yuksek','Yüksek'],['orta','Orta'],['dusuk','Düşük']].map(([id,n])=>`<button data-nav data-quality="${id}" class="${S.quality===id?'on':''}">${n}</button>`).join('')}</div></div>
  ${vol('sfxVol','Efekt sesi')}${vol('ambVol','Seyirci sesi')}
  <button data-nav data-act="controls" class="listItem"><span class="liTx"><b>Kontroller</b><small>Tuş atama</small></span><span class="chev">${icon('chevron',18)}</span></button></div>
  <div class="dactions"><span class="renderer">Canvas 2D</span><button data-nav data-act="back" class="btn primary">Tamam</button></div></div>`,true);
 UI.querySelectorAll('[data-toggle]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.toggle;S[k]=!S[k];saveS();sfx.ui();b.setAttribute('aria-checked',S[k]);const s=b.querySelector('.switch');s.classList.toggle('on',S[k]);s.querySelector('i').innerHTML=S[k]?icon('check',14):'';$('fps').hidden=!S.showFps}));
 UI.querySelectorAll('[data-quality]').forEach(b=>b.addEventListener('click',()=>{S.quality=b.dataset.quality;saveS();UI.querySelectorAll('[data-quality]').forEach(x=>x.classList.toggle('on',x===b));sfx.uiMove()}));
 UI.querySelectorAll('[data-vol]').forEach(r=>{r.addEventListener('input',()=>{S[r.dataset.vol]=r.value/100;r.parentElement.querySelector('.val').textContent=r.value;sfx.unlock();sfx.applyVol();saveS()});r.addEventListener('change',()=>sfx.ui())});
 bind({back:()=>showMain(),controls:()=>showControls()});focusFirst();
}
function showControls(){
 BACK=()=>{CANCEL_CAP?.();showSettings()};
 mount('controls',`<div class="dialog ctlDialog"><div class="headline" style="font-size:28px">Kontroller</div><div class="ctlGrid">${['p1','p2'].map((pl,i)=>`<div class="ctlCol"><div class="ctlHead"><span class="dot ${i?'b':'o'}"></span>Oyuncu ${i+1}</div>${ACTN.map(([a,n])=>`<div class="ctlRow"><span>${n}</span><button data-nav class="keyBtn" data-p="${pl}" data-a="${a}"></button></div>`).join('')}</div>`).join('')}</div>
  <div class="ctlHint">Tuşa tıkla, yeni tuşa bas (Esc vazgeçer). Şut tuşunu basılı tutarsan top değdiği an vurursun (Haxball gibi). Tek oyunculuda iki tuş takımı da çalışır. Kol: 1. kol Oyuncu 1, 2. kol Oyuncu 2; A şut, B/X yetenek, Start duraklat.</div>
  <div class="dactions"><button data-nav data-act="reset" class="btn secondary">Varsayılan tuşlar</button><button data-nav data-act="back" class="btn primary">Tamam</button></div></div>`,true);
 const paint=()=>UI.querySelectorAll('.keyBtn').forEach(b=>{b.textContent=keyLabel(S.keys[b.dataset.p][b.dataset.a]);b.classList.remove('wait')});paint();
 UI.querySelectorAll('.keyBtn').forEach(b=>b.addEventListener('click',()=>{paint();b.textContent='Tuşa bas…';b.classList.add('wait');capture={pl:b.dataset.p,act:b.dataset.a,done:()=>{paint();b.focus({preventScroll:true})}};CANCEL_CAP=()=>{capture=null}}));
 bind({back:()=>BACK(),reset:()=>{S.keys=clone(DEFKEYS);saveS();paint()}});focusFirst();
}
function toggleMute(){S.muted=!S.muted;saveS();sfx.unlock();sfx.applyVol();paintHudBtns();toast(S.muted?'Ses kapalı':'Ses açık')}
function toggleFs(){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.().catch(()=>toast('Tam ekran bu pencerede açılamıyor'))}catch(e){toast('Tam ekran bu pencerede açılamıyor')}setTimeout(paintHudBtns,300)}
function paintHudBtns(){$('btnSound').innerHTML=icon(S.muted?'volumeOff':'volumeOn',20);$('btnFull').innerHTML=icon(document.fullscreenElement?'fsExit':'fs',20);$('btnPause').innerHTML=icon('pause',18)}
let toastT=null;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('show'),1800)}
$('btnSound').onclick=()=>toggleMute();$('btnFull').onclick=()=>toggleFs();$('btnPause').onclick=()=>togglePause();

/* ----- turnuva ----- */
const BYE=-1,TYPES=[['human','İnsan'],['kolay','YZ Kolay'],['orta','YZ Orta'],['zor','YZ Zor']],TDIFF={kolay:0,orta:1,zor:2},TSTR={kolay:1,orta:1.6,zor:2.4};
class Tournament{
 constructor(entrants){this.entrants=entrants.map((e,i)=>({...e,id:i}));const n=this.entrants.length,size=n<=2?2:n<=4?4:8;const order=this.entrants.map(e=>e.id).sort(()=>rnd()-.5);const byes=size-n,first=[];let k=0;
  for(let m=0;m<size/2;m++){const a=order[k++],b=m<byes?BYE:order[k++];first.push({a,b,winner:undefined,score:null})}this.rounds=[first];for(let len=size/4;len>=1;len/=2)this.rounds.push(Array.from({length:len},()=>({a:undefined,b:undefined,winner:undefined,score:null})));this.resolveByes()}
 roundName(r){const left=this.rounds.length-r;return left===1?'Final':left===2?'Yarı final':left===3?'Çeyrek final':`${r+1}. tur`}
 resolveByes(){let ch=true;while(ch){ch=false;this.rounds.forEach((round,r)=>round.forEach((m,i)=>{if(m.winner!==undefined)return;if(m.a!==undefined&&m.b===BYE){this.setWinner(r,i,m.a,null);ch=true}else if(m.b!==undefined&&m.a===BYE){this.setWinner(r,i,m.b,null);ch=true}}))}}
 setWinner(r,i,w,score){const m=this.rounds[r][i];m.winner=w;m.score=score;if(r+1<this.rounds.length){const nx=this.rounds[r+1][Math.floor(i/2)];if(i%2===0)nx.a=w;else nx.b=w}}
 nextMatch(){for(let r=0;r<this.rounds.length;r++)for(let i=0;i<this.rounds[r].length;i++){const m=this.rounds[r][i];if(m.winner===undefined&&m.a>=0&&m.b>=0)return{r,i,match:m}}return null}
 report(r,i,score,side){const m=this.rounds[r][i];this.setWinner(r,i,side===0?m.a:m.b,score);this.resolveByes()}
 get champion(){const f=this.rounds[this.rounds.length-1][0];return f.winner!==undefined&&f.winner>=0?this.entrants[f.winner]:null}
 get isOver(){return !!this.champion}
 humansIn(m){return[m.a,m.b].filter(id=>this.entrants[id].type==='human').length}
}
function quickResult(ta,tb){const sa=TSTR[ta]||1.6,sb=TSTR[tb]||1.6,pA=sa/(sa+sb),s=[0,0];const goals=2+(rnd()*4|0);for(let i=0;i<goals;i++)s[rnd()<pA?0:1]++;let side=s[0]>s[1]?0:s[1]>s[0]?1:(rnd()<pA?0:1);return{s,side}}
function showTourSetup(count){
 let saved=null;try{saved=JSON.parse(localStorage.getItem('hf_entrants')||'null')}catch(e){}
 let list=(saved&&saved.length>=2?saved:[{name:'Oyuncu 1',type:'human'},{name:'Oyuncu 2',type:'orta'},{name:'Oyuncu 3',type:'orta'},{name:'Oyuncu 4',type:'orta'}]).map(e=>({...e}));
 if(count){list=list.slice(0,count);while(list.length<count)list.push({name:`YZ ${list.length+1}`,type:'orta'})}
 BACK=()=>showOptionsStep();
 const render=()=>{
  mount('tsetup',`<div class="dialog tsetup"><div class="headline">Turnuva</div><div class="supporting">2–8 oyuncu. İsimleri yazın; insan oyuncular sırayla Oyuncu 1 / Oyuncu 2 tuşlarıyla oynar. Eşleşmeler rastgele.</div>
   <div class="tlist">${list.map((e,i)=>`<div class="trow"><span class="tn">${i+1}</span><input type="text" maxlength="14" value="${esc(e.name)}" data-i="${i}" aria-label="${i+1}. oyuncunun adı" spellcheck="false" autocomplete="off"><button class="ttype ${e.type==='human'?'':'ai'}" data-type="${i}">${TYPES.find(([id])=>id===e.type)[1]}</button><button class="tdel" data-del="${i}" title="Çıkar" ${list.length<=2?'disabled':''}>${icon('close',16)}</button></div>`).join('')}</div>
   ${list.length<8?`<button class="btn text tadd" data-act="add">${icon('add',18)}Oyuncu ekle</button>`:''}
   <div class="tfmt">Her maç ${S.dur} dk · ${FORMATS[S.format].n}${S.et?' · uzatma':''} · beraberlikte penaltı. Ayarlar adımında değiştirilebilir.</div>
   <div class="dactions left"><button class="btn primary" data-act="start">Turnuvayı başlat</button><button class="btn text" data-act="cancel">Geri</button></div></div>`,true);
  UI.querySelectorAll('input[data-i]').forEach(inp=>{inp.addEventListener('input',()=>{list[+inp.dataset.i].name=inp.value});inp.addEventListener('keydown',e=>{if(e.key==='Enter'){const nx=UI.querySelector(`input[data-i="${+inp.dataset.i+1}"]`);(nx||UI.querySelector('[data-act="start"]')).focus({preventScroll:true})}})});
  UI.querySelectorAll('[data-type]').forEach(b=>b.addEventListener('click',()=>{const e=list[+b.dataset.type],k=TYPES.findIndex(([id])=>id===e.type);e.type=TYPES[(k+1)%TYPES.length][0];if(/^(Oyuncu|YZ) [0-9]+$/.test(e.name.trim()))e.name=`${e.type==='human'?'Oyuncu':'YZ'} ${+b.dataset.type+1}`;sfx.uiMove();render();UI.querySelector(`[data-type="${b.dataset.type}"]`)?.focus({preventScroll:true})}));
  UI.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>{list.splice(+b.dataset.del,1);sfx.uiMove();render()}));
  bind({add:()=>{list.push({name:`Oyuncu ${list.length+1}`,type:'human'});render()},cancel:()=>BACK(),start:()=>{const ent=list.map((e,i)=>({name:e.name.trim()||`Oyuncu ${i+1}`,type:e.type}));try{localStorage.setItem('hf_entrants',JSON.stringify(ent))}catch(e){}TOUR=new Tournament(ent);showBracket()}});
 };
 render();UI.querySelector('input[data-i]')?.focus({preventScroll:true});
}
function showBracket(){
 ensureDemo();const t=TOUR;if(t.isOver){showChampion();return}const nm=t.nextMatch();BACK=()=>showMain();
 const nameOf=id=>id===BYE?'Bay':id===undefined?'?':esc(t.entrants[id].name),typeOf=id=>id>=0&&t.entrants[id].type!=='human'?`<em>${TYPES.find(([k])=>k===t.entrants[id].type)[1]}</em>`:'';
 const box=(m,r,i)=>{const cur=nm&&nm.r===r&&nm.i===i,line=(id,k)=>{const won=m.winner!==undefined&&m.winner===id&&id>=0,lost=m.winner!==undefined&&m.winner!==id;return`<div class="bl ${won?'won':''} ${lost?'lost':''} ${id===BYE||id===undefined?'tbd':''}"><span class="bn">${nameOf(id)}${typeOf(id)}</span><span class="bs">${m.score?m.score[k]:''}</span></div>`};return`<div class="bm ${cur?'cur':''}">${line(m.a,0)}${line(m.b,1)}</div>`};
 const A=nm&&t.entrants[nm.match.a],B=nm&&t.entrants[nm.match.b],aiOnly=nm&&t.humansIn(nm.match)===0;
 mount('bracket',`<div class="dialog bracket"><div class="bTop"><div class="headline">Turnuva</div><div class="supporting">${t.entrants.length} oyuncu · ${FORMATS[S.format].n} · ${S.dur} dk</div></div>
  <div class="bgrid">${t.rounds.map((round,r)=>`<div class="bcol"><div class="bhead">${t.roundName(r)}</div><div class="bmatches">${round.map((m,i)=>box(m,r,i)).join('')}</div></div>`).join('')}</div>
  <div class="bNext">${nm?`<span class="bl2">${t.roundName(nm.r)}</span><b>${esc(A.name)}</b><span class="vsx">-</span><b>${esc(B.name)}</b>`:''}</div>
  <div class="dactions left"><button data-nav class="btn primary" data-act="play">${aiOnly?'İzle':'Maça başla'}</button>${aiOnly?'<button data-nav class="btn secondary" data-act="quick">Hızlı sonuç</button>':''}<button data-nav class="btn text" data-act="new">Yeni turnuva</button><button data-nav class="btn text" data-act="menu">Ana menü</button></div></div>`,true);
 bind({menu:()=>showMain(),new:()=>{TOUR=null;FLOW={pick:'tour',players:'multi',count:FLOW.count||4};showPlayersStep()},quick:()=>{const q=quickResult(A.type,B.type);t.report(nm.r,nm.i,q.s,q.side);showBracket()},play:()=>tourPlay()});
 UI.querySelector('[data-act="play"]')?.focus({preventScroll:true});
}
function tourPlay(){
 const t=TOUR,nm=t.nextMatch();if(!nm)return;const A=t.entrants[nm.match.a],B=t.entrants[nm.match.b];
 const hA=A.type==='human',hB=B.type==='human';
 const cfg=baseCfg('tour');cfg.pens=true;cfg.names=[A.name,B.name];cfg.tour={r:nm.r,i:nm.i};
 cfg.ctrl=[hA?(hB?'p1':'p1x'):'ai',hB?(hA?'p2':'p1x'):'ai'];
 cfg.diffT=[hA?S.diff:TDIFF[A.type],hB?S.diff:TDIFF[B.type]];
 if(!hA&&!hB){cfg.chars=[rnd()*CHARS.length|0,0];do{cfg.chars[1]=rnd()*CHARS.length|0}while(cfg.chars[1]===cfg.chars[0]);showVs(cfg,()=>beginMatch(cfg));return}
 showSelect({sides:[{name:A.name,ai:!hA},{name:B.name,ai:!hB}],prev:S.c,title:`${t.roundName(nm.r)}: karakterini seç`,onBack:()=>showBracket(),onDone:(picks)=>{cfg.chars=picks;showVs(cfg,()=>beginMatch(cfg))}});
}
function showTourResult(w){
 const c=G.cfg,t=TOUR,s=G.score,side=w<0?0:w;t.report(c.tour.r,c.tour.i,[...s],side);
 const winner=c.names[side],isOver=t.isOver;BACK=()=>{$('game').classList.remove('inMatch');G=null;startDemo();showBracket()};
 mount('tresult',`<div class="dialog end" style="--team:${TEAM[side].color}"><div class="endTop"><div><div class="headline">${esc(winner)} ${isOver?'turnuvayı kazandı':'turu geçti'}</div><div class="supporting">${esc(c.names[0])} - ${esc(c.names[1])}${G.penScore?` · penaltılar ${G.penScore[0]}–${G.penScore[1]}`:''}</div></div>
  <div class="finalScore"><span class="o">${s[0]}</span><span class="sep">–</span><span class="b">${s[1]}</span></div></div><div class="dactions"><button data-nav class="btn primary" data-act="next">${isOver?'Şampiyonu gör':'Ağaca dön'}</button></div></div>`,true);
 bind({next:()=>BACK()});setTimeout(()=>UI.querySelector('[data-act="next"]')?.focus({preventScroll:true}),50);
}
function showChampion(){
 const t=TOUR,ch=t.champion,path=[];BACK=()=>showMain();
 t.rounds.forEach((round,r)=>round.forEach(m=>{if(m.winner===ch.id&&m.score){const opp=m.a===ch.id?m.b:m.a,sc=m.a===ch.id?m.score:[m.score[1],m.score[0]];path.push(`<li><span>${t.roundName(r)}</span><b>${sc[0]}–${sc[1]}</b><span>${esc(t.entrants[opp].name)}</span></li>`)}}));
 mount('champion',`<div class="champ"><div class="cTrophy">${icon('trophy',64)}</div><div class="cLabel">Şampiyon</div><div class="cName">${esc(ch.name)}</div><ul class="cPath">${path.join('')}</ul><div class="dactions center"><button data-nav class="btn text" data-act="menu">Ana menü</button><button data-nav class="btn primary" data-act="new">Yeni turnuva</button></div></div>`,true);
 if(G&&G.demo){G.fireworks=8;G.winner=0}sfx.win();if(ch.type==='human')unlock('champ');
 bind({menu:()=>{TOUR=null;showMain()},new:()=>{TOUR=null;FLOW={pick:'tour',players:'multi',count:t.entrants.length};showPlayersStep()}});UI.querySelector('[data-act="new"]')?.focus({preventScroll:true});
}

/* ======================= KLAVYE ======================= */
const NAV_PREV=new Set(['ArrowUp','ArrowLeft','KeyW','KeyA']),NAV_NEXT=new Set(['ArrowDown','ArrowRight','KeyS','KeyD']);
addEventListener('keydown',e=>onKey(e));
function onKey(e){
 if(capture){e.preventDefault();e.stopPropagation();if(e.code!=='Escape'&&e.code!=='KeyM'){const{pl,act}=capture,old=S.keys[pl][act];for(const k of['p1','p2'])for(const a in S.keys[k])if(S.keys[k][a]===e.code)S.keys[k][a]=old;S.keys[pl][act]=e.code;saveS();sfx.uiMove()}const d=capture.done;capture=null;d&&d();return}
 const inInput=e.target instanceof HTMLInputElement&&e.target.type==='text';
 if(inInput){if(e.code==='Escape')BACK&&BACK();return}
 sfx.unlock();
 const inMatch=SCREEN==='match'&&G&&!G.demo&&!G.paused;
 if(inMatch&&isGameKey(e.code))e.preventDefault();
 if(e.code==='KeyM'&&!e.repeat){toggleMute();return}
 if(e.code==='Escape'){if(inMatch||SCREEN==='pause')togglePause();else if(BACK)BACK();return}
 if(!e.repeat){down.add(e.code);for(const k of['p1','p2']){if(e.code===S.keys[k].kick)edge[k].kick=true;if(e.code===S.keys[k].ab)edge[k].ab=true}}else down.add(e.code);
 if(inMatch){
  if(G.phase==='break'&&G.timer<3.4&&(e.code===S.keys.p1.kick||e.code===S.keys.p2.kick))G.timer=0;
  if(G.phase==='replay'&&!e.repeat&&(e.code===S.keys.p1.kick||e.code===S.keys.p2.kick||e.code==='Space'))afterGoal(G.replay.team);
  return}
 if(SCREEN==='vs')return;
 if(SCREEN==='select'){if(!e.repeat&&selectKey(e.code))e.preventDefault();return}
 if(document.activeElement?.type==='range'&&(e.code==='ArrowLeft'||e.code==='ArrowRight'))return;
 const items=[...UI.querySelectorAll('[data-nav]')];if(!items.length)return;const i=items.indexOf(document.activeElement);
 if(NAV_PREV.has(e.code)){e.preventDefault();(items[i-1]||items[items.length-1]).focus({preventScroll:true});sfx.uiMove();return}
 if(NAV_NEXT.has(e.code)){e.preventDefault();(items[i+1]||items[0]).focus({preventScroll:true});sfx.uiMove();return}
 if((e.code==='Enter'||e.code==='Space'||e.code==='NumpadEnter')&&i<0){e.preventDefault();items[0].focus({preventScroll:true})}
}
addEventListener('keyup',e=>down.delete(e.code));addEventListener('blur',()=>down.clear());
/* ----- gamepad: 1. kol Oyuncu 1, 2. kol Oyuncu 2 ----- */
const PAD=[{},{}];
const fakeKey=code=>({code,repeat:false,target:document.body,preventDefault(){},stopPropagation(){}});
function padPress(i,a){
 const st=PAD[i];if(a==='start'){onKey(fakeKey('Escape'));return}
 const set=S.keys[i?'p2':'p1'];
 if(capture){onKey(fakeKey(set[a]));return}
 if(SCREEN==='match'||SCREEN==='select'||SCREEN==='vs'){const code=set[a];st[a+'C']=code;onKey(fakeKey(code));return}
 // menüler
 if(a==='kick'){const el=document.activeElement;if(el&&UI.contains(el)&&el.click){sfx.unlock();el.click()}else onKey(fakeKey('Enter'));return}
 if(a==='ab'){onKey(fakeKey('Escape'));return}
 const el=document.activeElement;if(el&&el.type==='range'&&(a==='left'||a==='right')){el.value=+el.value+(a==='left'?-5:5);el.dispatchEvent(new Event('input'));return}
 onKey(fakeKey({up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight'}[a]));
}
function padRelease(i,a){const c=PAD[i][a+'C'];if(c){down.delete(c);PAD[i][a+'C']=null}}
function pollPads(){
 if(!navigator.getGamepads)return;let list;try{list=[...navigator.getGamepads()].filter(g=>g&&g.connected)}catch(e){return}
 for(let i=0;i<2;i++){const g=list[i],st=PAD[i];
  const b=n=>!!(g&&g.buttons[n]&&g.buttons[n].pressed),ax=g?g.axes[0]||0:0,ay=g?g.axes[1]||0:0;
  const want={up:ay<-.5||b(12),down:ay>.5||b(13),left:ax<-.5||b(14),right:ax>.5||b(15),kick:b(0)||b(7),ab:b(1)||b(2)||b(5)||b(6),start:b(9)};
  for(const a in want){if(want[a]&&!st[a]){st[a]=true;padPress(i,a)}else if(!want[a]&&st[a]){st[a]=false;padRelease(i,a)}}}
}
/* ----- dokunmatik kontroller ----- */
function touchSkip(){if(!G||G.demo||SCREEN!=='match')return false;if(G.phase==='replay'){afterGoal(G.replay.team);return true}if(G.phase==='break'&&G.timer<3.4){G.timer=0;return true}return false}
function updTouchVis(){const on=TOUCH.on&&SCREEN==='match'&&G&&!G.demo&&!G.paused&&G.phase!=='over';document.body.classList.toggle('touchOn',!!on);
 if(on){const p=G.players.find(q=>q.main&&q.ctrl!=='ai');const ab=$('tAb');if(p&&ab){const c=p.cd>0&&p.noCd<=0;ab.classList.toggle('cd',c);const t=c?String(Math.ceil(p.cd/60)):p.meter>=1?'HYPER':'YETENEK';if(ab.textContent!==t)ab.textContent=t}}
 if(!on&&(TOUCH.mx||TOUCH.my||TOUCH.kick)){TOUCH.mx=TOUCH.my=0;TOUCH.kick=false;TOUCH.id=null;$('joyBase').style.display='none'}}
{const zone=$('tZone'),base=$('joyBase'),knob=$('joyKnob');
 const end=e=>{if(e.pointerId!==TOUCH.id)return;TOUCH.id=null;TOUCH.mx=TOUCH.my=0;base.style.display='none'};
 zone.addEventListener('pointerdown',e=>{e.preventDefault();sfx.unlock();const pr=$('btnPause').getBoundingClientRect();if(e.clientX>=pr.left-8&&e.clientX<=pr.right+8&&e.clientY>=pr.top-8&&e.clientY<=pr.bottom+8){togglePause();return}if(touchSkip())return;TOUCH.id=e.pointerId;TOUCH.ox=e.clientX;TOUCH.oy=e.clientY;base.style.left=e.clientX+'px';base.style.top=e.clientY+'px';base.style.display='block';knob.style.transform='';try{zone.setPointerCapture(e.pointerId)}catch(_){}});
 zone.addEventListener('pointermove',e=>{if(e.pointerId!==TOUCH.id)return;let dx=e.clientX-TOUCH.ox,dy=e.clientY-TOUCH.oy;const l=Math.hypot(dx,dy);
  // parmak çok uzaklaşırsa merkez peşinden gelir
  if(l>70){TOUCH.ox+=dx/l*(l-70);TOUCH.oy+=dy/l*(l-70);base.style.left=TOUCH.ox+'px';base.style.top=TOUCH.oy+'px';dx=e.clientX-TOUCH.ox;dy=e.clientY-TOUCH.oy}
  const L=Math.hypot(dx,dy),mag=clamp((L-8)/34,0,1);TOUCH.mx=L?dx/L*mag:0;TOUCH.my=L?dy/L*mag:0;const k=Math.min(L,46);knob.style.transform=`translate(${L?dx/L*k:0}px,${L?dy/L*k:0}px)`});
 zone.addEventListener('pointerup',end);zone.addEventListener('pointercancel',end);
 const btn=(el,down,up)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();sfx.unlock();el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}down()});const u=()=>{el.classList.remove('on');up&&up()};el.addEventListener('pointerup',u);el.addEventListener('pointercancel',u)};
 btn($('tKick'),()=>{if(touchSkip())return;TOUCH.kick=true;TOUCH.ek=true},()=>{TOUCH.kick=false});
 btn($('tAb'),()=>{TOUCH.ea=true});
 // dokunmatikte ilk dokunuşta tam ekran + yatay kilit dene
 if(IS_TOUCH){const fs=()=>{document.removeEventListener('pointerup',fs);try{const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen({navigationUI:'hide'}).then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(_){}}).catch(()=>{})}catch(_){}};document.addEventListener('pointerup',fs)}
}
addEventListener('gamepadconnected',e=>{const n=[...(navigator.getGamepads?navigator.getGamepads():[])].filter(Boolean).length;toast(`Kol bağlandı: Oyuncu ${Math.min(2,n)}`)});
document.addEventListener('pointerdown',()=>sfx.unlock());
UI.addEventListener('click',e=>{if(SCREEN==='replay')return});
$('cv').addEventListener('pointerdown',()=>{if(G&&!G.demo&&G.phase==='replay')afterGoal(G.replay.team)});

/* ======================= BAŞLAT ======================= */
paintHudBtns();$('fps').hidden=!S.showFps;layout();startDemo();showMain();
const fontReady=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
fontReady.then(()=>{$('loading').remove()});
requestAnimationFrame(loop);
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)&&location.hostname.indexOf('claude')<0)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
if(typeof window.__HFTEST!=='undefined')window.__HF={sfx,TOUCH,step,G:()=>G,startMatch,S,render:()=>render(.016),updateReal,showMain,showOptionsStep,showSelect,launch,showSettings,showStats,showControls,showEnd:(w)=>showEnd(w),showTourSetup,showBracket,FLOW:()=>FLOW,setFlow:f=>Object.assign(FLOW,f),Tournament,setTour:t=>{TOUR=t},showPause,endMatch};
