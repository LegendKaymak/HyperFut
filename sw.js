const V='hf-b1fcbf5c',CORE=["./", "index.html", "app.css", "data.js", "sfx.js", "game.js", "draw.js", "ui.js", "manifest.webmanifest", "icon-192.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==V+'-f').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin!==location.origin){if(/fonts[.](googleapis|gstatic)[.]com$/.test(u.hostname))e.respondWith(caches.open(V+'-f').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{c.put(r,res.clone());return res}))));return}
 e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
