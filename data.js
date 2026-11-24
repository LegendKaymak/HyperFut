
'use strict';
const $=id=>document.getElementById(id);
const VW=1280,VH=720,K16=1.6;
const W=1000,H=520,FX=140,FY=150,GW=150,GD=44,GY1=H/2-GW/2,GY2=H/2+GW/2,PR=15,KR=17,BR=10,MARGIN=36,POST=7,CX=W/2,CY=H/2,CIRC=80,PBOX=160,PSPOT=128;
const ACC=.12,DAMP=.955,KACC=.075,BDAMP=.991,KICK=6.4;
const LIMITS=[2700,5400,6300,7200];
const rnd=Math.random,clamp=(v,a,b)=>v<a?a:v>b?b:v,pick=a=>a[rnd()*a.length|0],rr=(a,b)=>a+rnd()*(b-a);
const clone=o=>JSON.parse(JSON.stringify(o));
const hexRgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const lum=h=>{const[r,g,b]=hexRgb(h);return(0.299*r+0.587*g+0.114*b)/255};
const cdist=(a,b)=>{const x=hexRgb(a),y=hexRgb(b);return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2])};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ======================= VERİ ======================= */
const CHARS=[
 ['kokcu','Kökçü',10,'#2b2d33','#0e0f12','#cfd2dc','Beşiktaş · Oyun kurucu','hizli','yavasZaman','zamanDurdur'],
 ['osimhen','Osimhen',45,'#e3262f','#8c1218','#ff8a8f','Galatasaray · Santrfor','hizli','gucSutu','lav'],
 ['vinicius','Vinícius',7,'#20a356','#0f6332','#8cf0b4','Real Madrid · Sol kanat','cevik','atilma','pike'],
 ['arda','Arda Güler',15,'#e8e6f0','#9a97ad','#ffffff','Real Madrid · Falso ustası','hizli','falso','buyuluKivrim'],
 ['skriniar','Škriniar',37,'#1f3c96','#0c1d55','#8fb0ff','Fenerbahçe · Stoper','dev','kalkan','kaleDuvari'],
 ['yamal','Yamal',10,'#1f4fb0','#0d2766','#a8c4ff','Barcelona · Top cambazı','yapiskan','miknatis','superMiknatis'],
 ['haaland','Haaland',9,'#6cb6e6','#2c6f9e','#d9f0ff','Manchester City · Santrfor','sert','sokDalgasi','goktasi'],
 ['trossard','Trossard',19,'#8c9099','#4c5058','#e2e4e8','Beşiktaş · Akıllı forvet','hizli','isinlanma','golgeAdimi'],
 ['bellingham','Bellingham',5,'#d7d9e6','#7c7f96','#ffffff','Real Madrid · Box-to-box','cevik','dondur','buzDevri'],
 ['barisalper','Barış Alper',53,'#f29a1f','#a3520b','#ffd98a','Galatasaray · Enerji','dev','sasirt','kabus'],
 ['greenwood','Greenwood',11,'#ffd21f','#a07f00','#fff4b0','Fenerbahçe · Kanat','cevik','ruzgar','kasirga'],
 ['muriqi','Muriqi',19,'#2c4fbf','#13286e','#9db5ff','Fenerbahçe · Pivot santrfor','sert','sisme','devTunc'],
 ['mbappe','Mbappé',10,'#2048b8','#0f2366','#9ec0ff','Real Madrid · Şimşek','cevik','turbo','isikHizi'],
 ['leao','Leão',27,'#c8151f','#6e0a10','#ff8088','Galatasaray · Kanat','hizli','hayalet','aynalar'],
 ['salah','Salah',10,'#8a1538','#4d0a1f','#f07a9c','Trabzonspor · Kral','sert','karaDelik','supernova'],
 ['vlahovic','Vlahović',28,'#f1f1f3','#9a9aa3','#ffffff','Beşiktaş · Hedef santrfor','dev','kokSal','derinKok'],
 ['messi','Messi',10,'#f4a6c8','#b3557e','#ffe0ee','Inter Miami · Efsane','yapiskan','solo','kecimodu'],
 ['ronaldo','Ronaldo',7,'#f5d000','#1f3a8a','#fff3a0','Al Nassr · Golcü','sert','roketSut','siuuu'],
 ['kane','Kane',9,'#dc052d','#7a0218','#ff8a9e','Bayern · Bitirici','sert','nisanci','kaptan'],
 ['debruyne','De Bruyne',11,'#12a0d7','#07587a','#9fe2ff','Napoli · Pas ustası','cevik','ruzgar','kontraAtak'],
 ['calhanoglu','Çalhanoğlu',20,'#0068a8','#0b1f3a','#8fc8ff','Inter · Frikik ustası','sert','frikik','uzakSut'],
 ['kenan','Kenan Yıldız',10,'#ececec','#2a2a2e','#ffffff','Juventus · Genç yıldız','cevik','atilma','yildizKayar'],
 ['pedri','Pedri',8,'#a50044','#4a0020','#ff8fb8','Barcelona · Tiki-taka','hizli','boslukBul','tikitaka'],
 ['vandijk','Van Dijk',4,'#c8102e','#6a0716','#ff8c9c','Liverpool · Duvar stoper','dev','mudahale','kaya'],
 ['onuachu','Onuachu',30,'#5ba7dc','#2b5f87','#bfe2ff','Trabzonspor · Hantal santrfor','hantal','kafaVurusu','tokezleme'],
].map(([id,name,num,color,dark,light,style,passive,active,hyper])=>({id,name,num,color,dark,light,style,passive,active,hyper,ui:lum(color)<.42?light:color}));
// Kökçü: takımın yıldızı, diğerlerinden biraz daha güçlü
Object.assign(CHARS.find(c=>c.id==='kokcu'),{spd:1.06,kick:1.1,cdMul:.75,star:true});
// Onuachu: oyunun en kötüsü
Object.assign(CHARS.find(c=>c.id==='onuachu'),{spd:.88,kick:.85,cdMul:1.35,weak:true});
const KEEPER={id:'kaleci',name:'Kaleci',num:1,color:'#ffe66d',dark:'#b8a12a',light:'#fff3b0',passive:null,active:null,hyper:null};
const PASSIVES={
 hizli:{n:'Hızlı Ayaklar',d:'%8 daha hızlı koşar',spd:1.08},
 cevik:{n:'Çevik',d:'Daha hızlı hızlanır, keskin döner',acc:1.2,spd:1.03},
 dev:{n:'Dev Disk',d:'%12 büyük ve ağır, %5 yavaş',rad:1.12,mass:1.3,spd:.95},
 sert:{n:'Sert Şut',d:'Şutlar %10 daha güçlü',kick:1.1},
 yapiskan:{n:'Yapışkan Top',d:'Topu çok kolay sürer, %3 hızlı',drib:1.9,spd:1.03},
 hantal:{n:'Hantal',d:'Ağır, yavaş; topu ayağından kaçırır',spd:.84,acc:.7,kick:.8,drib:.35,mass:1.2},
};
const ACTIVES={
 gucSutu:{n:'Güç Şutu',d:'Sonraki şut %60 güçlü ve alevli',cd:9,cat:'shot'},
 yavasZaman:{n:'Yavaş Zaman',d:'Top 1.5 sn yavaşlar',cd:12,cat:'save'},
 atilma:{n:'Atılma',d:'Gittiğin yöne ani atılır',cd:4,cat:'move'},
 falso:{n:'Falso',d:'Sonraki şut kıvrılır; yön tuşuyla kavis seç',cd:7,cat:'shot'},
 kalkan:{n:'Kalkan',d:'5 sn kalene giren topu bir kez geri çevirir',cd:14,cat:'save'},
 miknatis:{n:'Mıknatıs',d:'Topu 1 sn ayağının önüne çeker',cd:11,cat:'ball'},
 sokDalgasi:{n:'Şok Dalgası',d:'Yakındaki rakipleri ve topu savurur',cd:9,cat:'aoe'},
 isinlanma:{n:'Işınlanma',d:'Gittiğin yöne anında ışınlanır',cd:7,cat:'move'},
 dondur:{n:'Dondur',d:'En yakın rakip 1.1 sn donar',cd:11,cat:'debuff'},
 sasirt:{n:'Şaşırt',d:'En yakın rakibin yönleri 1.3 sn ters döner',cd:12,cat:'debuff'},
 ruzgar:{n:'Rüzgâr',d:'Top 1.2 sn rakip kaleye doğru itilir',cd:12,cat:'attack'},
 sisme:{n:'Şişme',d:'4 sn %35 büyür ve ağırlaşır',cd:13,cat:'def'},
 turbo:{n:'Turbo',d:'3 sn %40 hızlı koşar',cd:10,cat:'move'},
 hayalet:{n:'Hayalet',d:'2 sn oyuncuların içinden geçer, hızlanır',cd:9,cat:'move'},
 karaDelik:{n:'Kara Delik',d:'Top 0.9 sn rakip kalenin önüne çekilir',cd:15,cat:'attack'},
 kokSal:{n:'Kök Sal',d:'En yakın rakip 2 sn neredeyse duramaz halde yavaşlar',cd:12,cat:'debuff'},
 solo:{n:'Solo Çalım',d:'Top ayağına yapışır, 1.5 sn hızlanırsın',cd:10,cat:'ball'},
 roketSut:{n:'Roket Şut',d:'Sonraki şut %75 güçlü',cd:11,cat:'shot'},
 nisanci:{n:'Nişancı',d:'Sonraki şut hafifçe kaleye yönelir',cd:10,cat:'shot'},
 frikik:{n:'Frikik',d:'Sonraki şut sert ve kavisli',cd:9,cat:'shot'},
 boslukBul:{n:'Boşluk Bul',d:'Kısa ışınlanır, 1.5 sn hızlanır',cd:8,cat:'move'},
 kafaVurusu:{n:'Kafa Vuruşu',d:'Sonraki şut azıcık sertleşir (çoğu zaman auta gider)',cd:18,cat:'shot'},
 mudahale:{n:'Müdahale',d:'Yakındaki rakipleri iter, en yakını yavaşlar',cd:9,cat:'aoe'},
};
const HYPERS={
 lav:{n:'Lav Yağmuru',d:'Sonraki şut 2 kat güçlü, top lav topuna döner'},
 zamanDurdur:{n:'Zaman Durdur',d:'Bütün rakipler 2 sn donar'},
 pike:{n:'Pike',d:'6 sn çok hızlı, atılma beklemesiz'},
 buyuluKivrim:{n:'Büyülü Kıvrım',d:'Sonraki şut çok sert ve uzun kıvrılır'},
 kaleDuvari:{n:'Kale Duvarı',d:'7 sn kalene gol girmez'},
 superMiknatis:{n:'Süper Mıknatıs',d:'4 sn top sana yapışır'},
 goktasi:{n:'Göktaşı',d:'Dev şok dalgası; yakındaki rakipler sersemler'},
 golgeAdimi:{n:'Gölge Adımı',d:'Topun arkasına ışınlanır, 3 sn hızlanır'},
 buzDevri:{n:'Buz Devri',d:'Bütün rakipler 3.5 sn yavaşlar'},
 kabus:{n:'Kâbus',d:'Bütün rakiplerin yönleri 2.5 sn ters döner'},
 kasirga:{n:'Kasırga',d:'Top 3 sn rakip kaleye savrulur'},
 devTunc:{n:'Dev Tunç',d:'8 sn kocaman olur, şutları sertleşir'},
 isikHizi:{n:'Işık Hızı',d:'7 sn şimşek gibi koşar'},
 aynalar:{n:'Aynalar Salonu',d:'4 sn hayalet olur, 3 sahte top uçar'},
 supernova:{n:'Süpernova',d:'Sonraki şut çok hızlı ve kaleye kıvrılır'},
 derinKok:{n:'Derin Kök',d:'Bütün rakipler 2.5 sn kök salar'},
 kecimodu:{n:'Keçi Modu',d:'Top 3 sn yapışır, sonraki şut kaleye yönelir'},
 siuuu:{n:'SİUUU',d:'Sonraki şut 2.2 kat güçlü ve kaleye yönelir'},
 kaptan:{n:'Kaptan',d:'Takım hızlanır, sonraki şut kaleye yönelir'},
 kontraAtak:{n:'Kontra Atak',d:'Top rakip kaleye savrulur, takım hızlanır'},
 uzakSut:{n:'Uzaktan Füze',d:'Sonraki şut çok sert ve uzun kıvrılır'},
 yildizKayar:{n:'Yıldız Kayması',d:'5 sn çok hızlı, 3 sn hayalet'},
 tikitaka:{n:'Tiki-Taka',d:'Rakiplerin yönleri ters döner, top sana yapışır'},
 kaya:{n:'Kaya',d:'7 sn dev olur, kalen korunur'},
 tokezleme:{n:'Tökezleme',d:'Ayağı takılır: 1.5 sn yerinde sayar, sonra biraz sert vurur'},
};
const DIFF=[{n:'Kolay',re:14,err:.11,spd:.86,range:250,ab:.004},{n:'Orta',re:7,err:.055,spd:.95,range:330,ab:.012},{n:'Zor',re:3,err:.02,spd:1,range:400,ab:.03}];
const KQ=[{re:28,spd:.5,err:58,rush:40,dive:0},{re:20,spd:.6,err:40,rush:55,dive:.08},{re:13,spd:.72,err:24,rush:80,dive:.25},{re:8,spd:.86,err:12,rush:100,dive:.45},{re:4,spd:1,err:4,rush:125,dive:.7}];
const PARRY=[.2,.35,.5,.65,.82];
const KQN=['Acemi','Zayıf','Orta','İyi','Duvar'];
const FORMATS={duel:{n:'Düello',s:'1v1 · kalecisiz'},keeper:{n:'Kale Savaşı',s:'2v2 · oyuncu + kaleci'},squad:{n:'Tam Kadro',s:'3v3 · oyuncu + bot + kaleci'}};
const ARENAS=[
 {id:'gece',name:'Gece Stadı',bg:['#0c1626','#04070d'],grass:['#14502f','#17592f'],line:'rgba(255,255,255,.62)',crowd:true,note:'Standart zemin',light:'rgba(255,255,230,.10)',thumb:'radial-gradient(circle at 50% 40%,#1f6a3d,#0b2b18 70%,#081620)'},
 {id:'gunduz',name:'Gündüz',bg:['#3a6e94','#1c3a52'],grass:['#2f8a3f','#35974a'],line:'rgba(255,255,255,.8)',crowd:true,note:'Standart zemin',light:'rgba(255,255,220,.12)',thumb:'linear-gradient(#4f8fc0 0%,#2b5a7a 30%,#35974a 31%,#2f8a3f 100%)'},
 {id:'kar',name:'Kar Sahası',bg:['#8fb3da','#5c82ad'],grass:['#eef4fa','#e2ebf5'],line:'#5d8fc9',crowd:false,snow:true,bdamp:.988,pdamp:.959,note:'Top ağır, zemin kaygan',light:'rgba(255,255,255,.1)',thumb:'linear-gradient(#6f9ccf 0%,#e8f2fc 45%,#f6f9fd 46%,#dfe9f4 100%)'},
 {id:'yagmur',name:'Yağmurlu Stat',bg:['#1b2734','#0a1018'],grass:['#1b472c','#1f5031'],line:'rgba(255,255,255,.55)',crowd:true,rain:true,bdamp:.9935,pdamp:.96,note:'Top kayar, zemin ıslak',light:'rgba(200,220,255,.07)',thumb:'linear-gradient(#2b3d52 0%,#16222f 38%,#1f5031 39%,#163d26 100%)'},
 {id:'plaj',name:'Plaj',bg:['#5aa9d6','#2a6f9a'],grass:['#e8cf94','#dfc487'],line:'rgba(255,255,255,.92)',crowd:true,bdamp:.986,pdamp:.95,note:'Kum: top ağır, koşu yavaş',light:'rgba(255,250,220,.14)',thumb:'linear-gradient(#69b7e3 0%,#2f7fb0 38%,#e8cf94 39%,#d4b574 100%)'},
 {id:'salon',name:'Futsal Salonu',bg:['#2a323e','#12171e'],grass:['#d9a46c','#cf9a62'],line:'rgba(255,255,255,.85)',crowd:true,wood:true,bdamp:.9885,note:'Top hızlı durur, paslar kısa',light:'rgba(255,240,210,.12)',thumb:'linear-gradient(#1e2530 0%,#3a4554 40%,#dba46c 41%,#a86f3f 100%)'},
];
const DEFTEAMS=[{name:'Kırmızı',color:'#ff4d6d',dark:'#9e1636',light:'#ffa3b6',ui:'#ff4d6d'},{name:'Mavi',color:'#33d6ff',dark:'#0a6a8f',light:'#b0f1ff',ui:'#33d6ff'}];
const TEAM=[{...DEFTEAMS[0]},{...DEFTEAMS[1]}];
const DEFKEYS={p1:{up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',kick:'Space',ab:'ShiftLeft'},p2:{up:'ArrowUp',down:'ArrowDown',left:'ArrowLeft',right:'ArrowRight',kick:'Enter',ab:'ShiftRight'}};
const ACTN=[['up','Yukarı'],['down','Aşağı'],['left','Sol'],['right','Sağ'],['kick','Şut'],['ab','Yetenek']];

/* ======================= AYARLAR / KAYIT ======================= */
let S={format:'keeper',diff:1,dur:3,et:true,golden:false,pens:true,kq:[1,1],arena:'gece',lowFx:false,replay:true,showFps:false,quality:'auto',sfxVol:.8,ambVol:.5,muted:false,vibe:true,keys:clone(DEFKEYS),c:[0,1]};
try{const s=JSON.parse(localStorage.getItem('hf_settings')||'null');if(s&&typeof s==='object'){Object.assign(S,s);if(!s.keys||!s.keys.p1||!s.keys.p2)S.keys=clone(DEFKEYS)}}catch(e){}
const saveS=()=>{try{localStorage.setItem('hf_settings',JSON.stringify(S))}catch(e){}};
let CAREER={matches:0,goals:0,shots:0,wins:0,streak:0,best:0,seconds:0,ai:[{w:0,l:0},{w:0,l:0},{w:0,l:0}]};
try{const c=JSON.parse(localStorage.getItem('hf_career')||'null');if(c&&typeof c==='object')CAREER=Object.assign(CAREER,c)}catch(e){}
const saveC=()=>{try{localStorage.setItem('hf_career',JSON.stringify(CAREER))}catch(e){}};
const ACH=[['ilkgol','İlk Gol','Maçta gol at'],['hat','Hat-trick','Bir maçta 3 gol at'],['seri','Seri','Üst üste 3 gol at'],['clean','Gol Yok','Gol yemeden kazan'],['zor','Zoru Yendin','Zor yapay zekayı yen'],['duvar','Duvarı Aştın','Duvar kaleciye gol at'],['hyper3','Hyper Ustası','Bir maçta 3 Hyper kullan'],['asist','Pasör','Takım arkadaşına asist yap'],['pen','Soğukkanlı','Penaltı atışlarını kazan'],['champ','Şampiyon','Turnuva kazan'],['maraton','Maratoncu','10 maç oyna']];
function unlock(id){CAREER.ach=CAREER.ach||{};if(CAREER.ach[id])return;CAREER.ach[id]=Date.now();saveC();const a=ACH.find(x=>x[0]===id);if(a){setTimeout(()=>{toast(`Başarım açıldı: ${a[1]}`);sfx.menuOk=true;sfx.streak();sfx.menuOk=false},400)}}
function keyLabel(c){if(!c)return'?';const m={Space:'Boşluk',ShiftLeft:'Sol Shift',ShiftRight:'Sağ Shift',ControlLeft:'Sol Ctrl',ControlRight:'Sağ Ctrl',AltLeft:'Alt',AltRight:'AltGr',Enter:'Enter',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',NumpadEnter:'N⏎',Backspace:'⌫',Tab:'Tab',Comma:',',Period:'.',Slash:'/',Semicolon:'Ş',Quote:'İ',BracketLeft:'Ğ',BracketRight:'Ü'};
 if(m[c])return m[c];if(c.startsWith('Key'))return c.slice(3);if(c.startsWith('Digit'))return c.slice(5);if(c.startsWith('Numpad'))return'N'+c.slice(6);return c}

/* ======================= İKONLAR ======================= */
const IP={pause:'M6 19h4V5H6v14zm8-14v14h4V5h-4z',volumeOn:'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',volumeOff:'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.860-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',chevron:'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z',stats:'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',settings:'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',check:'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',fs:'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z',fsExit:'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z',trophy:'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',add:'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',close:'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',shuffle:'M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z'};
IP.install='M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z';
const icon=(n,s=20)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="${IP[n]}" fill="currentColor"/></svg>`;
const LOGO=`<svg class="mark" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="#f6f6f2"/><path d="M20 11l8 6-3 9h-10l-3-9z" fill="#202733"/><path d="M20 11V4M28 17l7-3M25 26l4 7M15 26l-4 7M12 17l-7-3" stroke="#202733" stroke-width="2"/><circle cx="20" cy="20" r="17" fill="none" stroke="#5f6670" stroke-width="1.5"/></svg>`;

