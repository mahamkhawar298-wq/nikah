import React, { useState, useEffect, useRef, useCallback } from 'react';

/* =====================================================================
   SVG SKY & RAINBOW — drawn natively, never fails
   ===================================================================== */
const skyGradient = 'linear-gradient(180deg, #b8d4e8 0%, #d4e4f0 25%, #f4e8d0 55%, #f9f3e8 75%, #f2e8d5 100%)';

/* Rainbow SVG as data URL */
const rainbowSVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a8c8e0"/>
      <stop offset="55%" stop-color="#d4e4f0"/>
      <stop offset="100%" stop-color="#f4e8d0"/>
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff8e0"/>
      <stop offset="100%" stop-color="#ffe8b0"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#sky)"/>
  <!-- sun glow -->
  <circle cx="640" cy="120" r="90" fill="url(#sun)" opacity="0.85"/>
  <circle cx="640" cy="120" r="60" fill="#fff8e0" opacity="0.7"/>
  <!-- clouds -->
  <ellipse cx="150" cy="100" rx="80" ry="30" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="200" cy="90" rx="60" ry="25" fill="#ffffff" opacity="0.85"/>
  <ellipse cx="100" cy="115" rx="50" ry="22" fill="#ffffff" opacity="0.8"/>
  <ellipse cx="500" cy="140" rx="100" ry="35" fill="#ffffff" opacity="0.9"/>
  <ellipse cx="560" cy="130" rx="70" ry="28" fill="#ffffff" opacity="0.85"/>
  <ellipse cx="400" cy="70" rx="90" ry="30" fill="#ffffff" opacity="0.75"/>
  <ellipse cx="700" cy="200" rx="70" ry="24" fill="#ffffff" opacity="0.7"/>
  <!-- rainbow arcs -->
  <path d="M 100 480 A 320 320 0 0 1 700 480" fill="none" stroke="#c93a4a" stroke-width="14" opacity="0.9" stroke-linecap="round"/>
  <path d="M 115 480 A 305 305 0 0 1 685 480" fill="none" stroke="#e07a2c" stroke-width="14" opacity="0.9" stroke-linecap="round"/>
  <path d="M 130 480 A 290 290 0 0 1 670 480" fill="none" stroke="#e8c84a" stroke-width="14" opacity="0.9" stroke-linecap="round"/>
  <path d="M 145 480 A 275 275 0 0 1 655 480" fill="none" stroke="#6aab5c" stroke-width="14" opacity="0.9" stroke-linecap="round"/>
  <path d="M 160 480 A 260 260 0 0 1 640 480" fill="none" stroke="#4a86c8" stroke-width="14" opacity="0.9" stroke-linecap="round"/>
  <path d="M 175 480 A 245 245 0 0 1 625 480" fill="none" stroke="#8a5aa8" stroke-width="14" opacity="0.9" stroke-linecap="round"/>
  <!-- soft glow under rainbow -->
  <ellipse cx="400" cy="480" rx="350" ry="20" fill="#ffe8b0" opacity="0.25"/>
  <!-- ground -->
  <rect x="0" y="480" width="800" height="20" fill="#a8b5a0"/>
  <rect x="0" y="500" width="800" height="0" fill="#8a9880"/>
</svg>
`)}`;

/* =====================================================================
   GLOBAL STYLES
   ===================================================================== */
const globalStyles = `
@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Great+Vibes&family=Inter:wght@200;300;400&family=Jost:wght@200;300;400;500&family=Amiri:wght@400;700&display=swap");

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }

:root {
  --ivory:#fffdf9;
  --cream:#fdf9f2;
  --beige-light:#f9f3e8;
  --beige:#f2e8d5;
  --beige-warm:#ede0c8;
  --beige-deep:#e6d5b8;
  --sand:#d9c5a3;
  --gold:#c9a96e;
  --gold-light:#e0cba8;
  --gold-deep:#a8854a;
  --gold-dark:#8a6a34;
  --red:#a8273a;
  --red-deep:#8b1e2e;
  --red-soft:#c94a5d;
  --rose:#e6c8c8;
  --rose-deep:#c98f8f;
  --rose-light:#f5e5e5;
  --ink:#3d3428;
  --ink-soft:#5a4c3a;
  --muted:#9c8f7a;
  --serif:'Cormorant Garamond',serif;
  --script:'Great Vibes',cursive;
  --sans:'Jost',sans-serif;
  --inter:'Inter',sans-serif;
  --arabic:'Amiri',serif;
}

html { scroll-behavior:smooth; }
body { background:var(--beige-light); color:var(--ink); font-family:var(--sans); overflow-x:hidden; -webkit-font-smoothing:antialiased; line-height:1.6; }
::selection { background:var(--red); color:#fff; }
img { max-width:100%; display:block; }
a { color:inherit; }

/* GRAIN */
.grain {
  position:fixed; inset:0; pointer-events:none; z-index:60; opacity:.22; mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.6 0 0 0 0 0.6 0 0 0 0.03 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* ============ OPENING STAGE — SVG SKY ============ */
#stage {
  position: fixed; inset: 0; z-index: 50;
  background: ${skyGradient};
  display: flex; align-items: center; justify-content: center;
  perspective: 1400px;
  transition: opacity 1.4s ease;
  overflow: hidden;
}
#stage.gone { opacity: 0; pointer-events: none; }

/* Painted clouds on the sky */
#stage::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 600px 280px at 20% 20%, rgba(255,255,255,.9) 0%, transparent 60%),
    radial-gradient(ellipse 700px 320px at 75% 15%, rgba(255,255,255,.95) 0%, transparent 65%),
    radial-gradient(ellipse 500px 230px at 45% 10%, rgba(255,255,255,.75) 0%, transparent 60%),
    radial-gradient(ellipse 450px 200px at 12% 55%, rgba(255,255,255,.4) 0%, transparent 60%),
    radial-gradient(ellipse 550px 250px at 88% 60%, rgba(255,255,255,.5) 0%, transparent 60%);
  pointer-events: none;
  animation: cloudDrift 40s ease-in-out infinite alternate;
}
@keyframes cloudDrift {
  0% { transform: translateX(-2%) scale(1); }
  100% { transform: translateX(2%) scale(1.03); }
}

/* Sun rays */
#sunRays { position:absolute; inset:0; pointer-events:none; z-index:1; overflow:hidden; opacity:0; transition:opacity 1.8s ease; }
#sunRays.active { opacity:1; }
.ray { position:absolute; top:-40%; left:50%; width:120px; height:200%; background:linear-gradient(to bottom, rgba(255,250,235,0) 0%, rgba(255,248,225,0.55) 15%, rgba(255,245,210,0.85) 40%, rgba(255,248,225,0.55) 65%, rgba(255,250,235,0) 100%); transform-origin:top center; filter:blur(18px); mix-blend-mode:screen; border-radius:50%; opacity:0; animation:rayGlow 4s ease-in-out infinite alternate; }
@keyframes rayGlow { 0% { opacity:0.5; transform:scaleX(1) rotate(var(--rot)); } 100% { opacity:0.9; transform:scaleX(1.15) rotate(var(--rot)); } }
.ray:nth-child(1){--rot:-28deg;left:18%;width:90px;animation-delay:0s;animation-duration:3.6s;}
.ray:nth-child(2){--rot:-18deg;left:32%;width:130px;animation-delay:.3s;animation-duration:4.2s;}
.ray:nth-child(3){--rot:-8deg;left:46%;width:160px;animation-delay:.6s;animation-duration:3.9s;}
.ray:nth-child(4){--rot:2deg;left:54%;width:170px;animation-delay:.15s;animation-duration:4.5s;}
.ray:nth-child(5){--rot:12deg;left:64%;width:140px;animation-delay:.45s;animation-duration:3.7s;}
.ray:nth-child(6){--rot:22deg;left:76%;width:110px;animation-delay:.75s;animation-duration:4.1s;}
.ray:nth-child(7){--rot:34deg;left:86%;width:80px;animation-delay:.2s;animation-duration:3.8s;}

#sunGlow { position:absolute; inset:0; pointer-events:none; z-index:0; background:radial-gradient(ellipse at 50% 20%, rgba(255,248,220,0.85) 0%, rgba(255,245,210,0.35) 40%, transparent 70%); opacity:0; transition:opacity 2.2s ease; }
#sunGlow.active { opacity:1; }

#lensFlare { position:absolute; top:15%; left:50%; transform:translateX(-50%); width:300px; height:300px; pointer-events:none; z-index:2; background:radial-gradient(circle, rgba(255,252,240,0.95) 0%, rgba(255,248,220,0.5) 30%, transparent 70%); border-radius:50%; opacity:0; transition:opacity 1.5s ease; filter:blur(6px); }
#lensFlare.active { opacity:1; }

.sparkle { position:absolute; pointer-events:none; z-index:3; width:4px; height:4px; border-radius:50%; background:radial-gradient(circle, #ffffff, rgba(255,248,220,0.6) 50%, transparent 70%); box-shadow:0 0 6px 2px rgba(255,250,235,0.8); opacity:0; animation:sparkleFloat 3s ease-in-out infinite; }
@keyframes sparkleFloat { 0% { opacity:0; transform:translateY(0) scale(0.5); } 20% { opacity:1; transform:translateY(-10px) scale(1); } 80% { opacity:1; transform:translateY(-40px) scale(1); } 100% { opacity:0; transform:translateY(-60px) scale(0.5); } }

#ambientGlow { position:absolute; width:120vmax; height:120vmax; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.8),rgba(224,203,168,.12) 40%,transparent 65%); left:50%; top:50%; transform:translate(-50%,-50%); animation:drift 14s ease-in-out infinite alternate; pointer-events:none; }
@keyframes drift { 0% { transform:translate(-56%,-52%); } 100% { transform:translate(-44%,-48%); } }

/* ============ PREMIUM FM CARD ============ */
#card {
  position: relative;
  width: min(90vw, 420px);
  height: min(82vh, 620px);
  background: radial-gradient(ellipse at 50% 30%, #fffdf8 0%, #f9f1e2 45%, #f0e2c8 100%);
  border-radius: 6px;
  box-shadow:
    0 1px 2px rgba(120,90,50,.12),
    0 8px 20px rgba(120,90,50,.15),
    0 30px 60px rgba(120,90,50,.22),
    0 60px 120px rgba(120,90,50,.18),
    inset 0 0 0 1px rgba(201,169,110,.4);
  transform-style: preserve-3d;
  transition: transform .3s ease-out, filter 1.6s ease, opacity 1.4s ease;
  animation: float 7s ease-in-out infinite;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  z-index: 4;
}
@keyframes float { 0%,100% { translate:0 0; } 50% { translate:0 -10px; } }

#card::before { content:""; position:absolute; inset: 12px; border: 1.5px solid rgba(201,169,110,.85); border-radius: 4px; pointer-events:none; z-index: 2; }
#card::after { content:""; position:absolute; inset: 20px; border: 1px solid rgba(201,169,110,.45); border-radius: 3px; pointer-events:none; z-index: 2; }

.corner-diamond { position: absolute; width: 14px; height: 14px; background: linear-gradient(135deg, var(--red), var(--red-deep)); transform: rotate(45deg); box-shadow: 0 0 0 2px #fffdf8, 0 0 0 3px rgba(201,169,110,.6); z-index: 5; }
.corner-diamond.tl { top: 5px; left: 5px; }
.corner-diamond.tr { top: 5px; right: 5px; }
.corner-diamond.bl { bottom: 5px; left: 5px; }
.corner-diamond.br { bottom: 5px; right: 5px; }

.entering-card { filter: blur(6px) brightness(1.15); opacity: 0; scale: 1.06; }

.floral-corner { position:absolute; width:130px; height:130px; pointer-events:none; z-index:3; opacity:.95; }
.floral-corner svg { width:100%; height:100%; overflow:visible; }
.floral-corner.tl { top:26px; left:26px; }
.floral-corner.tr { top:26px; right:26px; transform:scaleX(-1); }
.floral-corner.bl { bottom:26px; left:26px; transform:scaleY(-1); }
.floral-corner.br { bottom:26px; right:26px; transform:scale(-1); }

.floral-top { position:absolute; top:34px; left:50%; transform:translateX(-50%); width:180px; height:60px; pointer-events:none; z-index:3; opacity:.9; }
.floral-top svg { width:100%; height:100%; }
.floral-bottom { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); width:140px; height:40px; pointer-events:none; z-index:3; opacity:.85; }
.floral-bottom svg { width:100%; height:100%; }
.floral-vine { position:absolute; width:60px; height:220px; top:50%; transform:translateY(-50%); pointer-events:none; z-index:3; opacity:.6; }
.floral-vine.left { left:18px; }
.floral-vine.right { right:18px; transform:translateY(-50%) scaleX(-1); }
.floral-vine svg { width:100%; height:100%; }

#cardShadow { position:absolute; bottom:-34px; left:50%; transform:translateX(-50%); width:72%; height:34px; border-radius:50%; background:radial-gradient(ellipse,rgba(120,90,50,.22),transparent 70%); filter:blur(6px); animation:shadowPulse 7s ease-in-out infinite; pointer-events:none; z-index:3; }
@keyframes shadowPulse { 0%,100% { transform:translateX(-50%) scale(1); opacity:.9; } 50% { transform:translateX(-50%) scale(.9); opacity:.6; } }

#sheen { position:absolute; inset:0; border-radius:6px; overflow:hidden; pointer-events:none; z-index:4; }
#sheen::before { content:""; position:absolute; top:-60%; left:-80%; width:60%; height:220%; background:linear-gradient(105deg,transparent,rgba(255,255,255,.6) 45%,rgba(255,255,255,.1) 55%,transparent); transform:rotate(8deg); animation:sheenMove 9s ease-in-out infinite; }
@keyframes sheenMove { 0%,55% { left:-80%; } 85%,100% { left:130%; } }

#monoWrap { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:30px; transform:translateZ(30px); width:100%; height:100%; padding:80px 40px; text-align:center; z-index:5; }

#monogram { position:relative; width:210px; height:210px; border-radius:50%; display:flex; align-items:center; justify-content:center; background: radial-gradient(circle at 35% 30%, #fffdf9 0%, #f9f1e2 45%, #eddcc0 100%); box-shadow: inset 0 2px 4px rgba(255,255,255,.9), inset 0 -4px 12px rgba(168,133,74,.3), 0 8px 24px rgba(120,90,50,.22), 0 0 0 2px rgba(201,169,110,.85), 0 0 0 8px rgba(255,253,249,.9), 0 0 0 9px rgba(201,169,110,.45), 0 0 0 12px rgba(224,203,168,.35); transition: box-shadow 1.2s ease, filter 1.2s ease; cursor: pointer; }
#monogram::before { content:""; position:absolute; inset:14px; border-radius:50%; border: 1px dashed rgba(168,42,58,.55); pointer-events:none; }
#monogram::after { content:""; position:absolute; inset:-20px; border-radius:50%; border: 1px dashed rgba(201,169,110,.5); pointer-events:none; animation: rotateSlow 40s linear infinite; }
@keyframes rotateSlow { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

#monoText { font-family:var(--serif); font-weight:400; display:flex; flex-direction:column; align-items:center; line-height:.85; transition:color 1s ease, text-shadow 1s ease; }
#monoText .letter { font-size: 76px; letter-spacing: 5px; background: linear-gradient(160deg, #a8273a 0%, #c9a96e 45%, #8b1e2e 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 1px 0 rgba(255,255,255,.5); filter: drop-shadow(0 1px 1px rgba(139,30,46,.15)); }
#monoText .amp { font-family: var(--script); font-size: 38px; font-style: italic; color: var(--red); margin: -10px 0 -4px; text-shadow: 0 1px 0 rgba(255,255,255,.8); }

#touchHint { font-size:10px; letter-spacing:7px; text-transform:uppercase; color:var(--gold-deep); animation:hintPulse 3.5s ease-in-out infinite; white-space:nowrap; position:relative; z-index:6; font-weight:400; }
@keyframes hintPulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }

#monoGlow { position:absolute; inset:-30px; border-radius:50%; pointer-events:none; opacity:0; background:radial-gradient(circle,rgba(255,252,240,.95),rgba(255,245,220,.45) 45%,transparent 70%); transition:opacity 1.4s ease; }

#sunCore { position:absolute; left:50%; top:50%; width:6px; height:6px; border-radius:50%; transform:translate(-50%,-50%) scale(0); background:radial-gradient(circle,#ffffff,rgba(255,250,235,.9) 40%,transparent 70%); box-shadow:0 0 40px 20px rgba(255,252,240,.9), 0 0 120px 60px rgba(255,255,250,.6); pointer-events:none; }
#sunCore.rise { animation:sunRise 2.1s cubic-bezier(.3,.6,.3,1) forwards; }
@keyframes sunRise { 0% { transform:translate(-50%,-50%) scale(0); opacity:0; } 15% { opacity:1; } 100% { transform:translate(-50%,-50%) scale(420); opacity:1; } }

#whiteout { position:fixed; inset:0; z-index:70; background:radial-gradient(circle at 50% 50%,#fffdf9 0%,var(--beige) 55%,var(--beige-warm) 100%); opacity:0; pointer-events:none; transition:opacity 1.5s ease; }
#whiteout.on { opacity:1; }

#monoWrap.lit #monogram { box-shadow: inset 0 2px 4px rgba(255,255,255,1), inset 0 -4px 12px rgba(168,133,74,.2), 0 0 80px 30px rgba(255,248,230,.95), 0 0 160px 70px rgba(255,250,235,.6), 0 0 0 2px rgba(168,42,58,.9), 0 0 0 8px rgba(255,253,249,.95), 0 0 0 9px rgba(201,169,110,.7), 0 0 0 12px rgba(224,203,168,.5); filter:brightness(1.1); }
#monoWrap.lit #monoText .letter { background: linear-gradient(160deg, #8b1e2e 0%, #a8854a 50%, #a8273a 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
#monoWrap.lit #monoText .amp { color: #8b1e2e; }

#main { opacity:0; transition:opacity 1.6s ease .3s; }
main section { position:relative; }
.wrap { max-width:900px; margin:0 auto; padding:0 26px; }

/* ============ INTRO — SVG SKY ============ */
#intro {
  min-height: 100svh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  text-align: center;
  position: relative;
  background: linear-gradient(180deg, #d4e4f0 0%, #ede0c8 50%, #f9f3e8 100%);
  padding: 80px 24px 120px;
}
#intro::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 500px 200px at 30% 15%, rgba(255,255,255,.75) 0%, transparent 60%),
    radial-gradient(ellipse 600px 250px at 70% 10%, rgba(255,255,255,.85) 0%, transparent 60%),
    radial-gradient(ellipse 450px 180px at 50% 8%, rgba(255,255,255,.6) 0%, transparent 60%);
  pointer-events: none;
}
#intro > * { position: relative; z-index: 1; }

#intro .micro { font-size:10px; letter-spacing:7px; text-transform:uppercase; color:var(--gold-deep); margin-bottom:34px; font-weight:400; }
#intro .day { font-family:var(--serif); font-weight:300; font-size:clamp(22px,4vw,30px); letter-spacing:12px; text-transform:uppercase; color:#4a4238; }
#intro .dateNum { font-family:var(--serif); font-weight:400; font-size:clamp(96px,22vw,180px); line-height:1; margin:8px 0 2px; letter-spacing:4px; background: linear-gradient(160deg, #8b1e2e 15%, #c9a96e 50%, #a8273a 85%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; filter: drop-shadow(0 2px 1px rgba(255,255,255,.6)); }
#intro .month { font-family:var(--serif); font-weight:300; font-size:clamp(22px,4vw,30px); letter-spacing:12px; text-transform:uppercase; color:#4a4238; margin-top:2px; }
#intro .year { font-size:11px; letter-spacing:10px; color:var(--muted); margin-top:22px; }
.hairline { width:56px; height:1px; background:linear-gradient(90deg,transparent,var(--gold),transparent); margin:34px auto; }
.hairline-red { width:60px; height:1px; background:linear-gradient(90deg,transparent,var(--red),transparent); margin:30px auto; }
#intro .venueLine { font-family:var(--serif); font-style:italic; font-weight:300; font-size:clamp(19px,3.4vw,24px); color:#5a4c3a; }

#scrollLine { position:absolute; bottom:36px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:12px; transition:opacity .8s ease; z-index: 2; }
#scrollLine.hidden { opacity:0; }
#scrollLine .track { width:1px; height:64px; background:rgba(201,169,110,.35); position:relative; overflow:hidden; }
#scrollLine .track::after { content:""; position:absolute; left:0; top:-30%; width:100%; height:30%; background:linear-gradient(to bottom,transparent,#ffffff,transparent); box-shadow:0 0 8px 2px rgba(255,250,235,.9); animation:lightDrop 2.8s ease-in-out infinite; }
@keyframes lightDrop { 0% { top:-30%; } 70%,100% { top:110%; } }
#scrollLine .lbl { font-size:9px; letter-spacing:5px; text-transform:uppercase; color:var(--muted); }

.rv { opacity:0; transform:translateY(34px); transition:opacity 1.3s cubic-bezier(.2,.6,.3,1), transform 1.3s cubic-bezier(.2,.6,.3,1); }
.rv.vis { opacity:1; transform:translateY(0); }
.rv.d1 { transition-delay:.15s; }
.rv.d2 { transition-delay:.3s; }
.rv.d3 { transition-delay:.45s; }

.sec-pad { padding:130px 0; }
.eyebrow { font-size:10px; letter-spacing:7px; text-transform:uppercase; color:var(--gold-deep); text-align:center; font-weight:400; }
.serif-big { font-family:var(--serif); font-weight:300; font-size:clamp(26px,5vw,42px); color:var(--ink); text-align:center; line-height:1.3; }
.story-p { font-family:var(--serif); font-weight:300; font-size:clamp(19px,3vw,23px); line-height:2; color:#4c4c49; text-align:center; max-width:520px; margin:0 auto; }

.parents-block { display:flex; flex-direction:column; align-items:center; gap:16px; margin:14px auto 0; max-width:440px; }
.parent-line { display:flex; flex-direction:column; align-items:center; gap:4px; }
.parent-label { font-family:var(--inter); font-size:10px; letter-spacing:7px; text-transform:uppercase; color:var(--red); font-weight:500; }
.parent-name { font-family:var(--serif); font-weight:500; font-size:clamp(24px,4vw,34px); letter-spacing:4px; color:var(--gold-deep); text-transform:uppercase; text-shadow:0 1px 0 rgba(255,255,255,0.85); }
.parent-divider { font-size:12px; color:var(--red); opacity:0.7; letter-spacing:4px; }

/* QURAN */
#quran { text-align:center; background:linear-gradient(180deg, var(--beige-light) 0%, var(--beige) 50%, var(--beige-light) 100%); position:relative; overflow:hidden; }
#quran::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 50% 50%, rgba(168,42,58,.06) 0%, transparent 70%); animation:quranGlow 6s ease-in-out infinite alternate; }
@keyframes quranGlow { 0% { opacity:.4; transform:scale(1); } 100% { opacity:1; transform:scale(1.1); } }
#quran .wrap { position:relative; z-index:1; }
#quran .arabic { font-family:var(--arabic); font-size:clamp(26px,5vw,42px); line-height:2.2; color:var(--ink); direction:rtl; margin:30px 0 20px; text-shadow:0 1px 0 rgba(255,255,255,.8); animation:quranFadeIn 1.8s ease-out both; }
@keyframes quranFadeIn { 0% { opacity:0; transform:translateY(20px) scale(.95); filter:blur(4px); } 100% { opacity:1; transform:translateY(0) scale(1); filter:blur(0); } }
#quran .translation { font-family:var(--serif); font-style:italic; font-size:clamp(18px,3vw,24px); color:#5a4c3a; line-height:1.9; max-width:620px; margin:0 auto 20px; animation:quranFadeIn 1.8s ease-out .4s both; }
#quran .reference { font-family:var(--inter); font-size:11px; letter-spacing:5px; text-transform:uppercase; color:var(--red); margin-top:30px; font-weight:500; animation:quranFadeIn 1.8s ease-out .8s both; }
#quran .divider { display:flex; align-items:center; justify-content:center; gap:14px; margin:40px 0 10px; }
#quran .divider .dash { width:60px; height:1px; background:linear-gradient(90deg, transparent, var(--gold-light), transparent); }
#quran .divider .diamond { color:var(--red); font-size:11px; animation:diamondSpin 4s linear infinite; }
@keyframes diamondSpin { 0% { transform:rotate(0deg); } 100% { transform:rotate(360deg); } }
#quran .ornament { position:absolute; font-size:22px; color:var(--gold); letter-spacing:14px; opacity:.5; }
#quran .ornament.top { top:40px; left:50%; transform:translateX(-50%); }
#quran .ornament.bottom { bottom:40px; left:50%; transform:translateX(-50%); }

/* CALENDAR */
#calendar { text-align:center; background:linear-gradient(180deg, var(--beige-light) 0%, var(--beige-warm) 100%); position:relative; overflow:hidden; }
.cal-box { max-width:420px; margin:50px auto 0; background:#ffffff; border-radius:8px; padding:30px 24px; box-shadow:0 4px 12px rgba(120,90,50,.1), 0 20px 50px rgba(120,90,50,.15); border:1px solid rgba(201,169,110,.35); position:relative; }
.cal-box::before { content:""; position:absolute; top:-8px; left:50%; transform:translateX(-50%); width:60px; height:16px; background:linear-gradient(180deg, #d4bc8f, #a8854a); border-radius:3px 3px 0 0; }
.cal-month { font-family:var(--serif); font-size:28px; letter-spacing:4px; color:var(--gold-deep); text-transform:uppercase; margin-bottom:4px; }
.cal-year { font-family:var(--inter); font-size:11px; letter-spacing:6px; color:var(--muted); margin-bottom:24px; }
.cal-grid { display:grid; grid-template-columns:repeat(7, 1fr); gap:4px; text-align:center; }
.cal-day-name { font-family:var(--inter); font-size:9px; letter-spacing:2px; text-transform:uppercase; color:var(--muted); padding:8px 0; font-weight:400; }
.cal-day { font-family:var(--serif); font-size:15px; color:var(--ink); padding:10px 0; border-radius:50%; transition:all .3s ease; position:relative; }
.cal-day.other-month { color:rgba(156,143,122,.3); }
.cal-day.special { background:linear-gradient(135deg, var(--red-soft), var(--red-deep)); color:#fff; font-weight:600; box-shadow:0 4px 14px rgba(168,42,58,.45); animation:heartBeat 1.8s ease-in-out infinite; }
@keyframes heartBeat { 0%,100% { transform:scale(1); box-shadow:0 4px 14px rgba(168,42,58,.45); } 50% { transform:scale(1.08); box-shadow:0 6px 22px rgba(168,42,58,.65); } }
.cal-heart { position:absolute; top:-6px; right:-4px; font-size:13px; color:var(--red); animation:heartPulse 1.5s ease-in-out infinite; }
@keyframes heartPulse { 0%,100% { transform:scale(1); opacity:.9; } 50% { transform:scale(1.3); opacity:1; } }
.cal-caption { font-family:var(--serif); font-style:italic; font-size:16px; color:var(--gold-deep); margin-top:24px; padding-top:20px; border-top:1px dashed rgba(201,169,110,.5); }

#countdown-section { text-align:center; padding:100px 24px; background:linear-gradient(180deg, var(--beige-warm) 0%, var(--beige-light) 100%); }
.countdown-title { font-family:var(--script); font-size:clamp(32px,6vw,48px); color:var(--red); margin-bottom:40px; }
.countdown-grid { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; max-width:700px; margin:0 auto; }
.count-box { background:#ffffff; border:1px solid rgba(201,169,110,.4); border-radius:6px; padding:20px 16px; min-width:100px; box-shadow:0 4px 12px rgba(120,90,50,.08), 0 10px 30px rgba(120,90,50,.1); position:relative; overflow:hidden; }
.count-box::before { content:""; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, var(--gold-light), var(--red), var(--gold-light)); }
.count-num { font-family:var(--serif); font-size:clamp(34px,6vw,48px); font-weight:500; color:var(--red-deep); line-height:1; letter-spacing:1px; }
.count-lbl { font-family:var(--inter); font-size:9px; letter-spacing:4px; text-transform:uppercase; color:var(--muted); margin-top:8px; }
.countdown-sub { font-family:var(--serif); font-style:italic; font-size:18px; color:var(--muted); margin-top:40px; }

/* RAINBOW — SVG SKY */
.rainbow-section {
  padding: 80px 0 60px;
  text-align: center;
  position: relative;
  background: linear-gradient(180deg, #f9f3e8 0%, #e0ebf0 50%, #f2e8d5 100%);
}
.rainbow-section::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 700px 300px at 50% 15%, rgba(255,255,255,.8) 0%, transparent 65%),
    radial-gradient(ellipse 400px 180px at 20% 25%, rgba(255,255,255,.6) 0%, transparent 60%);
  pointer-events: none;
}
.rainbow-section .wrap { position: relative; z-index: 1; }

.rainbow-frame { max-width:780px; margin:40px auto 0; border-radius:14px; overflow:hidden; background:#ffffff; padding:14px; box-shadow: 0 10px 30px rgba(168,133,74,.35), 0 40px 90px rgba(168,133,74,.25), inset 0 0 0 1px rgba(201,169,110,.25); border: 4px solid rgba(255,255,255,0.9); opacity: 0; transform: scale(.96); filter: blur(8px); transition: opacity 1.6s ease, transform 1.6s cubic-bezier(.2,.6,.3,1), filter 1.6s ease; cursor: pointer; }
.rainbow-frame.vis { opacity: 1; transform: scale(1); filter: blur(0); }
.rainbow-frame img { width: 100%; height: auto; display: block; border-radius: 8px; transition: transform 1.2s ease; }
.rainbow-frame:hover img { transform: scale(1.015); }
.rainbow-caption { font-family: var(--serif); font-style: italic; font-size: 17px; color: var(--muted); margin-top: 24px; letter-spacing: 0.3px; }

.ev-row { display:flex; align-items:baseline; justify-content:space-between; gap:20px; max-width:560px; margin:0 auto; padding:38px 6px; background:linear-gradient(90deg, transparent, rgba(201,169,110,.12), transparent); border-top:1px solid rgba(201,169,110,.5); border-bottom:1px solid rgba(201,169,110,.5); position:relative; }
.ev-row::before { content:"✦"; position:absolute; left:50%; top:-10px; transform:translateX(-50%); font-size:12px; color:var(--red); background:var(--beige-light); padding:0 10px; }
.ev-name { font-family:var(--serif); font-weight:400; font-size:clamp(32px,6vw,44px); color:var(--gold-deep); letter-spacing:2px; }
.ev-name .urdu { display:block; font-family:var(--arabic); font-size:0.42em; color:var(--red); letter-spacing:0; margin-top:6px; }
.ev-date { text-align:right; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:var(--muted); line-height:1.9; }
.ev-date b { display:block; font-weight:500; font-size:13px; color:var(--red); }
.ev-date .time-small { display:block; font-family:var(--serif); font-style:italic; font-size:14px; letter-spacing:1px; text-transform:none; color:var(--gold-deep); margin-top:4px; }

#venue { text-align:center; }
.map-btn { display:inline-block; margin-top:40px; padding:15px 46px; border:1px solid var(--red); color:var(--red-deep); background:transparent; font-size:10px; letter-spacing:6px; text-transform:uppercase; text-decoration:none; font-family:var(--inter); font-weight:500; cursor:pointer; transition:all .45s ease; }
.map-btn:hover { background:var(--red-deep); border-color:var(--red-deep); color:#fff; }

#thanks { text-align:center; background:linear-gradient(180deg, var(--beige-light) 0%, var(--beige) 100%); padding:130px 24px; }
.thanks-script { font-family:var(--script); font-size:clamp(40px,8vw,64px); color:var(--red); line-height:1.2; margin-bottom:20px; }
.thanks-text { font-family:var(--serif); font-style:italic; font-size:clamp(18px,3vw,22px); color:#5a4c3a; line-height:1.9; max-width:560px; margin:0 auto 24px; }
.thanks-emoji { font-size:28px; letter-spacing:12px; margin:30px 0 20px; animation:emojiFloat 3s ease-in-out infinite; }
@keyframes emojiFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
.thanks-signature { font-family:var(--script); font-size:36px; color:var(--gold-deep); margin-top:30px; }
.thanks-divider { display:flex; align-items:center; justify-content:center; gap:14px; margin:30px auto 30px; }
.thanks-divider .dash { width:60px; height:1px; background:linear-gradient(90deg, transparent, var(--gold-light), transparent); }
.thanks-divider .diamond { color:var(--red); font-size:11px; }

#musicBtn { position:fixed; bottom:22px; right:22px; z-index:80; width:46px; height:46px; border-radius:50%; cursor:pointer; background:rgba(255,255,255,.9); backdrop-filter:blur(10px); border:1px solid rgba(168,42,58,.5); display:flex; align-items:center; justify-content:center; box-shadow:0 6px 20px rgba(120,90,50,.15); transition:all .4s ease; opacity:0; pointer-events:none; }
#musicBtn.visible { opacity:1; pointer-events:auto; }
#musicBtn:hover { border-color:var(--red); }
#musicBtn svg { width:15px; height:15px; stroke:var(--red-deep); fill:none; stroke-width:1.4; }
#musicBtn .bars { display:none; align-items:flex-end; gap:2.5px; height:13px; }
#musicBtn.playing .bars { display:flex; }
#musicBtn.playing .note { display:none; }
#musicBtn .bars i { width:2px; background:var(--red-deep); animation:eq 1s ease-in-out infinite; }
#musicBtn .bars i:nth-child(1) { height:60%; }
#musicBtn .bars i:nth-child(2) { height:100%; animation-delay:.2s; }
#musicBtn .bars i:nth-child(3) { height:45%; animation-delay:.4s; }
@keyframes eq { 0%,100% { transform:scaleY(.4); } 50% { transform:scaleY(1); } }

#final { min-height:80svh; display:flex; flex-direction:column; align-items:center; justify-content:center; background:radial-gradient(ellipse at 50% 100%, var(--beige), var(--beige-light) 65%); text-align:center; gap:34px; padding:120px 24px; }
#final .fmono { width:130px; height:130px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 32% 28%, #fffdf9, var(--beige) 50%, var(--beige-deep)); box-shadow:inset 0 1px 2px rgba(255,255,255,.9), inset 0 -3px 8px rgba(168,133,74,.25), 0 8px 26px rgba(120,90,50,.18), 0 0 0 1.5px rgba(201,169,110,.7), 0 0 0 3px rgba(168,42,58,.25); }
#final .fmono span { font-family:var(--serif); font-weight:400; font-size:36px; letter-spacing:4px; display:flex; flex-direction:column; align-items:center; line-height:1; }
#final .fmono .letter-f, #final .fmono .letter-m { background: linear-gradient(160deg, #8b1e2e, #a8854a); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
#final .fmono .amp { font-size:16px; font-style:italic; color:var(--red); margin:3px 0; font-family:var(--script); }
#final .withlove { font-family:var(--serif); font-style:italic; font-weight:300; font-size:20px; color:var(--muted); }

#lightbox { position:fixed; inset:0; z-index:90; background:rgba(61,52,40,.92); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity .6s ease; }
#lightbox.on { opacity:1; pointer-events:auto; }
#lbImg { max-width:92vw; max-height:82vh; object-fit:contain; box-shadow:0 30px 100px rgba(0,0,0,.5); transition:opacity .45s ease, transform .45s ease; border-radius:6px; background:#fff; }
#lbImg.swap { opacity:0; transform:scale(.97); }
.lb-btn { position:absolute; background:none; border:none; color:rgba(255,250,235,.75); font-family:var(--inter); font-weight:200; font-size:12px; letter-spacing:4px; text-transform:uppercase; cursor:pointer; padding:14px; transition:color .3s; }
.lb-btn:hover { color:#fdfaf4; }
#lbPrev { left:14px; top:50%; transform:translateY(-50%); }
#lbNext { right:14px; top:50%; transform:translateY(-50%); }
#lbClose { top:18px; right:22px; font-size:20px; letter-spacing:0; }
#lbCount { position:absolute; bottom:22px; left:50%; transform:translateX(-50%); color:rgba(255,250,235,.55); font-size:10px; letter-spacing:4px; }

@media (max-width:640px) {
  #card { width:min(92vw,380px); height:min(86vh,580px); }
  #monogram { width:180px; height:180px; }
  #monoText .letter { font-size:64px; }
  #monoText .amp { font-size:32px; }
  .floral-corner { width:100px; height:100px; }
  .floral-top { width:140px; height:48px; top:26px; }
  .floral-bottom { width:110px; height:32px; }
  .floral-vine { display:none; }
  .cal-box { padding:24px 16px; }
  .cal-day { font-size:13px; padding:8px 0; }
  .count-box { min-width:80px; padding:16px 12px; }
  .thanks-emoji { font-size:22px; letter-spacing:8px; }
  .ray { filter:blur(14px); }
  #lensFlare { width:200px; height:200px; }
}
`;

/* =====================================================================
   FLORAL SVGs
   ===================================================================== */
const FloralCorner = () => (
  <svg viewBox="0 0 140 140" fill="none" stroke="#c9a96e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 132 C8 90 30 60 60 40 C80 28 100 20 120 12" opacity=".9"/>
    <path d="M8 132 C8 90 30 60 60 40 C80 28 100 20 120 12" opacity=".4" transform="translate(2,2)"/>
    <circle cx="112" cy="22" r="10" opacity=".85"/>
    <path d="M112 22 C112 16 118 16 118 22 C118 28 106 28 106 22 C106 14 116 12 122 18" opacity=".8"/>
    <path d="M108 20 Q112 18 116 22 Q118 26 112 26" opacity=".65"/>
    <circle cx="112" cy="22" r="2" fill="#a8273a" stroke="none"/>
    <circle cx="86" cy="36" r="6" opacity=".75"/>
    <path d="M86 36 C86 32 90 32 90 36 C90 40 82 40 82 36" opacity=".7"/>
    <circle cx="86" cy="36" r="1.2" fill="#a8273a" stroke="none"/>
    <path d="M30 100 Q40 90 52 96 Q46 108 30 100 Z" opacity=".8"/>
    <path d="M36 86 Q46 76 58 82 Q52 94 36 86 Z" opacity=".8"/>
    <path d="M50 72 Q60 62 72 68 Q66 80 50 72 Z" opacity=".8"/>
    <path d="M66 58 Q76 48 88 54 Q82 66 66 58 Z" opacity=".8"/>
    <path d="M32 100 Q40 96 50 96" opacity=".55"/>
    <path d="M38 86 Q48 82 56 82" opacity=".55"/>
    <path d="M52 72 Q62 68 70 68" opacity=".55"/>
    <path d="M68 58 Q78 54 86 54" opacity=".55"/>
    <circle cx="20" cy="118" r="3" opacity=".7"/>
    <circle cx="20" cy="118" r="1.4" fill="#a8273a" stroke="none" opacity=".8"/>
    <circle cx="44" cy="112" r="2.5" opacity=".7"/>
    <circle cx="72" cy="50" r="2" opacity=".7"/>
  </svg>
);

const FloralTop = () => (
  <svg viewBox="0 0 180 60" fill="none" stroke="#c9a96e" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M90 8 C90 20 84 32 70 42 C60 48 44 52 26 52" opacity=".9"/>
    <path d="M90 8 C90 20 96 32 110 42 C120 48 136 52 154 52" opacity=".9"/>
    <circle cx="90" cy="10" r="7" opacity=".9"/>
    <path d="M90 10 C90 5 95 5 95 10 C95 15 85 15 85 10 C85 4 94 3 98 8" opacity=".75"/>
    <circle cx="90" cy="10" r="1.5" fill="#a8273a" stroke="none"/>
    <path d="M70 32 Q64 26 72 22 Q78 28 70 32 Z" opacity=".7"/>
    <path d="M110 32 Q116 26 108 22 Q102 28 110 32 Z" opacity=".7"/>
    <path d="M52 44 Q46 38 54 34 Q60 40 52 44 Z" opacity=".7"/>
    <path d="M128 44 Q134 38 126 34 Q120 40 128 44 Z" opacity=".7"/>
    <path d="M34 50 Q28 46 34 42 Q40 46 34 50 Z" opacity=".65"/>
    <path d="M146 50 Q152 46 146 42 Q140 46 146 50 Z" opacity=".65"/>
    <circle cx="24" cy="52" r="2.4" opacity=".7"/>
    <circle cx="156" cy="52" r="2.4" opacity=".7"/>
    <circle cx="24" cy="52" r="1" fill="#a8273a" stroke="none"/>
    <circle cx="156" cy="52" r="1" fill="#a8273a" stroke="none"/>
  </svg>
);

const FloralBottom = () => (
  <svg viewBox="0 0 140 40" fill="none" stroke="#c9a96e" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M70 6 C70 14 64 22 52 30 C44 34 32 36 18 36" opacity=".9"/>
    <path d="M70 6 C70 14 76 22 88 30 C96 34 108 36 122 36" opacity=".9"/>
    <circle cx="70" cy="6" r="4" opacity=".85"/>
    <circle cx="70" cy="6" r="1" fill="#a8273a" stroke="none"/>
    <path d="M50 26 Q44 20 52 16 Q58 22 50 26 Z" opacity=".65"/>
    <path d="M90 26 Q96 20 88 16 Q82 22 90 26 Z" opacity=".65"/>
    <circle cx="18" cy="36" r="2" opacity=".7"/>
    <circle cx="122" cy="36" r="2" opacity=".7"/>
  </svg>
);

const FloralVine = () => (
  <svg viewBox="0 0 60 220" fill="none" stroke="#c9a96e" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M30 6 C30 40 20 80 30 120 C40 160 30 200 30 214" opacity=".85"/>
    <path d="M30 40 Q44 44 42 58 Q28 54 30 40 Z" opacity=".7"/>
    <path d="M30 80 Q16 84 18 98 Q32 94 30 80 Z" opacity=".7"/>
    <path d="M30 120 Q44 124 42 138 Q28 134 30 120 Z" opacity=".7"/>
    <path d="M30 160 Q16 164 18 178 Q32 174 30 160 Z" opacity=".7"/>
    <circle cx="30" cy="200" r="3" opacity=".75"/>
    <circle cx="30" cy="200" r="1" fill="#a8273a" stroke="none"/>
  </svg>
);

/* =====================================================================
   COMPONENTS
   ===================================================================== */

const Reveal = ({ children, delay = '' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${delay} ${visible ? 'vis' : ''}`}>{children}</div>;
};

const SunlightEffect = ({ active }) => {
  const sparklesRef = useRef(null);
  useEffect(() => {
    if (!active || !sparklesRef.current) return;
    const c = sparklesRef.current;
    c.innerHTML = '';
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('div');
      s.className = 'sparkle';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 80 + 10 + '%';
      s.style.animationDelay = Math.random() * 3 + 's';
      s.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      const size = 2 + Math.random() * 5;
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      c.appendChild(s);
    }
  }, [active]);

  return (
    <>
      <div id="sunGlow" className={active ? 'active' : ''} />
      <div id="sunRays" className={active ? 'active' : ''} ref={sparklesRef}>
        {[...Array(7)].map((_, i) => <div className="ray" key={i} />)}
      </div>
      <div id="lensFlare" className={active ? 'active' : ''} />
    </>
  );
};

const OpeningStage = ({ onEnter }) => {
  const [entered, setEntered] = useState(false);
  const [lit, setLit] = useState(false);
  const [sunrise, setSunrise] = useState(false);
  const [entering, setEntering] = useState(false);
  const [whiteout, setWhiteout] = useState(false);
  const [gone, setGone] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (!window.matchMedia('(hover:hover)').matches) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    cardRef.current.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'rotateY(0) rotateX(0)';
  };

  const handleClick = useCallback(() => {
    if (entered) return;
    setEntered(true);
    setLit(true);
    setTimeout(() => setSunrise(true), 350);
    setTimeout(() => setEntering(true), 800);
    setTimeout(() => setWhiteout(true), 1100);
    setTimeout(() => { window.scrollTo(0, 0); onEnter(); }, 1550);
    setTimeout(() => setWhiteout(false), 2400);
    setTimeout(() => setGone(true), 2900);
  }, [entered, onEnter]);

  if (gone) return null;

  return (
    <>
      <div
        id="stage"
        className={gone ? 'gone' : ''}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ opacity: entering ? 0 : 1, transition: 'opacity 1.4s ease' }}
      >
        <div id="ambientGlow" />
        <SunlightEffect active={lit} />

        <div id="card" ref={cardRef} onClick={handleClick} className={entering ? 'entering-card' : ''}>
          <span className="corner-diamond tl" />
          <span className="corner-diamond tr" />
          <span className="corner-diamond bl" />
          <span className="corner-diamond br" />

          <span className="floral-corner tl"><FloralCorner /></span>
          <span className="floral-corner tr"><FloralCorner /></span>
          <span className="floral-corner bl"><FloralCorner /></span>
          <span className="floral-corner br"><FloralCorner /></span>
          <span className="floral-top"><FloralTop /></span>
          <span className="floral-bottom"><FloralBottom /></span>
          <span className="floral-vine left"><FloralVine /></span>
          <span className="floral-vine right"><FloralVine /></span>

          <div id="sheen" />
          <div id="monoWrap" className={lit ? 'lit' : ''}>
            <div id="monogram" role="button" aria-label="Enter">
              <div id="monoGlow" />
              <div id="sunCore" className={sunrise ? 'rise' : ''} />
              <div id="monoText">
                <span className="letter">F</span>
                <span className="amp">&amp;</span>
                <span className="letter">M</span>
              </div>
            </div>
            <div id="touchHint">Touch to enter</div>
          </div>
        </div>
        <div id="cardShadow" />
      </div>
      <div id="whiteout" className={whiteout ? 'on' : ''} />
    </>
  );
};

const Countdown = () => {
  const [time, setTime] = useState({ d: '--', h: '--', m: '--', s: '--' });
  useEffect(() => {
    const target = new Date('2026-12-25T19:30:00');
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) { setTime({ d: '00', h: '00', m: '00', s: '00' }); return; }
      setTime({
        d: pad(Math.floor(diff / 86400000)),
        h: pad(Math.floor(diff / 3600000) % 24),
        m: pad(Math.floor(diff / 60000) % 60),
        s: pad(Math.floor(diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="countdown-section">
      <div className="countdown-title">Counting down to forever</div>
      <div className="countdown-grid">
        <div className="count-box"><div className="count-num">{time.d}</div><div className="count-lbl">Days</div></div>
        <div className="count-box"><div className="count-num">{time.h}</div><div className="count-lbl">Hours</div></div>
        <div className="count-box"><div className="count-num">{time.m}</div><div className="count-lbl">Minutes</div></div>
        <div className="count-box"><div className="count-num">{time.s}</div><div className="count-lbl">Seconds</div></div>
      </div>
      <p className="countdown-sub">until we say "Qubool Hai"</p>
    </section>
  );
};

const Lightbox = ({ open, onClose, sources }) => {
  const [current, setCurrent] = useState(0);
  const [swapping, setSwapping] = useState(false);

  const swap = (dir) => {
    if (sources.length <= 1) return;
    setSwapping(true);
    setTimeout(() => {
      setCurrent((p) => (p + dir + sources.length) % sources.length);
      setSwapping(false);
    }, 300);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') swap(-1);
      if (e.key === 'ArrowRight') swap(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, );

  return (
    <div id="lightbox" className={open ? 'on' : ''} onClick={(e) => e.target.id === 'lightbox' && onClose()}>
      <button className="lb-btn" id="lbClose" onClick={onClose}>✕</button>
      <button className="lb-btn" id="lbPrev" onClick={() => swap(-1)}>← Prev</button>
      <img id="lbImg" className={swapping ? 'swap' : ''} src={sources[current]} alt="" />
      <button className="lb-btn" id="lbNext" onClick={() => swap(1)}>Next →</button>
      <div id="lbCount">{current + 1} / {sources.length}</div>
    </div>
  );
};

const MusicButton = ({ revealed }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const toggle = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };
  return (
    <>
      <button
        id="musicBtn"
        className={`${playing ? 'playing' : ''} ${revealed ? 'visible' : ''}`}
        aria-label="Music"
        onClick={toggle}
      >
        <svg className="note" viewBox="0 0 24 24">
          <path d="M9 18V5l11-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="15" r="2.5" />
        </svg>
        <span className="bars"><i></i><i></i><i></i></span>
      </button>
      <audio ref={audioRef} loop preload="none">
        <source src="" type="audio/mpeg" />
      </audio>
    </>
  );
};

const Calendar = () => {
  const days = [];
  days.push({ n: 29, other: true }, { n: 30, other: true });
  for (let i = 1; i <= 31; i++) days.push({ n: i, special: i === 25 });
  days.push({ n: 1, other: true }, { n: 2, other: true });

  return (
    <section id="calendar" className="sec-pad">
      <div className="wrap">
        <Reveal><p className="eyebrow">Save the date</p></Reveal>
        <Reveal delay="d1"><h2 className="serif-big" style={{ marginTop: 18 }}>Mark your calendar</h2></Reveal>
        <Reveal delay="d2">
          <div className="cal-box">
            <div className="cal-month">December</div>
            <div className="cal-year">2026</div>
            <div className="cal-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="cal-day-name">{d}</div>
              ))}
              {days.map((d, i) => (
                <div key={i} className={`cal-day ${d.other ? 'other-month' : ''} ${d.special ? 'special' : ''}`}>
                  {d.n}
                  {d.special && <span className="cal-heart">❤</span>}
                </div>
              ))}
            </div>
            <div className="cal-caption">Our Nikah — Friday, 25 December 2026 ❤</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* =====================================================================
   MAIN APP
   ===================================================================== */
export default function App() {
  const [revealed, setRevealed] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const scrollLineRef = useRef(null);

  const sources = [rainbowSVG, rainbowSVG, rainbowSVG, rainbowSVG];

  useEffect(() => {
    const onScroll = () => {
      if (scrollLineRef.current) {
        if (window.scrollY > 90) scrollLineRef.current.classList.add('hidden');
        else scrollLineRef.current.classList.remove('hidden');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <style>{globalStyles}</style>
      <div className="grain" />

      <OpeningStage onEnter={() => setRevealed(true)} />

      <div id="main" style={{ opacity: revealed ? 1 : 0, transition: 'opacity 1.6s ease .3s' }}>
        <main>
          {/* INTRO */}
          <section id="intro">
            <Reveal><div className="micro">Bismillah · Together with their families</div></Reveal>
            <Reveal delay="d1"><div className="day">Friday</div></Reveal>
            <Reveal delay="d1"><div className="dateNum">25</div></Reveal>
            <Reveal delay="d2"><div className="month">December</div></Reveal>
            <Reveal delay="d2"><div className="year">2026</div></Reveal>
            <Reveal delay="d3"><div className="hairline" /></Reveal>
            <Reveal delay="d3"><div className="venueLine">Gujrat, Pakistan</div></Reveal>
            <div id="scrollLine" ref={scrollLineRef}>
              <div className="track" />
              <div className="lbl">Scroll</div>
            </div>
          </section>

          {/* QURAN */}
          <section id="quran" className="sec-pad">
            <div className="ornament top">❦ ❦ ❦</div>
            <div className="wrap">
              <Reveal>
                <div className="divider"><span className="dash" /><span className="diamond">◆</span><span className="dash" /></div>
              </Reveal>
              <Reveal delay="d1">
                <p className="eyebrow" style={{ marginBottom: 30 }}>In the name of Allah, the Most Gracious, the Most Merciful</p>
              </Reveal>
              <Reveal delay="d2">
                <div className="arabic">
                  وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ
                </div>
              </Reveal>
              <Reveal delay="d2">
                <div className="translation">
                  "And among His signs is that He created for you spouses from among yourselves, that you may find tranquility in them; and He placed between you affection and mercy. Indeed in that are signs for a people who give thought."
                </div>
              </Reveal>
              <Reveal delay="d3"><div className="reference">— Surah Ar-Rum, 30:21</div></Reveal>
              <Reveal delay="d3">
                <div className="divider"><span className="dash" /><span className="diamond">◆</span><span className="dash" /></div>
              </Reveal>
            </div>
            <div className="ornament bottom">❦ ❦ ❦</div>
          </section>

          {/* NAMES + PARENTS */}
          <section className="sec-pad">
            <div className="wrap">
              <Reveal><p className="eyebrow">The blessed union of</p></Reveal>
              <Reveal delay="d1"><h2 className="serif-big" style={{ marginTop: 18 }}>Maham &amp; Faizan</h2></Reveal>
              <Reveal delay="d2"><div className="hairline-red" /></Reveal>

              <Reveal delay="d3">
                <div className="parents-block">
                  <div className="parent-line">
                    <span className="parent-label">Daughter of</span>
                    <span className="parent-name">Khawar</span>
                  </div>
                  <div className="parent-divider">✦</div>
                  <div className="parent-line">
                    <span className="parent-label">Son of</span>
                    <span className="parent-name">Anwar</span>
                  </div>
                </div>
              </Reveal>

              <Reveal delay="d3">
                <p className="story-p" style={{ marginTop: 40 }}>Request the honour of your presence<br />at their Nikah, In Sha Allah</p>
              </Reveal>
            </div>
          </section>

          {/* RAINBOW — SVG */}
          <section className="rainbow-section">
            <div className="wrap">
              <Reveal><p className="eyebrow">A sign of mercy</p></Reveal>
              <Reveal delay="d1"><h2 className="serif-big" style={{ marginTop: 18 }}>Allah's promise in the sky</h2></Reveal>
              <Reveal delay="d2">
                <div className="rainbow-frame" onClick={() => setLbOpen(true)}>
                  <img src={rainbowSVG} alt="Rainbow — a sign of Allah's mercy" />
                </div>
              </Reveal>
              <Reveal delay="d3"><p className="rainbow-caption">— a covenant of light after the rain —</p></Reveal>
            </div>
          </section>

          {/* STORY */}
          <section className="sec-pad" style={{ paddingTop: 40 }}>
            <div className="wrap">
              <Reveal><p className="eyebrow">Our journey</p></Reveal>
              <Reveal><div className="hairline" /></Reveal>
              <Reveal><p className="story-p">Our journey began with a prayer —<br />the way all blessed things do.</p></Reveal>
              <Reveal><p className="story-p" style={{ marginTop: 44 }}>A glance, held a moment too long.<br />A conversation neither of us wanted to end.</p></Reveal>
              <Reveal><p className="story-p" style={{ marginTop: 44 }}>And then, one ordinary day became<br />the beginning of everything.</p></Reveal>
            </div>
          </section>

          <Calendar />
          <Countdown />

          {/* EVENT */}
          <section className="sec-pad">
            <div className="wrap">
              <Reveal><p className="eyebrow">The celebration</p></Reveal>
              <Reveal delay="d1"><h2 className="serif-big" style={{ margin: '18px 0 70px' }}>Nikah Ceremony</h2></Reveal>
              <Reveal delay="d1">
                <div className="ev-row">
                  <span className="ev-name">Nikah<span className="urdu">نکاح</span></span>
                  <span className="ev-date">
                    <b>Friday</b>25 December 2026
                    <span className="time-small">7:30 PM</span>
                  </span>
                </div>
              </Reveal>
            </div>
          </section>

          {/* VENUE */}
          <section id="venue" className="sec-pad" style={{ paddingTop: 40 }}>
            <div className="wrap">
              <Reveal><p className="eyebrow">The venue</p></Reveal>
              <Reveal delay="d1"><h2 className="serif-big" style={{ marginTop: 18 }}>Gujrat, Pakistan</h2></Reveal>
              <Reveal delay="d3">
                <a className="map-btn" href="https://maps.google.com/?q=Gujrat+Pakistan" target="_blank" rel="noopener noreferrer">
                  View location
                </a>
              </Reveal>
            </div>
          </section>

          {/* THANKS */}
          <section id="thanks">
            <div className="wrap">
              <Reveal>
                <div className="thanks-divider"><span className="dash" /><span className="diamond">◆</span><span className="dash" /></div>
              </Reveal>
              <Reveal delay="d1"><div className="thanks-script">Thank You</div></Reveal>
              <Reveal delay="d2">
                <p className="thanks-text">
                  Your presence, prayers, and blessings mean the world to us.<br />
                  We would be honoured to have you share in our joy.
                </p>
              </Reveal>
              <Reveal delay="d2"><div className="thanks-emoji">🌸 💕 🤲 ✨ 💐</div></Reveal>
              <Reveal delay="d3">
                <p className="thanks-text" style={{ fontSize: 16 }}>With warm regards and heartfelt duas,</p>
              </Reveal>
              <Reveal delay="d3"><div className="thanks-signature">Maham &amp; Faizan</div></Reveal>
              <Reveal delay="d3">
                <div className="thanks-divider" style={{ marginTop: 40 }}>
                  <span className="dash" /><span className="diamond">◆</span><span className="dash" />
                </div>
              </Reveal>
            </div>
          </section>

          {/* FINAL */}
          <section id="final">
            <Reveal>
              <div className="fmono">
                <span>
                  <span className="letter-f">F</span>
                  <span className="amp">&amp;</span>
                  <span className="letter-m">M</span>
                </span>
              </div>
            </Reveal>
            <Reveal delay="d1"><div className="withlove">with love &amp; duas</div></Reveal>
          </section>
        </main>
      </div>

      <Lightbox open={lbOpen} onClose={() => setLbOpen(false)} sources={sources} />
      <MusicButton revealed={revealed} />
    </>
  );
}