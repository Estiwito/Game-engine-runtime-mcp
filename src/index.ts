<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
<title>Pool Beats · Billiards Timing</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet">
<style>
  :root{
    --gold:#ffd700;
    --amber:#ff9f43;
    --white:#f4f4f7;
    --red:#ff4136;
    --ink:#07070b;
    --panel:#14141c;
  }
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none;}
  html,body{margin:0;height:100%;background:var(--ink);color:var(--white);font-family:'VT323',monospace;overscroll-behavior:none;}
  html,body{min-height:100vh;}
  body{display:flex;align-items:center;justify-content:center;padding:14px;overflow:hidden;}

  #stage{position:relative;width:min(92vw,420px);aspect-ratio:3/4;}
  #cab{position:absolute;inset:-10px;border-radius:18px;background:linear-gradient(145deg,#2a2a36,#101016);box-shadow:0 20px 50px rgba(0,0,0,.6), inset 0 0 0 2px #000;}
  #screen{position:absolute;inset:10px;border-radius:10px;overflow:hidden;background:#0a0a10;box-shadow:inset 0 0 24px rgba(0,0,0,.65);}
  canvas#game{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;}
  #pulse{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 20%, rgba(255,215,0,.3), transparent 62%);opacity:0;transition:opacity .1s linear;}

  .pixel{font-family:'Press Start 2P',monospace;}
  .outline{text-shadow:2px 0 #000,-2px 0 #000,0 2px #000,0 -2px #000,1px 1px #000,-1px -1px #000,1px -1px #000,-1px 1px #000;}

  #hud{position:absolute;top:0;left:0;right:0;pointer-events:none;padding:9px 10px 0;z-index:2;}
  #hud-bottom{position:absolute;left:10px;right:10px;bottom:9px;display:flex;justify-content:space-between;pointer-events:none;z-index:2;}
  .hud-top{display:flex;justify-content:center;align-items:flex-start;}
  .hud-block{display:flex;flex-direction:column;align-items:center;min-width:30%;}
  .hud-block.left{align-items:flex-start;}
  .hud-block.right{align-items:flex-end;}
  .hud-label{font-size:8px;color:var(--gold);letter-spacing:1px;}
  .hud-value{font-size:33px;color:#fff;margin-top:3px;}

  #hint{position:absolute;left:0;right:0;top:80px;text-align:center;font-size:15px;color:var(--gold);opacity:0;transition:opacity .6s;pointer-events:none;z-index:3;}

  #mute{position:absolute;top:9px;right:10px;width:26px;height:26px;border-radius:6px;background:rgba(0,0,0,.4);border:1px solid #333;color:var(--white);font-size:13px;display:flex;align-items:center;justify-content:center;pointer-events:auto;z-index:6;cursor:pointer;}

  #overlay{position:absolute;inset:0;background:rgba(4,4,8,.88);display:flex;align-items:center;justify-content:center;padding:18px;z-index:5;}
  #overlay.hide{display:none;}
  .card{background:var(--panel);border:3px solid var(--gold);border-radius:12px;padding:22px 18px;width:100%;max-width:320px;max-height:100%;overflow-y:auto;text-align:center;}
  .card h1{font-size:21px;color:var(--gold);margin:0 0 10px;line-height:1.5;}
  .card p.sub{font-size:17px;color:#c9c9d4;margin:0 0 16px;line-height:1.35;}
  .field{text-align:left;margin-bottom:12px;}
  .field label{display:block;font-size:14px;color:var(--gold);margin-bottom:4px;}
  .field input{width:100%;padding:9px 10px;border-radius:6px;border:2px solid #3a3a48;background:#0d0d12;color:#fff;font-family:'VT323',monospace;font-size:18px;}
  .field input:focus{outline:none;border-color:var(--gold);}
  .help{font-size:13px;color:#8a8a98;margin:-6px 0 14px;text-align:left;line-height:1.3;}
  button.btn{display:block;width:100%;padding:12px 10px;margin-top:10px;border:none;border-radius:8px;font-family:'Press Start 2P',monospace;font-size:11px;cursor:pointer;background:var(--gold);color:#1a0510;box-shadow:0 4px 0 #a38213;transition:transform .05s;}
  button.btn:active{transform:translateY(3px);box-shadow:0 1px 0 #a38213;}
  button.btn.secondary{background:#2b2b38;color:var(--gold);box-shadow:0 4px 0 #111116;border:2px solid var(--gold);}
  button.btn.secondary:active{box-shadow:0 1px 0 #111116;}
  button.btn.ghost{background:transparent;color:#9a9aa8;box-shadow:none;font-size:10px;text-decoration:underline;padding:8px;margin-top:6px;}

  .stat-row{display:flex;justify-content:space-between;font-size:17px;padding:5px 2px;border-bottom:1px dashed #2c2c38;}
  .stat-row span:first-child{color:#9a9aa8;}
  .stat-row span:last-child{color:var(--white);}

  #board-list{list-style:none;margin:0 0 14px;padding:0;text-align:left;max-height:260px;overflow-y:auto;}
  #board-list li{display:flex;gap:8px;font-size:16px;padding:5px 4px;border-bottom:1px solid #22222c;align-items:center;}
  #board-list li .rk{color:var(--gold);width:26px;flex:none;}
  #board-list li .nm{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  #board-list li .sc{color:var(--white);font-family:'Press Start 2P',monospace;font-size:11px;}
  #board-list li.me{background:rgba(255,215,0,.14);border-radius:6px;}
  .loading{font-size:16px;color:#8a8a98;padding:30px 0;}
  ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-thumb{background:#333;border-radius:4px;}
</style>
<meta name="theme-color" content="#000000">
</head>
<body>
<div id="stage">
  <div id="cab"></div>
  <div id="screen">
    <canvas id="game"></canvas>
    <div id="pulse"></div>
    <div id="mute" class="pixel">♪</div>
    <div id="hud">
      <div class="hud-top">
        <div class="hud-block">
          <span class="hud-label pixel outline">HITS</span>
          <span class="hud-value pixel outline" id="hud-score">0</span>
        </div>
      </div>
    </div>
    <div id="hud-bottom">
      <div class="hud-block left"><span class="hud-label pixel outline">BEST HITS</span><span class="hud-value pixel outline" id="hud-best" style="font-size:9px">0</span></div>
      <div class="hud-block right"><span class="hud-label pixel outline">RECORD</span><span class="hud-value pixel outline" id="hud-record" style="font-size:9px">0</span></div>
    </div>
    <div id="hint" class="pixel">¡GOLPEA CON EL TACO CUANDO LLEGUE LA BOLA!</div>
    <div id="overlay"><div class="card" id="card"></div></div>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
(function(){
  'use strict';

  // ================= CONFIG =================
  const LW=300, LH=400;
  const HIT_Y=110;       // Zona de impacto en la parte superior (las bolas suben desde abajo)
  const BALL_R=18;       // Radio de las bolas de billar
  const BASE_SPEED = 180; // Velocidad de subida (px/seg)
  const SPEED_INC = 4;    // Incremento por cada Hit
  const HIT_WINDOW = 32;  // Tolerancia de golpeo

  const COL_GOLD='#ffd700', COL_AMBER='#ff9f43', COL_WHITE='#f4f4f7', COL_RED='#ff4136';

  // ================= DOM =================
  const stage=document.getElementById('stage');
  const canvas=document.getElementById('game');
  const ctx=canvas.getContext('2d');
  const hudScore=document.getElementById('hud-score');
  const hudBest=document.getElementById('hud-best');
  const hudRecord=document.getElementById('hud-record');
  const hint=document.getElementById('hint');
  const overlay=document.getElementById('overlay');
  const card=document.getElementById('card');
  const muteBtn=document.getElementById('mute');

  function fmtNum(n){ n=Math.floor(n||0); return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.'); }
  function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  const NAME_ADJ=['Master','Pool','Tacazo','Efecto','Bola8','Stripes','Carambola','Geometría','Precisión','Retro'];
  const NAME_NOUN=['Pro','Shark','Player','King','Wizard','Sniper','Striker','Champ','Hero','Boss'];
  function generateRandomName(){
    const a=NAME_ADJ[Math.floor(Math.random()*NAME_ADJ.length)];
    const b=NAME_NOUN[Math.floor(Math.random()*NAME_NOUN.length)];
    return a+b+Math.floor(Math.random()*90+10);
  }

  // ================= STORAGE =================
  const Store = {
    get(key){ try{ return localStorage.getItem(key); }catch(e){ return null; } },
    set(key,value){ try{ localStorage.setItem(key,value); return true; }catch(e){ return false; } },
    safeParse(v, fallback){ try{ return v!=null? JSON.parse(v): fallback; }catch(e){ return fallback; } },
    getProfile(){ return this.safeParse(this.get('tapOlympicsProfile'), null); },
    setProfile(p){ return this.set('tapOlympicsProfile', JSON.stringify(p)); },
    getBest(){ const o=this.safeParse(this.get('tapOlympicsBest_pool-beats'), {score:0}); return o.score||0; },
    setBest(score){ return this.set('tapOlympicsBest_pool-beats', JSON.stringify({score})); },
    getMuted(){ return this.get('tapOlympicsMuted')==='1'; },
    setMuted(m){ return this.set('tapOlympicsMuted', m? '1':'0'); }
  };

  // ================= SUPABASE =================
  const GAME_ID='pool-beats';
  const SUPABASE_URL='https://ttwpbdamhedszidszqkf.supabase.co';
  const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0d3BiZGFtaGVkc3ppZHN6cWtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTc2MjYsImV4cCI6MjEwMjEzMzYyNn0.REJdgKFXFKQHVPN_xKw4eR7Oc9La75OGDHpHfqUilQk';
  let supa=null;
  try{ if(window.supabase){ supa=window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } }catch(e){ supa=null; }
  function supaReady(){ return !!supa; }
  function makeId(){
    if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  }

  const Leaderboard = {
    async register(name, email){
      if(!supaReady()) return null;
      try{
        const id=makeId();
        const { error } = await supa.from('players').insert({ id, name:name.slice(0,24), email: email? email.slice(0,120): null });
        if(error) throw error;
        return { id, name };
      }catch(e){ console.warn('register failed', e); return null; }
    },
    async updateBest(playerId, name, score){
      if(!supaReady() || !playerId) return false;
      try{
        const { error } = await supa.from('scores').upsert(
          { player_id:playerId, game_id:GAME_ID, name:(name||'').slice(0,24), best_score:score, updated_at:new Date().toISOString() },
          { onConflict:'player_id,game_id' }
        );
        return !error;
      }catch(e){ console.warn('updateBest failed', e); return false; }
    },
    async top100(){
      if(!supaReady()) return [];
      try{
        const { data, error } = await supa.from('scores').select('player_id,name,best_score').eq('game_id',GAME_ID).order('best_score',{ascending:false}).limit(100);
        if(error) throw error;
        return (data||[]).map(r=>({ id:r.player_id, name:r.name, best_score:r.best_score }));
      }catch(e){ console.warn('top100 failed', e); return []; }
    }
  };

  // ================= STATE =================
  let appState='idle';
  let profile=null;
  let personalBest=0;
  let worldRecord=0;
  let pendingBoard=[];
  let score=0, combo=0, bestCombo=0;
  let hitsCount=0, perfectCount=0, goodCount=0;
  let countdownValue=null;

  // ================= AUDIO =================
  let actx=null;
  let masterGain=null;
  let muted=Store.getMuted();
  function ensureAudio(){
    if(!actx){
      try{
        actx=new (window.AudioContext||window.webkitAudioContext)();
        masterGain=actx.createGain();
        masterGain.gain.value = muted? 0:1;
        masterGain.connect(actx.destination);
      }catch(e){ return; }
    }
    if(actx.state==='suspended'){ actx.resume().catch(()=>{}); }
  }
  function setMuted(m){
    muted=m; Store.setMuted(m);
    if(masterGain) masterGain.gain.value = m? 0:1;
    muteBtn.textContent = m? '✕':'♪';
  }
  function sfxHit(){
    if(!actx) return;
    const t=actx.currentTime;
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(600, t);
    o.frequency.exponentialRampToValueAtTime(200, t+0.08);
    g.gain.setValueAtTime(1.0, t);
    g.gain.exponentialRampToValueAtTime(0.001, t+0.09);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t+0.1);
  }
  function sfxMiss(){
    if(!actx) return;
    const t=actx.currentTime;
    const o=actx.createOscillator(), g=actx.createGain();
    o.type='sawtooth'; o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(30,t+0.25);
    g.gain.setValueAtTime(0.3,t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.26);
    o.connect(g); g.connect(masterGain);
    o.start(t); o.stop(t+0.27);
  }

  // ================= GAMEPLAY VARIABLES =================
  let activeBalls = [];
  let spawnTimer = 0;
  let popups = [];     
  let particles = [];  
  let cueStrikeAnim = 0; // Animación del golpe del taco
  let nextBallNumber = 1;

  function getCurrentSpeed(){
    return BASE_SPEED + (score * SPEED_INC);
  }

  function spawnBall(){
    activeBalls.push({
      y: LH + BALL_R, // Aparecen desde abajo
      num: (nextBallNumber % 15) || 15
    });
    nextBallNumber++;
  }

  function spawnPopup(text,color){ popups.push({text,color,age:0,life:0.6}); }
  function spawnBurst(perfect){
    const n=perfect?12:7;
    const col=perfect?COL_GOLD:COL_AMBER;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, spd=70+Math.random()*110;
      particles.push({x:LW/2,y:HIT_Y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,age:0,life:0.45,color:col});
    }
  }

  function updateHUD(){
    hudScore.textContent=fmtNum(score);
    hudBest.textContent=fmtNum(personalBest);
    hudRecord.textContent=fmtNum(worldRecord);
  }

  function attemptTap(){
    if(appState!=='playing') return;
    
    let closestIdx = -1;
    let minDistance = Infinity;

    for(let i=0; i<activeBalls.length; i++){
      const dist = Math.abs(activeBalls[i].y - HIT_Y);
      if(dist < minDistance){
        minDistance = dist;
        closestIdx = i;
      }
    }

    if(closestIdx !== -1 && minDistance <= HIT_WINDOW){
      activeBalls.splice(closestIdx, 1);
      const isPerfect = minDistance <= (HIT_WINDOW * 0.4);
      onHit(isPerfect ? 'PERFECTO!' : 'BUENO!');
    } else {
      // Perder si se toca cuando NO hay bola a tiro
      onMiss();
    }
  }

  function onHit(judgment){
    combo++;
    if(combo>bestCombo) bestCombo=combo;
    score+=1; 
    hitsCount++;
    if(judgment==='PERFECTO!') perfectCount++; else goodCount++;
    sfxHit();
    spawnPopup(judgment, judgment==='PERFECTO!'?COL_GOLD:COL_AMBER);
    spawnBurst(judgment==='PERFECTO!');
    cueStrikeAnim = 1.0;
    updateHUD();

    if(score>=1000){
      endGame();
    }
  }

  function onMiss(){
    combo=0;
    sfxMiss();
    spawnPopup('¡FALLO!', COL_RED);
    shakeStage();
    endGame(); 
  }

  let shakeTimer=null;
  function shakeStage(){
    let t=0;
    clearInterval(shakeTimer);
    shakeTimer=setInterval(()=>{
      t++;
      stage.style.transform = t<5 ? ('translateX('+((t%2===0?1:-1)*(6-t)*2)+'px)') : 'translateX(0)';
      if(t>=5){ clearInterval(shakeTimer); stage.style.transform='translateX(0)'; }
    }, 30);
  }

  function updateBalls(dt){
    const speed = getCurrentSpeed();
    
    // Generar bolas
    spawnTimer += dt;
    const spawnInterval = Math.max(0.12, 180 / speed);
    if(spawnTimer >= spawnInterval){
      spawnBall();
      spawnTimer = 0;
    }

    // Mover bolas de abajo hacia arriba
    for(let i = activeBalls.length - 1; i >= 0; i--){
      const ball = activeBalls[i];
      ball.y -= speed * dt; // Subir

      // Si sobrepasa la altura de golpeo sin ser tocada, se pierde
      if(ball.y < HIT_Y - HIT_WINDOW){
        activeBalls.splice(i, 1);
        onMiss();
        break;
      }
    }
  }

  function updatePopups(dt){ for(const p of popups) p.age+=dt; popups=popups.filter(p=>p.age<p.life); }
  function updateParticles(dt){
    for(const p of particles){ p.age+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=140*dt; }
    particles=particles.filter(p=>p.age<p.life);
  }

  // ================= RENDER =================
  function drawPoolTable(){
    // Tapete verde
    ctx.fillStyle = '#1e7538';
    ctx.fillRect(0,0,LW,LH);

    // Marcos/Bandas de la mesa
    const borderWidth = 18;
    ctx.fillStyle = '#0f3d1d';
    ctx.fillRect(0, 0, LW, borderWidth); // Superior
    ctx.fillRect(0, LH - borderWidth, LW, borderWidth); // Inferior
    ctx.fillRect(0, 0, borderWidth, LH); // Izquierda
    ctx.fillRect(LW - borderWidth, 0, borderWidth, LH); // Derecha

    // Troneras / Buchacas (Agujeros)
    const pR = 14;
    ctx.fillStyle = '#050505';
    // 4 esquinas
    ctx.beginPath(); ctx.arc(borderWidth, borderWidth, pR, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(LW - borderWidth, borderWidth, pR, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(borderWidth, LH - borderWidth, pR, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(LW - borderWidth, LH - borderWidth, pR, 0, Math.PI*2); ctx.fill();
    // 2 laterales centrales
    ctx.beginPath(); ctx.arc(borderWidth, LH/2, pR*0.8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(LW - borderWidth, LH/2, pR*0.8, 0, Math.PI*2); ctx.fill();

    // Línea guía sutil para la trayectoria vertical
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(LW/2, 0);
    ctx.lineTo(LW/2, LH);
    ctx.stroke();

    // Marca visual de la altura de tiro (HIT_Y)
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(borderWidth + 5, HIT_Y);
    ctx.lineTo(LW - borderWidth - 5, HIT_Y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawCue(){
    ctx.save();
    // Offset de animación al golpear
    const offset = cueStrikeAnim * 16;
    const cueX = LW/2 + BALL_R + 6 + offset;
    const cueY = HIT_Y - 2;

    // Taco de billar horizontal entrando desde la derecha
    ctx.save();
    ctx.translate(cueX, cueY);
    
    // Punta del taco (Suela)
    ctx.fillStyle = '#dcdde1';
    ctx.fillRect(0, -2, 5, 4);

    // Caña (Madera clara)
    ctx.fillStyle = '#f5cd79';
    ctx.beginPath();
    ctx.moveTo(5, -2.5);
    ctx.lineTo(120, -5);
    ctx.lineTo(120, 5);
    ctx.lineTo(5, 2.5);
    ctx.closePath();
    ctx.fill();

    // Mango (Madera oscura)
    ctx.fillStyle = '#574b90';
    ctx.beginPath();
    ctx.moveTo(120, -5);
    ctx.lineTo(220, -7);
    ctx.lineTo(220, 7);
    ctx.lineTo(120, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  function drawBall(x, y, num){
    ctx.save();
    ctx.translate(x, y);

    // Sombra de la bola
    ctx.beginPath();
    ctx.arc(3, 3, BALL_R, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // Bola Amarilla
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, Math.PI*2);
    ctx.fillStyle = '#fbc531';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#e1b12c';
    ctx.stroke();

    // Brillo / Esfera
    const g = ctx.createRadialGradient(-4, -4, 2, 0, 0, BALL_R);
    g.addColorStop(0, 'rgba(255,255,255,0.6)');
    g.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, Math.PI*2);
    ctx.fillStyle = g;
    ctx.fill();

    // Círculo blanco central para el número
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R * 0.45, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Número
    ctx.fillStyle = '#111';
    ctx.font = "bold 9px 'Press Start 2P', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(num), 0, 1);

    ctx.restore();
  }

  function drawNotes(){
    for(const ball of activeBalls){
      drawBall(LW/2, ball.y, ball.num);
    }
  }

  function drawPopups(){
    for(const p of popups){
      const t=p.age/p.life;
      ctx.save();
      ctx.globalAlpha=Math.max(0,1-t);
      ctx.fillStyle=p.color;
      ctx.font="bold 13px 'Press Start 2P', monospace";
      ctx.textAlign='center';
      ctx.fillText(p.text, LW/2, HIT_Y+50+t*20);
      ctx.restore();
    }
  }
  function drawParticles(){
    ctx.save();
    for(const p of particles){
      const t=p.age/p.life;
      ctx.globalAlpha=Math.max(0,1-t);
      ctx.fillStyle=p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,3*(1-t)+1,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }
  function drawCountdown(){
    ctx.save();
    ctx.textAlign='center';
    ctx.fillStyle=COL_WHITE;
    ctx.font="bold 40px 'Press Start 2P', monospace";
    ctx.shadowColor=COL_GOLD; ctx.shadowBlur=16;
    ctx.fillText(String(countdownValue), LW/2, LH/2);
    ctx.shadowBlur=0;
    ctx.restore();
  }
  function render(){
    ctx.clearRect(0,0,LW,LH);
    drawPoolTable();
    drawCue();
    if(appState==='playing'){
      drawNotes(); drawPopups(); drawParticles();
    } else if(appState==='countdown'){
      drawCountdown();
    }
  }

  // ================= LAYOUT =================
  function layoutStage(){
    const availW=window.innerWidth*0.92;
    const availH=window.innerHeight*0.92;
    let w=Math.min(availW,420);
    let h=w*4/3;
    if(h>availH){ h=availH; w=h*3/4; }
    stage.style.width=w+'px';
    stage.style.height=h+'px';
    resizeCanvas();
  }
  function resizeCanvas(){
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const rect=canvas.getBoundingClientRect();
    canvas.width=Math.max(1,Math.round(rect.width*dpr));
    canvas.height=Math.max(1,Math.round(rect.height*dpr));
    ctx.setTransform(canvas.width/LW,0,0,canvas.height/LH,0,0);
  }
  window.addEventListener('resize', layoutStage);
  window.addEventListener('orientationchange', layoutStage);

  // ================= UI CARDS =================
  function showOverlay(){ overlay.classList.remove('hide'); }
  function hideOverlay(){ overlay.classList.add('hide'); }

  function endGame(){
    appState='gameover';
    const finalScore=score;
    let newBest=false;
    if(finalScore>personalBest){ personalBest=finalScore; Store.setBest(personalBest); newBest=true; }
    (async ()=>{
      if(profile && profile.id && newBest){ await Leaderboard.updateBest(profile.id, profile.name, personalBest); }
      const board=await Leaderboard.top100();
      if(board.length && board[0].best_score>worldRecord){ worldRecord=board[0].best_score; }
      updateHUD();
      renderGameOverCard(finalScore, board);
    })();
  }
  function renderGameOverCard(finalScore, board){
    showOverlay();
    const rank=(profile&&profile.id)? board.findIndex(e=>e.id===profile.id)+1 : 0;
    const rankLine = rank>0 ? ('Puesto #'+rank+' en el Top 100 🏆') : '¡Se te escapó el tacazo!';
    const accuracy = hitsCount>0? Math.round((perfectCount/hitsCount)*100):0;
    card.innerHTML =
      '<h1 class="pixel outline">GAME OVER</h1>'+
      '<p class="sub">'+escapeHtml(rankLine)+'</p>'+
      '<div class="stat-row"><span>Total Hits</span><span>'+fmtNum(finalScore)+'</span></div>'+
      '<div class="stat-row"><span>Mejor Racha</span><span>'+fmtNum(bestCombo)+'</span></div>'+
      '<div class="stat-row"><span>Perfectos</span><span>'+fmtNum(perfectCount)+'</span></div>'+
      '<div class="stat-row"><span>Precisión</span><span>'+accuracy+'%</span></div>'+
      '<button class="btn" data-action="retry">JUGAR OTRA VEZ</button>'+
      '<button class="btn secondary" data-action="leaderboard">TOP 100</button>';
  }
  function openLeaderboard(){
    appState='leaderboard';
    showOverlay();
    card.innerHTML='<h1 class="pixel outline">TOP 100</h1><div class="loading">Cargando…</div>';
    Leaderboard.top100().then(board=>{
      if(board.length && board[0].best_score>worldRecord){ worldRecord=board[0].best_score; updateHUD(); }
      pendingBoard=board;
      const alreadyRegistered=!!(profile&&profile.id);
      const qualifies = supaReady() && !alreadyRegistered && personalBest>0 && (board.length<100 || personalBest>board[board.length-1].best_score);
      if(qualifies){ showRegisterCard(); } else { renderLeaderboardCard(board); }
    });
  }
  function renderLeaderboardCard(board){
    appState='leaderboard';
    const items=board.map((e,i)=>{
      const mine=profile&&profile.id&&e.id===profile.id;
      return '<li class="'+(mine?'me':'')+'"><span class="rk">#'+(i+1)+'</span><span class="nm">'+escapeHtml(e.name)+'</span><span class="sc">'+fmtNum(e.best_score)+' HITS</span></li>';
    }).join('');
    const emptyMsg = supaReady() ? 'Sin puntuaciones aún. ¡Sé el primero!' : 'Clasificación fuera de línea.';
    card.innerHTML =
      '<h1 class="pixel outline">TOP 100</h1>'+
      '<ul id="board-list">'+(items || '<li>'+emptyMsg+'</li>')+'</ul>'+
      '<button class="btn" data-action="retry">JUGAR DE NUEVO</button>';
  }
  function showRegisterCard(){
    appState='leaderboard';
    showOverlay();
    const suggested=generateRandomName();
    card.innerHTML =
      '<h1 class="pixel outline">TOP 100!</h1>'+
      '<p class="sub">Guarda tu nombre para el ranking global.</p>'+
      '<div class="field"><label>Nombre</label><input id="reg-name" type="text" maxlength="24" autocomplete="name" value="'+escapeHtml(suggested)+'"></div>'+
      '<div class="field"><label>Email <span style="color:#6a6a78">(opcional)</span></label><input id="reg-email" type="email" maxlength="120" autocomplete="email" placeholder="tu@email.com"></div>'+
      '<p class="help" id="reg-help">&nbsp;</p>'+
      '<button class="btn" data-action="register">GUARDAR Y UNIRSE</button>'+
      '<button class="btn ghost" data-action="skip-register">No gracias, solo ver lista</button>';
  }
  async function submitRegistration(){
    const nameEl=document.getElementById('reg-name');
    const emailEl=document.getElementById('reg-email');
    const helpEl=document.getElementById('reg-help');
    const name=(nameEl.value||'').trim().slice(0,24) || generateRandomName();
    const email=(emailEl.value||'').trim();
    if(email && !/^\S+@\S+\.\S+$/.test(email)){
      helpEl.textContent='El email parece incorrecto. Corrígelo o déjalo en blanco.';
      helpEl.style.color='var(--red)';
      return;
    }
    const btn=card.querySelector('[data-action="register"]');
    if(btn){ btn.textContent='GUARDANDO…'; btn.disabled=true; }
    const remote=await Leaderboard.register(name, email||null);
    profile = remote? { id:remote.id, name:remote.name } : { id:null, name };
    Store.setProfile(profile);
    if(profile.id && personalBest>0){ await Leaderboard.updateBest(profile.id, profile.name, personalBest); }
    const board=await Leaderboard.top100();
    if(board.length && board[0].best_score>worldRecord){ worldRecord=board[0].best_score; updateHUD(); }
    renderLeaderboardCard(board);
  }
  overlay.addEventListener('click', e=>{
    const btn=e.target.closest('[data-action]');
    if(!btn) return;
    ensureAudio();
    const action=btn.dataset.action;
    if(action==='start'){ startCountdown(); }
    else if(action==='retry'){ startCountdown(); }
    else if(action==='leaderboard'){ openLeaderboard(); }
    else if(action==='register'){ submitRegistration(); }
    else if(action==='skip-register'){ renderLeaderboardCard(pendingBoard); }
  });

  // ================= INPUT =================
  canvas.addEventListener('pointerdown', e=>{
    if(appState!=='playing') return;
    ensureAudio();
    attemptTap();
    e.preventDefault();
  });
  window.addEventListener('keydown', e=>{
    if(e.code!=='Space') return;
    if(appState==='playing'){ e.preventDefault(); ensureAudio(); if(!e.repeat) attemptTap(); }
  });
  muteBtn.addEventListener('click', e=>{
    e.stopPropagation();
    ensureAudio();
    setMuted(!muted);
  });

  // ================= LIFECYCLE =================
  function startCountdown(){
    appState='countdown';
    hideOverlay();
    stage.style.transform='translateX(0)';
    let n=3;
    countdownValue=n;
    const iv=setInterval(()=>{
      n--;
      if(n<=0){
        clearInterval(iv);
        countdownValue='¡GO!';
        setTimeout(beginPlay, 300);
      } else {
        countdownValue=n;
      }
    }, 500);
  }
  function beginPlay(){
    appState='playing';
    countdownValue=null;
    ensureAudio();
    activeBalls=[]; popups=[]; particles=[];
    score=0; combo=0; bestCombo=0; hitsCount=0; perfectCount=0; goodCount=0;
    cueStrikeAnim=0; spawnTimer=0; nextBallNumber=1;
    updateHUD();
    hint.style.opacity='1';
    setTimeout(()=>{ if(appState==='playing') hint.style.opacity='0'; }, 3000);
  }

  // ================= MAIN LOOP =================
  let lastTs=null;
  function mainLoop(ts){
    if(lastTs==null) lastTs=ts;
    let dt=(ts-lastTs)/1000; lastTs=ts;
    dt=Math.min(Math.max(dt,0),0.045);
    
    if(appState==='playing'){
      updateBalls(dt);
      cueStrikeAnim=Math.max(0,cueStrikeAnim-dt*8);
      updatePopups(dt);
      updateParticles(dt);
    }
    render();
    requestAnimationFrame(mainLoop);
  }

  // ================= INIT =================
  async function init(){
    layoutStage();
    requestAnimationFrame(mainLoop);
    profile=Store.getProfile();
    personalBest=Store.getBest();
    setMuted(Store.getMuted());
    showStartCard();
    const top=await Leaderboard.top100();
    worldRecord = top.length? top[0].best_score : 0;
    updateHUD();
  }
  function showStartCard(){
    appState='idle';
    showOverlay();
    card.innerHTML =
      '<h1 class="pixel outline">POOL BEATS</h1>'+
      '<p class="sub">Toca la pantalla para golpear con el taco cuando la bola de billar llegue a la altura marcada. ¡La velocidad aumentará gradualmente!</p>'+
      '<button class="btn" data-action="start">JUGAR</button>';
  }
  init();
})();
</script>
</body>
</html>