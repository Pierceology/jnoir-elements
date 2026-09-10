// @ts-nocheck
/* eslint-env browser */
/**
 * NEW TV — the portal, as a Wix custom element.
 *
 * Tag: newtv-portal
 * Add in the Editor: Add > Embed > Custom Element, set the tag name above and
 * point it at this file. Give the element a full-width, tall box — it fills
 * whatever box it is given.
 *
 * Ported from the standalone newtv/index.html. The page was written as a
 * full-viewport document, so three things changed and nothing else:
 *   - all markup/CSS lives in a shadow root, so its resets stay inside it
 *   - position:fixed became position:absolute against the host box
 *   - document-level lookups and the keydown handler are scoped to the element
 */

const NEWTV_FONTS =
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&' +
  'family=Inter:wght@400;500;600&display=swap';

// @font-face has to live in the main document; shadow roots do not load it.
function ensureFonts() {
  if (document.getElementById('newtv-fonts')) return;
  const l = document.createElement('link');
  l.id = 'newtv-fonts'; l.rel = 'stylesheet'; l.href = NEWTV_FONTS;
  document.head.appendChild(l);
}

const NEWTV_CSS = String.raw`
  :host{
    /* Built from SMPTE bars at reduced saturation rather than from neon.
       The old palette was pure yellow on near-black with three greys total,
       which is why everything read as either foreground or void -- there was
       no middle for anything to sit in. The ramp below is the middle. */
    --void:#0B0B0E;        /* warm near-black, never pure #000 */
    --panel:#141419;
    --line:#26262E;
    --g1:#3A3A44;          /* the ramp the design was missing */
    --g2:#565662;
    --g3:#7C7C89;
    --g4:#A8A8B2;
    --accent:#D8A657;      /* bars-amber, desaturated. Not caution tape. */
    --accent-dim:#8A6C38;
    --text:#E9E7E3;        /* warm off-white, not clinical */
    --dim:#8A8A93;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  /* Inter is proportional where VT323 was fixed-width, so anything that shows
     a time or a channel number needs lining, tabular figures or the digits
     shift under each other as the clock ticks. */
  #clock,#osd,.slot em,#timebar,.ch b,#nowbar{font-variant-numeric:tabular-nums lining-nums;}
  /* Getting from one category to another used to mean leaving the TV entirely,
     back to the portal, into the branch, into the wall, and down again. Every
     network now sits across the top of the guide, both branches at once. */
  #netstrip{display:flex;gap:6px;overflow-x:auto;padding:8px 12px;background:var(--void);
    border-bottom:1px solid var(--line);scrollbar-width:none;}
  #netstrip::-webkit-scrollbar{display:none;}
  #netstrip button{flex:0 0 auto;background:transparent;border:1px solid var(--line);
    color:var(--g3);font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:12px;
    letter-spacing:1.5px;text-transform:uppercase;padding:6px 12px;border-radius:999px;cursor:pointer;
    white-space:nowrap;}
  #netstrip button:hover{color:var(--text);border-color:var(--g2);}
  #netstrip button.on{background:var(--tint,var(--accent));border-color:transparent;color:#000;}
  #netstrip .sep{flex:0 0 auto;align-self:center;width:1px;height:18px;background:var(--line);margin:0 4px;}
  .bandmark{display:flex;align-items:center;gap:10px;padding:6px 14px;background:var(--void);
    color:var(--g3);font-size:11px;letter-spacing:4px;border-bottom:1px solid var(--line);}
  .bandmark:before,.bandmark:after{content:"";flex:1;height:1px;background:var(--line);}
  :host{display:block;position:relative;width:100%;height:100vh;height:100svh;overflow:hidden;background:var(--void);color:var(--text);font-family:'Barlow Condensed',Arial,sans-serif;}

  /* ================= PORTAL ================= */
  #portal{position:absolute;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;overflow:auto;padding:24px 12px;background:
    radial-gradient(1200px 600px at 50% -10%, #10131f 0%, var(--void) 60%);}
  #portal .brand{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-weight:800;font-size:clamp(30px,6vw,58px);letter-spacing:8px;
    background:linear-gradient(180deg,#fff,#7d8496);-webkit-background-clip:text;background-clip:text;color:transparent;}
  #portal .tag{font-family:'Inter',system-ui,sans-serif;font-size:19px;color:var(--dim);letter-spacing:4px;margin-top:-16px;}
  #hero{width:min(680px,94vw);padding:18px 22px;border-radius:14px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:18px;
    background:linear-gradient(90deg, color-mix(in srgb, var(--hero-tint) 22%, #0B0D14), #0B0D14);
    border:1px solid var(--hero-tint);box-shadow:0 0 44px -14px var(--hero-tint);transition:transform .15s;}
  #hero:hover{transform:translateY(-3px);}
  #hero .live{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:12px;letter-spacing:3px;color:#fff;background:var(--hero-tint);padding:4px 10px;border-radius:6px;white-space:nowrap;animation:pulse 2s infinite;}
  @keyframes pulse{50%{opacity:.55;}}
  @media (prefers-reduced-motion:reduce){#hero .live{animation:none;}}
  #hero h2{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:clamp(17px,3vw,24px);letter-spacing:2px;color:var(--hero-tint);}
  #hero p{font-size:15px;color:var(--dim);margin-top:3px;}

  #portal .row{display:flex;gap:20px;flex-wrap:wrap;justify-content:center;}
  .megabtn{position:relative;width:min(290px,42vw);padding:26px 18px;border-radius:14px;cursor:pointer;text-align:center;
    background:linear-gradient(180deg,#151827,#0A0C13);border:1px solid var(--line);transition:transform .15s,border-color .15s;}
  .megabtn:hover,.megabtn:focus-visible{transform:translateY(-4px);outline:none;border-color:var(--glow);box-shadow:0 0 34px -8px var(--glow);}
  .megabtn h2{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:clamp(20px,3.2vw,30px);letter-spacing:4px;color:var(--glow);}
  .megabtn p{font-size:15px;color:var(--dim);margin-top:7px;letter-spacing:1px;}
  .megabtn.ad{--glow:#FFD84D;} .megabtn.tv{--glow:#00E5FF;}

  #subnets{display:none;flex-wrap:wrap;gap:14px;justify-content:center;max-width:940px;}
  .tile{width:min(215px,44vw);padding:16px 14px;border-radius:12px;cursor:pointer;text-align:left;
    background:linear-gradient(180deg,#141726,#0A0C13);border:1px solid var(--line);transition:transform .15s,border-color .15s;}
  .tile:hover,.tile:focus-visible{transform:translateY(-3px);border-color:var(--tint);outline:none;box-shadow:0 0 26px -10px var(--tint);}
  .tile h3{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:16px;letter-spacing:2px;color:var(--tint);}
  .tile p{font-size:13px;color:var(--dim);margin-top:5px;line-height:1.25;}
  #back{display:none;font-family:'Inter',system-ui,sans-serif;font-size:20px;color:var(--dim);background:none;border:1px solid var(--line);
    padding:6px 18px;border-radius:8px;cursor:pointer;letter-spacing:2px;}
  #back:hover{color:var(--text);border-color:var(--dim);}

  #sponsorbar{display:none;font-family:'Inter',system-ui,sans-serif;font-size:17px;color:var(--dim);letter-spacing:1px;text-align:center;}
  #sponsorbar a{color:var(--accent);text-decoration:none;}
  #sponsorbar a:hover{text-decoration:underline;}

  /* ================= TV ENGINE ================= */
  #tv{position:relative;height:100vh;height:100svh;display:none;flex-direction:column;background:var(--void);}
  #screen{position:relative;flex:1 1 55%;min-height:0;background:#000;}
  video{width:100%;height:100%;display:block;background:#000;object-fit:contain;}
  #menuchip{position:absolute;top:10px;left:12px;z-index:8;background:rgba(0,0,0,.65);color:var(--accent);border:1px solid var(--accent);font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:12px;letter-spacing:2px;padding:6px 12px;border-radius:8px;cursor:pointer;}
  #menuchip:hover{background:var(--accent);color:#000;}
  #osd{position:absolute;top:12px;left:52px;top:52px;left:16px;font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-weight:800;font-size:26px;color:var(--accent);text-shadow:0 0 12px var(--accent),1px 1px 0 #000;letter-spacing:3px;pointer-events:none;z-index:7;opacity:0;transition:opacity .3s;}
  #osd.show{opacity:1;}
  #clock{position:absolute;top:12px;right:16px;font-family:'Inter',system-ui,sans-serif;font-size:30px;color:var(--accent);text-shadow:1px 1px 0 #000;pointer-events:none;z-index:7;}
  #nowbar{position:absolute;left:0;right:0;bottom:0;background:linear-gradient(0deg,rgba(0,0,0,.9),transparent);padding:26px 16px 8px;font-family:'Inter',system-ui,sans-serif;font-size:20px;color:var(--text);text-shadow:1px 1px 0 #000;pointer-events:none;z-index:7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  #static{position:absolute;inset:0;z-index:6;pointer-events:none;opacity:0;}
  #radiocard{position:absolute;inset:0;z-index:5;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,#12141f 0%,#000 75%);}
  #radiocard .box{border:2px solid var(--accent);padding:26px 40px;text-align:center;box-shadow:0 0 40px -10px var(--accent);}
  #radiocard .onair{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:26px;letter-spacing:6px;color:var(--accent);}
  #radiocard .rtitle{font-family:'Inter',system-ui,sans-serif;font-size:19px;color:var(--dim);margin-top:10px;max-width:60vw;}

  #scan{position:absolute;inset:0;pointer-events:none;z-index:90;background:repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 1px,transparent 1px 3px);mix-blend-mode:multiply;}

  #guide{flex:1 1 45%;min-height:0;display:flex;flex-direction:column;background:linear-gradient(180deg,var(--panel),var(--void));border-top:3px solid var(--accent);}
  #ticker{flex:0 0 32px;display:flex;align-items:center;overflow:hidden;background:#000;border-bottom:2px solid var(--line);}
  #ticker .reel{display:inline-block;white-space:nowrap;font-family:'Inter',system-ui,sans-serif;font-size:21px;color:var(--accent);padding-left:100%;animation:crawl 30s linear infinite;}
  @keyframes crawl{to{transform:translateX(-100%);}}
  @media (prefers-reduced-motion:reduce){#ticker .reel{animation:none;padding-left:12px;}}

  #timebar{flex:0 0 36px;display:grid;grid-template-columns:160px 1fr 1fr 1fr;align-items:center;background:#000;border-bottom:1px solid var(--line);}
  #timebar div{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-weight:500;font-size:14px;color:var(--accent);letter-spacing:3px;padding-left:10px;text-transform:uppercase;}
  #timebar div:first-child{font-family:'Inter',system-ui,sans-serif;font-size:18px;color:var(--dim);letter-spacing:1px;}

  #grid{flex:1;overflow:hidden;position:relative;}
  #rows{position:absolute;left:0;right:0;top:0;will-change:transform;}
  .row{display:grid;grid-template-columns:160px 1fr 1fr 1fr;min-height:60px;border-bottom:1px solid var(--line);cursor:pointer;}
  .row:hover{background:rgba(255,255,255,.04);}
  .row.tuned .slot:nth-child(2){background:color-mix(in srgb, var(--accent) 20%, transparent);box-shadow:inset 4px 0 0 var(--accent);}
  .row.tuned .slot:nth-child(2) em{background:var(--accent);color:#000;padding:0 7px;border-radius:3px;width:max-content;font-weight:700;}
  .row.tuned .slot:nth-child(2) i{color:#fff;}
  .ch{display:flex;flex-direction:column;justify-content:center;padding:4px 12px;background:rgba(255,255,255,.03);border-left:4px solid var(--accent);transition:background .15s;}
  .row:hover .ch,.row.tuned .ch{background:var(--accent);}
  .row:hover .ch b,.row.tuned .ch b,.row:hover .ch span,.row.tuned .ch span{color:#000;}
  .ch b{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:15px;line-height:1.15;color:var(--text);}
  .ch span{font-size:12px;letter-spacing:2px;color:var(--dim);text-transform:uppercase;}
  .slot{display:flex;flex-direction:column;justify-content:center;padding:4px 12px;overflow:hidden;border-left:1px solid var(--line);}
  .slot em{font-style:normal;font-family:'Inter',system-ui,sans-serif;font-size:14px;color:var(--accent);}
  .slot i{font-style:normal;font-size:17px;font-weight:500;line-height:1.15;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}

  #controls{flex:0 0 46px;display:flex;background:#000;border-top:2px solid var(--accent);}
  #controls button{flex:1;background:#000;color:var(--accent);border:0;border-right:1px solid var(--line);font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:13px;letter-spacing:2px;cursor:pointer;}
  #controls button:hover,#controls button:focus-visible{background:var(--accent);color:#000;outline:none;}
  #controls button:last-child{border-right:0;}

  #tv.tuned #guide{flex:0 0 0;overflow:hidden;border:0;}
  #tv.tuned #ticker,#tv.tuned #timebar{display:none;}

  #stats{display:none;position:absolute;inset:6% 8%;z-index:95;background:#000;border:2px solid var(--accent);color:var(--text);font-family:'Inter',system-ui,sans-serif;padding:18px;overflow:auto;}
  #stats h3{color:var(--accent);letter-spacing:3px;margin-bottom:10px;font-size:24px;font-family:'Barlow Condensed',Arial Narrow,sans-serif;}
  #stats table{width:100%;border-collapse:collapse;font-size:19px;}
  #stats td{padding:3px 8px;border-bottom:1px solid var(--line);}
  #stats td:nth-child(2),#stats td:nth-child(3){text-align:right;color:var(--accent);}
  #stats .tot td{color:var(--accent);border-top:2px solid var(--accent);font-size:22px;}
  #stats p{margin-top:10px;font-size:16px;color:var(--dim);}

  @media (max-width:640px){
    #timebar{grid-template-columns:104px 1fr 1fr;}
    #timebar div:nth-child(4){display:none;}
    .row{grid-template-columns:104px 1fr 1fr;}
    .row .slot:nth-child(4){display:none;}
    .ch b{font-size:12px;} .slot i{font-size:15px;}
    #osd{font-size:18px;} #clock{font-size:21px;} #nowbar{font-size:15px;}
  }
  /* Turn-your-phone prompt. Only ever shown on a small screen held upright. */
  #rotate{position:fixed;inset:0;z-index:10000;display:none;flex-direction:column;align-items:center;
    justify-content:center;gap:22px;background:var(--void);color:var(--text);text-align:center;padding:34px;}
  #rotate.on{display:flex;}
  #rotate .phone{width:66px;height:108px;border:3px solid var(--accent);border-radius:12px;flex:none;
    animation:ntvtilt 2s ease-in-out infinite;}
  @keyframes ntvtilt{0%,50%{transform:rotate(0deg)}70%,100%{transform:rotate(-90deg)}}
  @media (prefers-reduced-motion:reduce){#rotate .phone{animation:none;transform:rotate(-90deg)}}
  #rotate h3{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:clamp(17px,5.2vw,24px);letter-spacing:3px;margin:0;}
  #rotate p{font-family:'Inter',system-ui,sans-serif;font-size:17px;letter-spacing:1px;color:var(--dim);margin:0;max-width:30ch;}
  #rotate .btns{display:flex;flex-direction:column;gap:10px;width:min(280px,80vw);}
  #rotate button{font-family:'Barlow Condensed',Arial Narrow,sans-serif;font-size:13px;letter-spacing:2px;padding:13px 0;
    border-radius:999px;cursor:pointer;border:2px solid var(--accent);}
  #rotate .go{background:var(--accent);color:#000;}
  #rotate .skip{background:transparent;color:var(--dim);border-color:var(--line);}
  #rotate .ios{font-family:'Inter',system-ui,sans-serif;font-size:15px;color:var(--dim);max-width:32ch;line-height:1.5;}
  #rotate .ios b{color:var(--accent);font-weight:400;}
  #rotate .steps{font-family:'Inter',system-ui,sans-serif;font-size:16px;color:var(--dim);line-height:1.7;text-align:left;max-width:32ch;}
  #rotate .steps b{color:var(--text);font-weight:400;}
  #rotate .share{display:inline-block;width:13px;height:13px;border:2px solid var(--accent);border-bottom:0;
    border-radius:3px 3px 0 0;position:relative;vertical-align:-2px;margin:0 2px;}
  #rotate .share:after{content:'';position:absolute;left:3.5px;top:-7px;width:2px;height:9px;background:var(--accent);}
  #rotate .sub{font-family:'Inter',system-ui,sans-serif;font-size:15px;color:var(--dim);letter-spacing:1px;}

  /* Seven words will not fit across a phone -- "SOUND: ON" alone wants about
     twice the width a 375px screen can give a seventh of. Each control carries
     both a word and an icon; the word shows where there is room, the icon
     where there is not. */
  #controls button{display:flex;align-items:center;justify-content:center;gap:6px;}
  #controls .i{width:20px;height:20px;display:none;flex:none;}
  #controls #btnMute .i.off{display:none;}
  #controls.muted #btnMute .i.on{display:none;}

  /* Nothing told anyone the listings were behind a button, so the first time a
     channel is tuned we say so once, then never again. */
  #hint{position:absolute;right:10px;bottom:calc(100% + 10px);max-width:min(320px,88vw);
    background:var(--accent);color:#000;font-family:'Inter',system-ui,sans-serif;font-size:16px;
    letter-spacing:.5px;padding:8px 14px;border-radius:8px;box-shadow:0 6px 22px rgba(0,0,0,.5);
    opacity:0;transform:translateY(6px);transition:opacity .3s ease,transform .3s ease;
    pointer-events:none;z-index:9;}
  #hint b{font-weight:400;letter-spacing:1px;}
  #hint:after{content:"";position:absolute;right:26px;top:100%;border:7px solid transparent;border-top-color:var(--accent);}
  #hint.on{opacity:1;transform:translateY(0);}

  /* The video was sizing #screen instead of the other way round: height:100%
     inside a flex item with indefinite height falls back to the video's own
     intrinsic height, so #screen grew to 1170px of a 1288px box and squeezed
     the guide to 72px -- with 15 listings crammed inside it. On a wider screen
     it pushed the guide AND the control bar below the fold, where the page
     lock made them unreachable: no guide, no channel buttons. Taking the video
     out of flow means #screen keeps its 55% share and everything stays on
     screen at every width. */
  #screen{overflow:hidden;}
  #screen video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;}
  #tv{min-height:0;}

  /* ---------- Cinema layout: phones, tablets, and any short window ----------
     The old split gave the picture 55% of the height with the guide taking 45%
     and a control bar under it. On a phone held sideways (about 375px tall)
     that guaranteed scrolling and left the page showing through underneath.
     Here the picture fills the whole box, the guide slides up over it only
     when asked, and the controls float on the video and get out of the way. */
  #btnGuide{display:none;}
  @media (max-width:900px), (max-height:600px){
    :host{height:100svh;min-height:0;}
    /* height:100% stops resolving once every child of #tv is absolutely
       positioned -- #tv collapsed to 0 and the picture vanished, leaving only
       the guide's text strip. Pin it to the viewport instead. */
    #tv{height:100svh;position:absolute;inset:0;}
    #screen{position:absolute;inset:0;flex:none;z-index:1;}
    #guide{position:absolute;left:0;right:0;bottom:0;top:auto;height:64%;z-index:3;flex:none;
      transform:translateY(101%);transition:transform .24s cubic-bezier(.2,.8,.2,1);
      border-top:3px solid var(--accent);padding-bottom:54px;}
    #tv.guideon #guide{transform:translateY(0);}
    #controls{position:absolute;left:0;right:0;bottom:0;z-index:4;flex:none;height:54px;
      background:rgba(0,0,0,.66);backdrop-filter:blur(8px);border-top:1px solid rgba(255,216,77,.4);
      transition:opacity .28s ease,transform .28s ease;}
    #controls button{background:transparent;font-size:15px;letter-spacing:1.5px;}
    #controls .t{display:none;}
    #controls .i{display:block;}
    #controls #btnMute .i.on{display:block;}
    #controls.muted #btnMute .i.on{display:none;}
    #controls.muted #btnMute .i.off{display:block;}
    #btnGuide{display:block;}
    #btnReload{font-size:13px;}
    #btnFull{display:none;}          /* rotating already fills it -- nothing to teach */
    #tv.guideon #btnGuide{color:#000;background:var(--accent);}
    /* Idle: the controls and the now-playing strip fade off the picture. */
    #tv.idle #controls{opacity:0;transform:translateY(100%);pointer-events:none;}
    #tv.idle #nowbar,#tv.idle #clock,#tv.idle #menuchip{opacity:0;}
    #nowbar,#clock,#menuchip{transition:opacity .28s ease;}
    /* Bigger type -- the old sizes were unreadable at arm's length. */
    #nowbar{font-size:19px;padding:30px 14px 10px;}
    #clock{font-size:22px;}
    .ch b{font-size:15px;} .slot i{font-size:17px;} .slot em{font-size:15px;}
    #ticker{font-size:17px;}
    #rotate h3{font-size:26px;} #rotate p{font-size:19px;}
    #rotate .steps{font-size:18px;} #rotate button{font-size:15px;padding:15px 0;}
    #rotate .sub{font-size:16px;}
  }

`;
const NEWTV_HTML = String.raw`



<!-- ================= PORTAL ================= -->
<div id="portal">
  <div class="brand">NEW&nbsp;TV</div>
  <div class="tag">FREE TV. FOREVER.</div>
  <div class="row" id="toprow">
    <button class="megabtn ad" data-pick="adtv"><h2>AD TV</h2><p>All commercials. By decade, subject, product, and brand.</p></button>
    <button class="megabtn tv" data-pick="tvtv"><h2>TV TV</h2><p>Actual television. Twelve networks of it.</p></button>
  </div>
  <div id="subnets"></div>
  <button id="back">&larr; BACK</button>
  <div id="sponsorbar"></div>
</div>

<!-- ================= TV ================= -->
<div id="tv">
  <div id="screen">
    <video id="vid" playsinline preload="auto"></video>
    <div id="radiocard"><div class="box"><div class="onair">ON AIR</div><div class="rtitle" id="radiotitle"></div></div></div>
    <button id="menuchip" title="Back to menu">≡ MENU</button>
    <div id="osd"></div>
    <div id="clock"></div>
    <div id="nowbar"></div>
    <canvas id="static"></canvas>
  </div>
  <div id="guide">
    <div id="netstrip"></div>
    <div id="ticker"><span class="reel" id="tickertext"></span></div>
    <div id="timebar">
      <div id="guidedate"></div><div>On now</div><div>Next</div><div>Later</div>
    </div>
    <div id="grid"><div id="rows"></div></div>
  </div>
  <div id="controls">
    <button id="btnDown" aria-label="Channel down"><span class="t">CH &minus;</span><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></button>
    <button id="btnUp" aria-label="Channel up"><span class="t">CH +</span><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>
    <button id="btnGuide" aria-label="Guide"><span class="t">GUIDE</span><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/></svg></button>
    <button id="btnReload" aria-label="Get the latest version" title="Get the latest version"><span class="t">UPDATE</span><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/></svg></button>
    <button id="btnFull" aria-label="Fullscreen"><span class="t">FULL</span><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg></button>
    <button id="btnMute" aria-label="Sound"><span class="t">SOUND: ON</span><svg class="i on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg><svg class="i off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m17 9 4 6M21 9l-4 6"/></svg></button>
    <div id="hint"><b>TAP GUIDE</b> for the channel listings</div>
  </div>
</div>
<div id="rotate">
  <div class="phone"></div>
  <h3 id="rotTitle">TURN YOUR PHONE</h3>
  <p id="rotBody">NEW TV is a widescreen. Rotate for the full picture.</p>
  <div class="steps" id="rotSteps" hidden></div>
  <div class="btns">
    <button class="go" id="rotFull">GO FULLSCREEN</button>
    <button class="skip" id="rotSkip">WATCH ANYWAY</button>
  </div>
  <div class="sub" id="rotSub"></div>
</div>
<div id="stats"></div>
<div id="scan"></div>`;

class NewTvPortal extends HTMLElement {
  disconnectedCallback() {
    /* Put the site's own icons back when leaving /newtv -- Wix is a single-page
       app, so the head is never reloaded on navigation. */
    if (this._faviconRestore) { try { this._faviconRestore(); } catch (e) {} this._faviconRestore = null; }
    if (window.__ntvTouchRestore) { try { window.__ntvTouchRestore(); } catch (e) {} window.__ntvTouchRestore = null; }
    if (this._pageLock) { try { this._pageLock(); } catch (e) {} this._pageLock = null; }
  }

  connectedCallback() {
    if (this._booted) return;
    this._booted = true;
    /* Wix puts min-height:100% on the component from its own stylesheet, and a
       document-level rule beats :host -- so the host computed to height 0 and
       the whole portal collapsed to an invisible strip (found live 2026-08-31).
       Inline + !important is the only thing that outranks it. */
    this.style.setProperty('display', 'block', 'important');
    this.style.setProperty('width', '100%', 'important');
    this.style.setProperty('height', '100%', 'important');
    this.style.setProperty('min-height', '100svh', 'important');
    ensureFonts();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + NEWTV_CSS + '</style>' + NEWTV_HTML;
    const host = this;
    const $id = (id) => root.getElementById(id);

    // Scope keyboard control to this element: only while it has focus within,
    // and never while the visitor is typing in a field elsewhere on the page.
    const onKey = (handler) => {
      document.addEventListener('keydown', (e) => {
        /* The old guard required focus inside the element, so none of the
           shortcuts worked until you had clicked the TV -- press S on a freshly
           loaded page and nothing happened. Treat "nothing on the page is
           focused" as ours too: body and documentElement mean no other widget
           is claiming the keyboard. Anything genuinely focused elsewhere still
           wins, and typing is still never intercepted. */
        const ae = document.activeElement;
        const idle = !ae || ae === document.body || ae === document.documentElement;
        if (!idle && !host.contains(ae) && root.activeElement === null) return;
        const t = e.composedPath()[0];
        if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || '')) return;
        handler(e);
      });
    };
    this.setAttribute('tabindex', '0');

    try {
      {
        /* =====================================================================
           NEW TV v2 — the portal.
           12 networks, ~70 channels, one broadcast engine, dayparted like real
           television: the portal recommends a network based on the actual clock
           (Saturday morning = cartoons; 8pm = prime time crime; 2am = insomnia
           theater). All content streams from the Internet Archive.
        
           BUSINESS WIRING (edit CONFIG):
           - sponsorUrl: where "SPONSOR A CHANNEL" and sponsor credits link
             (point at your CMS product page).
           - SPONSORS: paid sponsors rotate through the ticker + portal footer.
           - Viewer counts are intentionally NOT displayed or simulated. Wire
             real analytics first (see NEWTV-BUILD-SPEC.md), then surface them.
           ===================================================================== */
        const CONFIG={
          sponsorUrl:"https://www.jnoirbranding.com/portaltv-sponsor",
          BLOCKLIST:[ // archive item identifiers to never air, on any channel
          ],
          SPONSORS:[ // {name, url} — paid placements go here
            {name:"YOUR BRAND HERE — sponsor a channel", url:"https://www.jnoirbranding.com/portaltv-sponsor"}
          ]
        };
        
        const NETWORKS={
        /* ============ AD TV — subjects, like the TV side ============ */
        addecades:{label:"THE DECADES",accent:"#FFD84D",junk:/\b(movie|film|feature|episode|mtv|concert|music videos?|full)\b/i,maxLen:3900,tick:"TIME TRAVEL BY COMMERCIAL \u2022 1950 TO 1999, ONE SPOT AT A TIME",blurb:"Time-travel by commercial, 1950\u20131999.",channels:[
          {num:2,call:"50s",name:"THE FIFTIES",type:"query",est:90,q:'collection:(classic_tv_commercials OR classic_tv_commercials_emperor) AND mediatype:(movies) AND year:[1950 TO 1959]'},
          {num:3,call:"60s",name:"THE SIXTIES",type:"query",est:90,q:'collection:(classic_tv_commercials OR classic_tv_commercials_emperor) AND mediatype:(movies) AND year:[1960 TO 1969]'},
          {num:4,call:"70s",name:"THE SEVENTIES",type:"query",est:90,q:'collection:(classic_tv_commercials OR classic_tv_commercials_emperor) AND mediatype:(movies) AND year:[1970 TO 1979]'},
          {num:5,call:"80s",name:"THE EIGHTIES",type:"query",est:90,q:'collection:(classic_tv_commercials OR classic_tv_commercials_emperor) AND mediatype:(movies) AND year:[1980 TO 1989]'},
          {num:6,call:"90s",name:"THE NINETIES",type:"query",est:90,q:'collection:(classic_tv_commercials OR classic_tv_commercials_emperor) AND mediatype:(movies) AND year:[1990 TO 1999]',not:/\b(50|60|70|80)'?s\b|fifties|sixties|seventies|eighties/i},
          {num:7,call:"REEL",name:"THE VAULT",type:"items",ids:["ClassicT1948","ClassicT1948_2","ClassicT1948_5","ClassicT1948_6","202275_Television_Commercials_Classic_Comedy","ityppBPDzduiKR0SK2M5qMno72RwAT"]},
          {num:8,call:"CTVC",name:"SPOT CHECK",type:"items",ids:["ctvc"]}
        ]},
        adkitchen:{label:"KITCHEN & PANTRY",accent:"#FF9F1C",junk:/\b(movie|film|episode|mtv|concert|full)\b/i,maxLen:3900,tick:"EVERYTHING YOU ATE \u2022 COFFEE \u00b7 SODA \u00b7 CEREAL \u00b7 SNACKS \u00b7 BURGERS",blurb:"Coffee, soda, cereal, snacks \u2014 every brand a channel.",
          adCategory:/coffee|folgers|sanka|maxwell|brim|yuban|cola|pepsi|coke|7 ?up|squirt|soda|kool|tang|hawaiian|drink|beverage|cereal|grape|raisin|pebbles|honeycomb|bran|krisp|toasties|alpha|oats|jell|kraft|crisco|duncan|pringle|cracker|cookie|candy|gum|snack|soup|dinner|rice|noodle|cake|pudding|peanut|skippy|jif|jelly|jam|butter/,
          extras:[{call:"BURG",name:"BURGER TV",type:"query",est:120,q:'(mcdonalds OR "burger king" OR wendys OR "burger chef") AND commercial AND mediatype:(movies)',must:/burger|mcdonald|wendy|whopper|big mac/i},
            {call:"SODA",name:"SODA RUSH",type:"query",est:120,q:'(pepsi OR "coca cola" OR "7up" OR "dr pepper") AND commercial AND mediatype:(movies)',must:/pepsi|coke|coca|7.?up|dr.? ?pepper|soda|cola/i},
            {call:"CRNL",name:"CEREAL AISLE",type:"query",est:120,q:'cereal AND commercial AND mediatype:(movies)',must:/cereal|flakes|cheerio|krisp|bran|oat|frosted|pebbles|honeycomb|toasties|wheaties/i}]},
        adhome:{label:"HOUSEHOLD",accent:"#7EE0D0",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"CLEANER THAN CLEAN \u2022 SOAPS \u00b7 SUDS \u00b7 THE ALL-VACUUM CHANNEL",blurb:"Soap, suds, and ALL VACUUM TV.",
          adCategory:/soap|ivory|zest|camay|dawn|joy|cascade|tide|bold|dash|downy|comet|clean|spic|lava|era|gain|cheer|detergent|wax|polish/,
          extras:[{call:"VAC",name:"ALL VACUUM TV",type:"query",est:300,q:'(vacuum OR hoover OR eureka) AND commercial AND mediatype:(movies)',must:/vacuum|hoover|eureka|kirby/i}]},
        adbath:{label:"MEDICINE CABINET",accent:"#8FD3FF",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"PLOP PLOP FIZZ FIZZ \u2022 TOOTHPASTE \u00b7 ASPIRIN \u00b7 SHAMPOO",blurb:"Toothpaste to headache pills.",
          adCategory:/crest|scope|secret|prell|head|vicks|nyquil|formula|schick|gleem|sure|pepto|rolaids|anacin|aspirin|shampoo|toothpaste|deodorant|razor|blades/,
          extras:[{call:"DRUG",name:"DRUGSTORE RUN",type:"query",est:120,q:'(toothpaste OR aspirin OR shampoo OR deodorant) AND commercial AND mediatype:(movies)',must:/toothpaste|aspirin|shampoo|deodorant|crest|colgate|bayer|anacin|bufferin|excedrin/i}]},
        adgarage:{label:"THE GARAGE",accent:"#A9C7E8",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"SEE THE USA \u2022 DETROIT IRON \u00b7 JET SET",blurb:"Detroit iron and the jet set.",
          adCategory:/chevrolet|ford|dodge|plymouth|pontiac|cadillac|oldsmobile|buick|chrysler|amc|datsun|toyota|volkswagen|renault|motor|tire|gasoline|oil/,
          extras:[{call:"FLY",name:"JET SET",type:"query",est:120,q:'(airline OR "pan am" OR twa OR braniff) AND commercial AND mediatype:(movies)',must:/airline|airway|pan am|twa|braniff|united|delta|american|fly|jet/i},
            {call:"LOT",name:"THE CAR LOT",type:"query",est:120,q:'(chevrolet OR ford OR dodge OR plymouth) AND commercial AND mediatype:(movies)',must:/chev|ford|dodge|plymouth|pontiac|buick|car|truck|motor/i}]},
        adtoys:{label:"TOY CHEST",accent:"#FF7AD9",junk:/\b(movie|film|episode|full|review|unboxing)\b/i,maxLen:3900,tick:"BATTERIES NOT INCLUDED \u2022 EVERY TOY BRAND GETS A CHANNEL",blurb:"Every toy brand gets a channel.",
          adCategory:/toy|hasbro|mattel|kenner|fisher|game/,
          extras:[{call:"TOYQ",name:"TOY AISLE 80s-90s",type:"query",est:120,q:'toy AND commercial AND (1980s OR 1990s) AND mediatype:(movies)',must:/toy|hasbro|mattel|kenner|barbie|g\.?i\.? ?joe|nerf|lego|transformers|he-man/i}]},
        adpets:{label:"PET SHOP",accent:"#B7F397",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"CHOW TIME \u2022 DOG FOOD \u00b7 CAT FOOD \u00b7 GRAVY TRAIN FOREVER",blurb:"Dog food, cat food, Gravy Train forever.",
          adCategory:/gaines|gravy|cycle|purina|alpo|chow|kibble|meow|pet food|dog|cat/,
          extras:[{call:"CHOW",name:"CHOW LINE",type:"query",est:120,q:'("dog food" OR "cat food") AND commercial AND mediatype:(movies)',must:/dog|cat|puppy|kitten|chow|pet|purina|alpo|gaines|friskies|kibble/i}]},
        advice:{label:"VICE TV",accent:"#D14054",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"THE ADS THEY BANNED \u2022 CIGARETTES (PRE-1971) \u00b7 LAST CALL",blurb:"Cigarette ads (pre-ban) and beer o'clock.",channels:[
          {num:2,call:"SMOK",name:"SMOKE RINGS",type:"query",est:120,q:'(cigarette OR winston OR marlboro OR "lucky strike") AND commercial AND mediatype:(movies) AND year:[1948 TO 1971]',must:/cigarette|winston|marlboro|lucky|camel|chesterfield|salem|kool|tareyton|smok|tobacco/i},
          {num:3,call:"BEER",name:"LAST CALL",type:"query",est:120,q:'(beer OR schlitz OR hamms OR budweiser) AND commercial AND mediatype:(movies) AND year:[1948 TO 1990]',must:/beer|schlitz|hamm|budweiser|miller|pabst|blatz|falstaff|brew|lager|ale\b/i}
        ]},
        adholiday:{label:"HOLIDAY SPOTS",accent:"#FF5E5E",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"EVERY DAY IS DECEMBER \u2022 CHRISTMAS SPOTS \u00b7 SPOOKY SPOTS",blurb:"Christmas ads year-round. Spooky spots too.",channels:[
          {num:2,call:"XMAS",name:"CHRISTMAS SPOTS",type:"query",est:120,q:'(christmas OR holiday) AND commercials AND mediatype:(movies)',must:/christmas|holiday|santa|xmas/i},
          {num:3,call:"HLWN",name:"SPOOKY SPOTS",type:"query",est:120,q:'halloween AND commercial AND mediatype:(movies)',must:/halloween|spooky|monster|haunt/i}
        ]},
        adtube:{label:"TUBE JUNK",accent:"#C0C6D4",junk:/\b(movie|film|feature|episode|mtv|concert|full)\b/i,maxLen:3900,tick:"THE STUFF BETWEEN THE STUFF \u2022 PROMOS \u00b7 INFOMERCIALS",blurb:"Network promos and 'but wait, there's more.'",channels:[
          {num:2,call:"PRMO",name:"PROMO LAND",type:"query",est:600,q:'title:(promos) AND mediatype:(movies)'},
          {num:3,call:"ASTV",name:"AS SEEN ON TV",type:"query",est:1200,q:'(infomercial OR "as seen on tv") AND mediatype:(movies)'},
          /* 335 items with machine-perfect filenames -- the cleanest metadata in the project */
          {num:4,call:"CNSL",name:"CONSOLE WARS",type:"query",est:60,q:'collection:(computercommercials)'},
          /* the furniture channel: sign-ons, sign-offs, the things between the things */
          {num:14,call:"IDNT",name:"STATION IDENT",type:"query",est:45,q:'(title:("station identification") OR title:("station id") OR title:("sign off")) AND mediatype:(movies)'}
        ]},
        adbrands:{label:"EVERY BRAND",accent:"#FFD84D",junk:/\b(movie|film|episode|full)\b/i,maxLen:3900,tick:"ONE CHANNEL PER BRAND \u2022 THE WHOLE DUKE ADVIEWS LIBRARY",blurb:"One channel per brand. The whole library.",adBrandsAll:true},
        /* ============ TV TV ============ */
        crime:{label:"CRIME TV",accent:"#FF2E4C",junk:/\b(trailer|slideshow|review|commentary|reaction)\b/i,maxLen:8000,tick:"CRIME, AROUND THE CLOCK \u2022 NOIR \u00b7 DRAGNET \u00b7 DECOY \u00b7 FEDERAL FILES",blurb:"Noir, Dragnet, Decoy, FBI files. Lacey's network.",channels:[
          {num:2,call:"NOIR",name:"NOIR NIGHTS",type:"query",est:4800,q:'"film noir" AND mediatype:(movies) AND year:[1940 TO 1959]'},
          {num:3,call:"DRAG",name:"DRAGNET",type:"query",est:1600,q:'title:(dragnet) AND mediatype:(movies) AND year:[1950 TO 1959]'},
          {num:4,call:"RCKT",name:"RACKET SQUAD",type:"query",est:1600,q:'title:("racket squad") AND mediatype:(movies)'},
          {num:5,call:"DCOY",name:"DECOY",type:"query",est:1600,q:'title:(decoy) AND mediatype:(movies) AND year:[1957 TO 1959]'},
          {num:6,call:"HOLM",name:"BAKER STREET",type:"query",est:2400,q:'title:("sherlock holmes") AND mediatype:(movies) AND year:[1930 TO 1960]'},
          {num:7,call:"GANG",name:"GANG BUSTERS",type:"query",est:1600,q:'title:("gang busters") AND mediatype:(movies)'},
          {num:8,call:"NRTH",name:"MR & MRS NORTH",type:"query",est:1600,q:'title:("mr. and mrs. north" OR "mr and mrs north") AND mediatype:(movies)'},
          {num:9,call:"PDEF",name:"PUBLIC DEFENDER",type:"query",est:1600,q:'title:("public defender") AND mediatype:(movies) AND year:[1950 TO 1960]'},
          {num:10,call:"WHO",name:"WHODUNIT CINEMA",type:"query",est:4200,q:'(murder OR mystery) AND subject:(crime OR mystery) AND mediatype:(movies) AND year:[1931 TO 1964]'},
          {num:11,call:"FILE",name:"TRUE CRIME FILES",type:"query",est:1200,q:'crime AND collection:(prelinger)'},
          {num:12,call:"KPRC",name:"PRECINCT RADIO",type:"query",est:1700,audio:true,q:'collection:(oldtimeradio) AND (crime OR mystery OR suspense OR detective) AND mediatype:(audio)'},
          {num:13,call:"FBI",name:"FEDERAL FILES",type:"query",est:1500,q:'creator:("federal bureau of investigation") AND mediatype:(movies)'},
          {num:14,call:"BLKI",name:"BOSTON BLACKIE",type:"query",est:1600,q:'title:("boston blackie") AND mediatype:(movies)'},
          {num:15,call:"TRCY",name:"DICK TRACY",type:"query",est:1600,q:'title:("dick tracy") AND mediatype:(movies) AND year:[1937 TO 1952]'},
          {num:16,call:"SUSP",name:"SUSPENSE",type:"query",est:1600,q:'title:(suspense) AND mediatype:(movies) AND year:[1949 TO 1954]'}
        ]},
        west:{label:"WESTERNS TV",accent:"#E07B39",junk:/\b(trailer|slideshow|review|reaction)\b/i,maxLen:8000,tick:"SADDLE UP \u2022 LONE RANGER \u00b7 CISCO KID \u00b7 ANNIE OAKLEY \u00b7 WESTERN CINEMA",blurb:"Lone Ranger to B-westerns.",channels:[
          {num:2,call:"LONE",name:"LONE RANGER",type:"query",est:1600,q:'title:("lone ranger") AND mediatype:(movies) AND year:[1949 TO 1957]'},
          {num:3,call:"CSCO",name:"CISCO KID",type:"query",est:1600,q:'title:("cisco kid") AND mediatype:(movies)'},
          {num:4,call:"ANNE",name:"ANNIE OAKLEY",type:"query",est:1600,q:'title:("annie oakley") AND mediatype:(movies) AND year:[1954 TO 1957]'},

          {num:6,call:"ROY",name:"ROY ROGERS",type:"query",est:1600,q:'title:("roy rogers") AND mediatype:(movies)'},
          {num:7,call:"DUST",name:"WESTERN CINEMA",type:"query",est:4500,q:'subject:(western) AND mediatype:(movies) AND year:[1930 TO 1965]'},
          {num:8,call:"CCHS",name:"SHERIFF OF COCHISE",type:"query",est:1600,q:'title:("sheriff of cochise") AND mediatype:(movies)'},
          {num:9,call:"AUTR",name:"GENE AUTRY",type:"query",est:3600,q:'title:("gene autry") AND mediatype:(movies) AND year:[1934 TO 1953]'},
          {num:10,call:"BEAN",name:"JUDGE ROY BEAN",type:"query",est:1600,q:'title:("judge roy bean") AND mediatype:(movies) AND year:[1955 TO 1957]'}
        ]},
        toons:{label:"CARTOONS TV",accent:"#C93BD4",junk:/\b(trailer|review|reaction)\b/i,maxLen:5400,tick:"SATURDAY MORNING, EVERY MORNING \u2022 FLEISCHER SUPERMAN \u00b7 BETTY BOOP \u00b7 POPEYE \u00b7 HOWDY DOODY",blurb:"Fleischer Superman, Betty Boop, Popeye, Howdy Doody.",channels:[
          {num:2,call:"SUPR",name:"SUPER TOONS",type:"query",est:600,q:'title:(superman) AND mediatype:(movies) AND year:[1941 TO 1943]'},
          {num:3,call:"BOOP",name:"BETTY BOOP",type:"query",est:480,q:'title:("betty boop") AND mediatype:(movies)'},
          {num:4,call:"POPI",name:"POPEYE",type:"query",est:480,q:'title:(popeye) AND mediatype:(movies) AND year:[1933 TO 1957]'},
          {num:5,call:"FELX",name:"FELIX & FRIENDS",type:"query",est:480,q:'title:("felix the cat") AND mediatype:(movies)'},
          {num:6,call:"HWDY",name:"HOWDY DOODY",type:"query",est:1600,q:'title:("howdy doody") AND mediatype:(movies)'},
          {num:7,call:"TOON",name:"TOON VAULT",type:"query",est:480,q:'subject:(cartoons) AND mediatype:(movies) AND year:[1928 TO 1960]'},
          {num:8,call:"LULU",name:"LITTLE LULU",type:"query",est:480,q:'title:("little lulu") AND mediatype:(movies) AND year:[1943 TO 1949]'},
          {num:9,call:"CASP",name:"FRIENDLY GHOSTS",type:"query",est:480,q:'title:(casper) AND mediatype:(movies) AND year:[1945 TO 1959]'}
        ]},
        scifi:{label:"SCI-FI TV",accent:"#3CFF5A",junk:/\b(trailer|review|reaction)\b/i,maxLen:8000,tick:"FROM BEYOND THE STARS \u2022 ONE STEP BEYOND \u00b7 TALES OF TOMORROW \u00b7 FLASH GORDON",blurb:"Anthologies, serials, B-movie midnight.",channels:[
          {num:2,call:"STEP",name:"ONE STEP BEYOND",type:"query",est:1600,q:'title:("one step beyond") AND mediatype:(movies)'},
          {num:3,call:"TMRW",name:"TALES OF TOMORROW",type:"query",est:1600,q:'title:("tales of tomorrow") AND mediatype:(movies)'},
          {num:4,call:"FLSH",name:"FLASH GORDON",type:"query",est:1600,q:'title:("flash gordon") AND mediatype:(movies) AND year:[1936 TO 1955]'},
          {num:5,call:"BMOV",name:"B-MOVIE MIDNIGHT",type:"query",est:4800,q:'subject:("science fiction") AND mediatype:(movies) AND year:[1950 TO 1964]'},
          {num:6,call:"RCKY",name:"ROCKY JONES",type:"query",est:1600,q:'title:("rocky jones") AND mediatype:(movies)'},
          {num:7,call:"PTRL",name:"SPACE PATROL",type:"query",est:1600,q:'title:("space patrol") AND mediatype:(movies) AND year:[1950 TO 1955]'}
        ]},
        /* Federal work is the only material here that is bulletproof by statute --
           US government works were never eligible for copyright at all, which is a
           stronger position than expiry. Verified live: NASA 13,735, safety 743,
           social guidance 290, department store 167, civil defence 72, dental 55. */
        sam:{label:"UNCLE SAM",accent:"#7C9CC4",junk:/\b(trailer|review|reaction)\b/i,maxLen:5400,
          tick:"YOUR TAX DOLLARS AT WORK \u2022 MISSION CONTROL \u00b7 DUCK AND COVER \u00b7 HOW TO BEHAVE",
          blurb:"Government film. Rockets, fallout drills, and how to conduct yourself.",channels:[
          {num:2,call:"NASA",name:"MISSION CONTROL",type:"query",est:900,q:'collection:(nasa) AND mediatype:(movies)'},
          {num:3,call:"SAFE",name:"SAFETY FIRST",type:"query",est:900,q:'collection:(prelinger) AND (safety OR "driver education" OR hygiene) AND mediatype:(movies)'},
          {num:4,call:"BHAV",name:"HOW TO BEHAVE",type:"query",est:900,q:'collection:(prelinger) AND (etiquette OR manners OR "social guidance" OR dating) AND mediatype:(movies)'},
          {num:5,call:"FLOR",name:"THE SALES FLOOR",type:"query",est:900,q:'collection:(prelinger) AND ("department store" OR retail OR salesman) AND mediatype:(movies)'},
          {num:14,call:"DUCK",name:"DUCK AND COVER",type:"query",est:900,q:'collection:(prelinger) AND ("civil defense") AND mediatype:(movies)'},
          {num:15,call:"WIDE",name:"OPEN WIDE",type:"query",est:900,q:'collection:(prelinger) AND (dental OR dentist OR toothpaste) AND mediatype:(movies)'}
        ]},
        /* 14,980 items of hyper-local cable access that no other retro-TV project
           has touched. The strangest thing in the building. */
        locals:{label:"THE LOCALS",accent:"#9FBF8A",junk:/\b(trailer|review|reaction)\b/i,maxLen:7200,
          tick:"BROADCASTING FROM A ROOM SOMEWHERE \u2022 PUBLIC ACCESS \u00b7 STATION IDENT",
          blurb:"Cable access television, exactly as it went out.",channels:[
          {num:2,call:"PCTV",name:"PUBLIC ACCESS",type:"query",est:1800,q:'creator:("PCTV") AND mediatype:(movies)'},
          {num:3,call:"SIGN",name:"SIGN ON, SIGN OFF",type:"query",est:45,q:'(title:("sign off") OR title:("sign on") OR title:("station identification")) AND mediatype:(movies)'}
        ]},
        midnight:{label:"MIDNIGHT TV",accent:"#8A5CFF",junk:/\b(trailer|review|reaction)\b/i,maxLen:8000,tick:"DON'T WATCH ALONE \u2022 CREATURE FEATURE \u00b7 VINCENT PRICE \u00b7 TERROR RADIO",blurb:"Horror features, Vincent Price, terror radio.",channels:[
          {num:2,call:"CRTR",name:"CREATURE FEATURE",type:"query",est:4800,q:'subject:(horror) AND mediatype:(movies) AND year:[1930 TO 1968]'},
          {num:3,call:"HAUN",name:"HAUNTED CINEMA",type:"query",est:4800,q:'(haunted OR ghost OR zombie) AND mediatype:(movies) AND year:[1930 TO 1968] AND subject:(horror OR thriller)'},
          {num:4,call:"TERR",name:"TERROR RADIO",type:"query",est:1700,audio:true,q:'collection:(oldtimeradio) AND (horror OR "lights out" OR "inner sanctum") AND mediatype:(audio)'},
          {num:5,call:"PRCE",name:"VINCENT PRICE",type:"query",est:5000,q:'"vincent price" AND mediatype:(movies) AND year:[1948 TO 1965]'},
          {num:6,call:"POE",name:"EDGAR ALLAN POE",type:"query",est:4200,q:'"edgar allan poe" AND mediatype:(movies) AND year:[1928 TO 1965]'}
        ]},
        comedy:{label:"COMEDY TV",accent:"#FFB020",junk:/\b(trailer|review|reaction)\b/i,maxLen:8000,tick:"LAUGH TRACK INCLUDED \u2022 JACK BENNY \u00b7 GROUCHO \u00b7 BURNS & ALLEN \u00b7 OZZIE & HARRIET",blurb:"Jack Benny, Groucho, Burns and Allen, Ozzie and Harriet.",channels:[

          {num:3,call:"BENY",name:"JACK BENNY",type:"query",est:1600,q:'title:("jack benny") AND mediatype:(movies)'},
          {num:4,call:"BRNS",name:"BURNS & ALLEN",type:"query",est:1600,q:'title:("burns and allen") AND mediatype:(movies)'},
          {num:5,call:"GRCH",name:"YOU BET YOUR LIFE",type:"query",est:1600,q:'title:("you bet your life") AND mediatype:(movies)'},
          {num:6,call:"MRGE",name:"MY LITTLE MARGIE",type:"query",est:1600,q:'title:("my little margie") AND mediatype:(movies)'},
          {num:7,call:"OZZI",name:"OZZIE & HARRIET",type:"query",est:1600,q:'title:("ozzie and harriet") AND mediatype:(movies)'},

          {num:9,call:"TOPR",name:"TOPPER",type:"query",est:1600,q:'title:(topper) AND mediatype:(movies) AND year:[1953 TO 1956]'},
          {num:10,call:"ABCO",name:"ABBOTT & COSTELLO",type:"query",est:3600,q:'title:("abbott and costello") AND mediatype:(movies) AND year:[1948 TO 1956]'}
        ]},
        jukebox:{label:"JUKEBOX TV",accent:"#00E5FF",junk:/\b(trailer|review|reaction)\b/i,maxLen:5400,tick:"MUSIC TELEVISION, 40 YEARS BEFORE MTV \u2022 SOUNDIES \u00b7 TELESCRIPTIONS",blurb:"Soundies \u2014 proto music videos from the 1940s.",channels:[
          {num:2,call:"SNDS",name:"SOUNDIES",type:"query",est:200,q:'(soundies OR soundie) AND mediatype:(movies) AND year:[1940 TO 1947]'},
          {num:3,call:"TELE",name:"TELESCRIPTIONS",type:"query",est:200,q:'(snader OR telescriptions) AND mediatype:(movies)'},
          {num:4,call:"BAND",name:"BIG BAND STAND",type:"query",est:1200,q:'("big band" OR "swing music") AND mediatype:(movies) AND year:[1935 TO 1955]'},
          {num:5,call:"JAZZ",name:"JAZZ ON FILM",type:"query",est:1200,q:'jazz AND mediatype:(movies) AND year:[1929 TO 1959] AND subject:(music OR jazz)'}
        ]},
        history:{label:"HISTORY TV",accent:"#B8B8B8",junk:/\b(trailer|review|reaction)\b/i,maxLen:8000,tick:"AS IT HAPPENED \u2022 THE BIG PICTURE \u00b7 WHY WE FIGHT \u00b7 NEWSREELS",blurb:"Army's Big Picture, Capra's Why We Fight, newsreels.",channels:[
          {num:2,call:"BIGP",name:"THE BIG PICTURE",type:"query",est:1700,q:'title:("big picture") AND (army OR military) AND mediatype:(movies)'},
          {num:3,call:"WHY",name:"WHY WE FIGHT",type:"query",est:3200,q:'title:("why we fight") AND mediatype:(movies)'},
          {num:4,call:"NEWS",name:"NEWSREEL",type:"query",est:600,q:'(newsreel OR "universal newsreel") AND mediatype:(movies) AND year:[1929 TO 1967]'},
          {num:5,call:"SEA",name:"VICTORY AT SEA",type:"query",est:1600,q:'title:("victory at sea") AND mediatype:(movies)'},
          {num:6,call:"NASA",name:"THE SPACE RACE",type:"query",est:1500,q:'(nasa OR apollo OR mercury OR gemini) AND mediatype:(movies) AND year:[1958 TO 1975] AND (nasa)'}
        ]},
        school:{label:"SCHOOL TV",accent:"#4FA3FF",junk:/\b(trailer|review|reaction)\b/i,maxLen:5400,tick:"AFTER SCHOOL, ALL DAY \u2022 CIVICS \u00b7 ART CLASS \u00b7 SCIENCE LAB \u00b7 DUCK & COVER",blurb:"Civics, art class, science lab, duck & cover.",channels:[
          {num:2,call:"CIVX",name:"CIVICS CLASS",type:"query",est:900,q:'(government OR democracy OR citizenship) AND collection:(prelinger)'},
          {num:3,call:"TEEN",name:"AFTER SCHOOL",type:"query",est:900,q:'(teenagers OR dating OR manners OR "social guidance") AND collection:(prelinger)'},
          {num:4,call:"ART",name:"ART CLASS",type:"query",est:900,q:'("jon gnagy" OR "learn to draw" OR drawing) AND mediatype:(movies) AND year:[1946 TO 1965]'},
          {num:5,call:"LAB",name:"SCIENCE LAB",type:"query",est:900,q:'(science OR physics OR chemistry) AND collection:(prelinger)'},
          {num:6,call:"DUCK",name:"DUCK & COVER",type:"query",est:900,q:'("civil defense" OR "duck and cover") AND mediatype:(movies)'},
          {num:7,call:"DRVE",name:"DRIVER'S ED",type:"query",est:900,q:'("driver education" OR "safe driving" OR traffic) AND collection:(prelinger)'},
          {num:8,call:"HOME",name:"HOME EC",type:"query",est:900,q:'("home economics" OR cooking OR sewing) AND collection:(prelinger)'}
        ]},
        weird:{label:"WEIRD TV",accent:"#7CFFCB",junk:/\b(trailer|review|reaction)\b/i,maxLen:5400,tick:"THE STRANGEST FILMS EVER MADE FOR NORMAL REASONS \u2022 INDUSTRIAL \u00b7 HYGIENE \u00b7 ATOMIC AGE",blurb:"Industrial films, hygiene class, the atomic age.",channels:[
          {num:2,call:"INDL",name:"INDUSTRIAL ARTS",type:"query",est:1200,q:'(manufacturing OR industrial OR factory) AND collection:(prelinger)'},
          {num:3,call:"HYGN",name:"HYGIENE CLASS",type:"query",est:900,q:'(posture OR hygiene OR grooming) AND collection:(prelinger)'},
          {num:4,call:"ATOM",name:"ATOMIC AGE",type:"query",est:1000,q:'(atomic OR "atomic energy" OR nuclear) AND collection:(prelinger)'},
          {num:5,call:"SPND",name:"SPONSORED LIFE",type:"query",est:1200,q:'("sponsored film" OR "industrial film") AND mediatype:(movies) AND year:[1940 TO 1970]'},
          {num:6,call:"BELL",name:"THE PHONE COMPANY",type:"query",est:1200,q:'("bell system" OR telephone) AND collection:(prelinger)'}
        ]},
        movies:{label:"MOVIE TV",accent:"#F5E6C4",junk:/\b(trailer|review|reaction)\b/i,maxLen:8000,tick:"THE LATE SHOW, ALL DAY \u2022 SCREWBALL \u00b7 SILENTS \u00b7 CLIFFHANGER SERIALS",blurb:"Screwball comedies, silents, cliffhanger serials.",channels:[
          {num:2,call:"SCRW",name:"SCREWBALL",type:"query",est:5400,q:'title:("his girl friday" OR "my man godfrey" OR "nothing sacred" OR "meet john doe") AND mediatype:(movies)'},
          {num:3,call:"SLNT",name:"SILENT CINEMA",type:"query",est:4200,q:'subject:(silent) AND mediatype:(movies) AND year:[1915 TO 1929]'},
          {num:4,call:"CLIF",name:"CLIFFHANGERS",type:"query",est:1200,q:'(serial AND chapter) AND mediatype:(movies) AND year:[1936 TO 1956]'},
          {num:5,call:"MATN",name:"MATINEE",type:"query",est:4800,q:'subject:(comedy) AND mediatype:(movies) AND year:[1930 TO 1955]'},
          {num:6,call:"DRMA",name:"DRAMA NIGHT",type:"query",est:4800,q:'subject:(drama) AND mediatype:(movies) AND year:[1930 TO 1955]'}
        ]}
        };
        const AD_ORDER=["addecades","adkitchen","adhome","adbath","adgarage","adtoys","adpets","advice","adholiday","adtube","adbrands"];
        const SUBNET_ORDER=["crime","west","toons","scifi","midnight","comedy","jukebox","history","sam","locals","school","weird","movies"];
        const QUERY_ROWS=400, MAX_BRAND_CHANNELS=40;
        /* A brand becomes a channel only if it can carry one. Of the 240 AdViews
           brand sub-collections, seven have sixty or more spots and the rest run
           from one to fifty -- Gleem has exactly one. Thin brands are not deleted:
           their spots already play inside the network's ALL channel. They just
           stop occupying a number of their own. */
        const MIN_CH_ITEMS=30;
        const IS_TOUCH=matchMedia('(pointer:coarse)').matches;
        let NET=null, CHANNELS=[];
        let current=null, curIdx=0, osdTimer=null, tuneToken=0;
        
        const tv=$id('tv'), portal=$id('portal'),
              vid=$id('vid'), osd=$id('osd'),
              rows=$id('rows'), nowbar=$id('nowbar'),
              radiocard=$id('radiocard'), statsEl=$id('stats');
        
        /* ---------- helpers ---------- */
        function fmt(d){let h=d.getHours(),m=d.getMinutes(),ap=h>=12?'PM':'AM';h=h%12||12;
          return h+':'+String(m).padStart(2,'0')+' '+ap;}
        function fmtS(d){let h=d.getHours(),m=d.getMinutes(),s=d.getSeconds(),ap=h>=12?'PM':'AM';h=h%12||12;
          return h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+' '+ap;}
        function parseLen(v){ if(v==null)return 0; if(typeof v==='number')return v;
          if(/^[\d.]+$/.test(v))return parseFloat(v)||0;
          const p=String(v).split(':').map(Number);
          return p.some(isNaN)?0:p.reduce((a,b)=>a*60+b,0); }
        function cleanTitle(name,itemId){
          let t=decodeURIComponent(name).replace(/\.[a-z0-9]+$/i,'').replace(/[._]+/g,' ').replace(/\s+/g,' ').trim();
          if(itemId){ const idFrag=itemId.toLowerCase().replace(/[._-]+/g,' ');
            if(t.toLowerCase().startsWith(idFrag)) t=t.slice(idFrag.length).trim(); }
          t=t.replace(/\b(512kb|64kb|mp4|h264|ia)\b/gi,'').replace(/\s+/g,' ').trim();
          return (t.length>70?t.slice(0,67)+'…':t)||'Untitled';
        }
        function cache(key,val){ try{ if(val!==undefined){localStorage.setItem('ntv4_'+key,JSON.stringify({t:Date.now(),v:val}));return val;}
          const raw=localStorage.getItem('ntv4_'+key); if(!raw)return null;
          const o=JSON.parse(raw); return (Date.now()-o.t<6048e5)?o.v:null; }catch(e){return val===undefined?null:val;} }
        const GDATE=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'}).toUpperCase();
        setInterval(()=>{$id('clock').textContent=fmtS(new Date());},1000);
        
        
        /* ---------- sponsors ---------- */
        let sponsorIdx=0;
        function sponsorLine(){
          const s=CONFIG.SPONSORS[sponsorIdx%CONFIG.SPONSORS.length]; sponsorIdx++;
          return s?('TONIGHT\'S BROADCAST SPONSORED BY: '+s.name.toUpperCase()):'';
        }
        $id('sponsorbar').innerHTML=
          'Sponsored by: '+CONFIG.SPONSORS.map(s=>'<a href="'+s.url+'" target="_blank" rel="noopener">'+s.name+'</a>').join(' \u00b7 ')
          +' &nbsp;\u2022&nbsp; <a href="'+CONFIG.sponsorUrl+'" target="_blank" rel="noopener">ADOPT A CHANNEL \u2192</a>';
        
        /* ---------- portal ---------- */
        const subnetsEl=$id('subnets'), toprow=$id('toprow'),
              backBtn=$id('back');
        
        function showWall(order){
          if (host.__ntvToTop) host.__ntvToTop();
          toprow.style.display='none';
          subnetsEl.innerHTML=order.map(k=>{
            const n=NETWORKS[k];
            return '<button class="tile" data-net="'+k+'" style="--tint:'+n.accent+'"><h3>'+n.label+'</h3><p>'+(n.blurb||'')+'</p></button>';
          }).join('');
          subnetsEl.style.display='flex'; backBtn.style.display='block';
          subnetsEl.querySelectorAll('.tile').forEach(t=>t.addEventListener('click',()=>enterNetwork(t.dataset.net)));
        }
        root.querySelectorAll('.megabtn').forEach(b=>b.addEventListener('click',()=>{
          showWall(b.dataset.pick==='adtv'?AD_ORDER:SUBNET_ORDER);
        }));
        backBtn.addEventListener('click',()=>{subnetsEl.style.display='none';backBtn.style.display='none';toprow.style.display='flex';});
        
        function enterNetwork(key){
          if (host.__ntvToTop) host.__ntvToTop();
          NET=NETWORKS[key];
          host.style.setProperty('--accent',NET.accent);
          current=null; tuneToken++;
          portal.style.display='none'; tv.style.display='flex';
          /* First time anyone lands on a channel, point out where the listings live. */
          setTimeout(showGuideHintOnce, 1200);
          /* No sponsor line in the crawl. There is nothing to sell yet, and
             "YOUR BRAND HERE" on a running ticker reads as a placeholder
             nobody bought rather than an invitation. sponsorLine() and the
             CONFIG.SPONSORS list stay put for when there is a real one. */
          const tick=NET.tick+'  \u2022  FREE TV. FOREVER.  \u2022  ';
          $id('tickertext').textContent=tick+tick;
          if(NET.adCategory||NET.adBrandsAll){
            CHANNELS=(NET.extras||[]).map((c,i)=>Object.assign({num:900+i},c)); // extras get provisional slots
            buildGrid();
            buildAdChannels(key);
          }else{
            CHANNELS=NET.channels.map(c=>Object.assign({},c));
            buildGrid();
            loadChannel(CHANNELS[0]).then(()=>tune(CHANNELS[0].num));
            CHANNELS.slice(1).forEach((ch,i)=>setTimeout(()=>loadChannel(ch),350*(i+1)));
          }
        }
        /* build an AD subject network: CH02 = ALL <subject>, then one channel
           per matching AdViews brand, then any extras (Burger TV etc.) */
        /* One place that turns a brand-group map into a channel list, so the
           dial and the inventory tally can never disagree about what exists. */
        function adChansFor(net,groups){
          let num=1; const chans=[];
          if(!groups) return chans;
          if(net.adBrandsAll){
            Object.keys(groups).sort().slice(0,MAX_BRAND_CHANNELS).forEach(b=>{
              num++; chans.push({num,call:b.replace(/[^a-z0-9]/gi,'').slice(0,4).toUpperCase(),
                name:b.toUpperCase(),type:'query',est:90,q:'collection:('+groups[b].join(' OR ')+')',brand:true});
            });
          }else if(net.adCategory){
            const matched=Object.keys(groups).filter(b=>net.adCategory.test(b));
            const allIds=matched.flatMap(b=>groups[b]);
            if(allIds.length){
              num++; chans.push({num,call:"ALL",name:"ALL "+net.label,type:'query',est:90,q:'collection:('+allIds.join(' OR ')+')'});
              matched.sort().forEach(b=>{
                num++; chans.push({num,call:b.replace(/[^a-z0-9]/gi,'').slice(0,4).toUpperCase(),
                  name:b.toUpperCase(),type:'query',est:90,q:'collection:('+groups[b].join(' OR ')+')',brand:true});
              });
            }
          }
          (net.extras||[]).forEach(x=>{num++;chans.push(Object.assign({num},x));});
          return chans;
        }
        async function buildAdChannels(key){
          const net=NETWORKS[key];
          try{
            const groups=await getBrandGroups();
            const chans=adChansFor(net,groups);
            if(!chans.length)throw new Error('no channels');
            if(NET!==net)return; // user left this network
            CHANNELS=chans;
            buildGrid();
            loadChannel(CHANNELS[0]).then(()=>{if(NET===net)tune(CHANNELS[0].num);});
            CHANNELS.slice(1).forEach((ch,i)=>setTimeout(()=>loadChannel(ch),350*(i+1)));
          }catch(e){
            if(NET!==net)return;
            if(CHANNELS.length){ // fall back to extras alone
              CHANNELS=CHANNELS.map((c,i)=>Object.assign({},c,{num:i+2}));
              buildGrid();
              loadChannel(CHANNELS[0]).then(()=>{if(NET===net)tune(CHANNELS[0].num);});
              CHANNELS.slice(1).forEach((ch,i)=>setTimeout(()=>loadChannel(ch),350*(i+1)));
            }else nowbar.textContent='NETWORK OFF AIR \u2014 check antenna';
          }
        }
        function exitToMenu(){
          if (host.__ntvToTop) host.__ntvToTop();
          tuneToken++; vid.pause(); vid.removeAttribute('src'); vid.load();
          radiocard.style.display='none'; staticHold(false); statsEl.style.display='none';
          tv.classList.remove('tuned'); tv.style.display='none'; portal.style.display='flex';
          subnetsEl.style.display='none'; backBtn.style.display='none'; toprow.style.display='flex';
          current=null; NET=null;
        }
        
        /* ---------- search helper + GENTLE pre-warm ----------
           Lesson learned: hammering advancedsearch gets rate-limited and used to
           poison the cache with empty results. Now: one query per network, well
           spaced, empties never cached, and loadChannel retries once. */
        function qkey(q){ /* 40 sanitised chars are NOT unique: the decade queries differ
  only in a trailing year range, so they collapsed onto one key and every
  channel shared one playlist. Hash the FULL query. */
  let h=0; for(let i=0;i<q.length;i++){ h=(h*31+q.charCodeAt(i))|0; }
  return 'q_'+q.replace(/\W+/g,'').slice(0,40)+'_'+(h>>>0).toString(36); }
async function fetchDocs(q){
          const u='https://archive.org/advancedsearch.php?q='+encodeURIComponent(q)
                +'&fl[]=identifier&fl[]=title&fl[]=year&rows='+QUERY_ROWS+'&page=1&output=json&sort[]=downloads+desc';
          const r=await fetch(u); const j=await r.json();
          return (j.response&&j.response.docs)||[];
        }
        (function prewarm(){
          const firsts=[];
          Object.values(NETWORKS).forEach(n=>{const c=(n.channels||[])[0]; if(c&&c.type==='query')firsts.push(c.q);});
          firsts.forEach((q,i)=>setTimeout(async()=>{
            const key=qkey(q);
            if(cache(key))return;
            try{const docs=await fetchDocs(q); if(docs.length)cache(key,docs);}catch(e){}
          },1200*(i+1)));
        })();
        
        /* ---------- manifest loading ---------- */
        async function fetchItemFiles(itemId){
          const hit=cache('m_'+itemId); if(hit)return hit;
          const r=await fetch('https://archive.org/metadata/'+itemId);
          if(!r.ok)throw new Error('metadata '+r.status);
          const j=await r.json();
          const byBase={};
          (j.files||[]).forEach(f=>{
            if(!/\.(mp4|mp3|ogg)$/i.test(f.name))return;
            const base=f.name.replace(/\.[a-z0-9]+$/i,'').replace(/[._]?(512kb|ia|64kb)$/i,'').toLowerCase();
            const rank=/\.mp4$/i.test(f.name)?(/512kb|\.ia\./i.test(f.name)||f.source==='derivative'?3:2):1;
            if(!byBase[base]||rank>byBase[base].rank) byBase[base]={f,rank};
          });
          const out=Object.values(byBase).slice(0,250).map(({f})=>({
            url:'https://archive.org/download/'+itemId+'/'+encodeURIComponent(f.name).replace(/%2F/g,'/'),
            title:cleanTitle(f.name,itemId),
            audio:/\.(mp3|ogg)$/i.test(f.name),
            len:Math.max(5,parseLen(f.length)||600), est:!parseLen(f.length)
          }));
          if(!out.length)throw new Error('no media');
          const it=j.metadata&&j.metadata.title?String(j.metadata.title).replace(/\s+/g,' ').trim():null;
          if(it&&out.length===1)out[0].title=it.length>70?it.slice(0,67)+'…':it;
          return cache('m_'+itemId,out);
        }
        async function loadChannel(ch){
          if(ch.playlist||ch.queue||ch.failed||ch.loading)return;
          ch.loading=true;
          try{
            if(ch.type==='items'){
              const lists=await Promise.all(ch.ids.map(id=>fetchItemFiles(id).catch(()=>[])));
              ch.playlist=lists.flat();
              if(!ch.playlist.length)throw new Error('empty');
              ch.total=ch.playlist.reduce((s,p)=>s+p.len,0);
            }else{
              const key=qkey(ch.q);
              let docs=cache(key);
              if(!docs||!docs.length){
                docs=await fetchDocs(ch.q);
                if(!docs.length){ // one polite retry — rate limits pass quickly
                  await new Promise(res=>setTimeout(res,2500));
                  docs=await fetchDocs(ch.q);
                }
                if(docs.length)cache(key,docs); // empties are NEVER cached
              }
              if(!docs.length)throw new Error('empty query');
              /* Gate applies to brand channels only -- never to ALL, to an extra,
                 or to a hand-authored strand, which are allowed to be small. */
              if(ch.brand && docs.length < MIN_CH_ITEMS) ch.thin=true;
              const junk=(NET&&NET.junk)||/$^/;
              ch.queue=docs.filter(d=>{
                if(CONFIG.BLOCKLIST.includes(d.identifier))return false;
                const t=String((Array.isArray(d.title)?d.title[0]:d.title)||'');
                if(ch.not&&ch.not.test(t))return false;
                if(ch.must&&!ch.must.test(t))return false; // open queries: title must name the product
                return !junk.test(t)||/commercial/i.test(t);
              }).map(d=>{
                let t=String((Array.isArray(d.title)?d.title[0]:d.title)||d.identifier).replace(/\s+/g,' ').trim();
                /* Archive titles carry the shelf mark -- "(dmbb31122)" -- which is
                   catalogue plumbing, not a programme name. */
                t=t.replace(/\s*\(\s*[a-z]{3,}\d{3,}[a-z0-9]*\s*\)/gi,'').replace(/\s{2,}/g,' ').trim();
                if(t.length>64)t=t.slice(0,61)+'…';
                const y=parseInt(Array.isArray(d.year)?d.year[0]:d.year,10);
                /* AdViews stamps every item 2011 -- the year Duke digitised it,
                   not the year it aired. Printing that on a listing for a 1960s
                   shampoo advert is worse than printing nothing. Only years that
                   can plausibly be broadcast dates get shown. */
                if(y&&y<=1999&&!t.includes(String(y)))t+=' ('+y+')';
                /* a channel-level guess, not a real duration */
                return {id:d.identifier,title:t,len:ch.est||600,est:true};
              });
              if(!ch.queue.length)throw new Error('all filtered');
            }
          }catch(e){ ch.failed=true; }
          ch.loading=false; buildGrid();
        }
        
        /* ---------- AdViews brand enumeration (shared, cached) ---------- */
        async function getBrandGroups(){
          let g=cache('brandgroups'); if(g)return g;
          let cols=cache('brandcols');
          if(!cols){
            const u='https://archive.org/advancedsearch.php?q='+encodeURIComponent('identifier:(adviews_*) AND mediatype:(collection)')
                  +'&fl[]=identifier&rows=400&page=1&output=json';
            const r=await fetch(u); const j=await r.json();
            cols=((j.response&&j.response.docs)||[]).map(d=>d.identifier);
            if(cols.length)cache('brandcols',cols);
          }
          const groups={};
          cols.forEach(id=>{
            let b=id.replace(/^adviews_/,'').replace(/_\d0s$/,'').replace(/_/g,' ').trim();
            if(!b)return; (groups[b]=groups[b]||[]).push(id);
          });
          return cache('brandgroups',groups);
        }
        
        /* ---------- broadcast clock ---------- */
        function livePosItems(ch){
          let off=Math.floor(Date.now()/1000)%Math.max(1,Math.floor(ch.total));
          let i=0,guard=ch.playlist.length*2;
          while(off>=ch.playlist[i].len&&guard-->0){off-=ch.playlist[i].len;i=(i+1)%ch.playlist.length;}
          return {index:i,seek:off};
        }
        function livePosQuery(ch){
          /* seek:0 was the real "this is not a station" tell -- every item began
             at frame one, so you could never walk in on the middle of something,
             which is the whole feeling of turning a television on. Joining part
             way through costs nothing.

             The offset is clamped to 40% of the estimate because the estimate is
             a guess: seeking past the end of a genuinely short clip would end it
             instantly and skip forward. Under-seeking just means you join a
             little earlier than a real station would. */
          const est=ch.est||600, t=Math.floor(Date.now()/1000);
          return {index:Math.floor(t/est)%ch.queue.length, seek:Math.min(t%est, Math.floor(est*0.4))};
        }
        function upcoming(ch,count){
          const list=ch.playlist||ch.queue; if(!list||!list.length)return null;
          let i,until;
          if(current===ch.num&&vid.src){
            i=curIdx;
            until=(vid.duration&&isFinite(vid.duration))?Math.max(0,vid.duration-vid.currentTime):list[i].len;
          }else{
            const p=ch.playlist?livePosItems(ch):livePosQuery(ch);
            i=p.index; until=list[i].len-(p.seek||0);
          }
          const out=[{title:list[i].title,startsIn:0,est:false}]; let acc=until;
          /* A start time is only as good as every duration in front of it, so
             one guess upstream makes everything after it a guess too. */
          let guessed = !!list[i].est;
          for(let k=1;k<count;k++){ i=(i+1)%list.length;
            out.push({title:list[i].title,startsIn:acc,est:guessed});
            guessed = guessed || !!list[i].est; acc+=list[i].len; }
          return out;
        }
        
        /* Both branches in one rail, current network lit in its own accent. */
        let stripBuilt=false;
        function buildNetStrip(){
          const el=$id('netstrip'); if(!el) return;
          if(!stripBuilt){
            let html='';
            AD_ORDER.forEach(k=>{ html+='<button data-net="'+k+'">'+NETWORKS[k].label+'</button>'; });
            html+='<span class="sep"></span>';
            SUBNET_ORDER.forEach(k=>{ html+='<button data-net="'+k+'">'+NETWORKS[k].label+'</button>'; });
            el.innerHTML=html;
            el.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
              if(NETWORKS[b.dataset.net]!==NET) enterNetwork(b.dataset.net);
            }));
            stripBuilt=true;
          }
          el.querySelectorAll('button').forEach(b=>{
            const on=NETWORKS[b.dataset.net]===NET;
            b.classList.toggle('on',on);
            if(on){ b.style.setProperty('--tint',NET.accent); b.scrollIntoView({block:'nearest',inline:'center'}); }
          });
        }
        /* ---------- guide ---------- */
        function buildGrid(){
          if(!NET)return;
          const html=CHANNELS.filter(ch=>!ch.thin).map(ch=>{
            let cells;
            if(ch.failed) cells='<div class="slot"><i>OFF AIR</i></div><div class="slot"></div><div class="slot"></div>';
            else if(!(ch.playlist||ch.queue)) cells='<div class="slot"><i>TUNING…</i></div><div class="slot"></div><div class="slot"></div>';
            else{
              try{
                cells=upcoming(ch,3).map((u,k)=>{
                  /* The old guide printed a precise time for every slot, computed from
   channel-level guesses -- a clock that looked authoritative and was
   made up. Show the time only where the durations behind it are real
   metadata; otherwise the column heading already says NEXT and LATER. */
                  const label=k===0?(current===ch.num?'\u25B6 ON NOW':'NOW')
                    :(u.est?'':fmt(new Date(Date.now()+u.startsIn*1000)));
                  return '<div class="slot"><em>'+label+'</em><i>'+u.title.replace(/</g,'&lt;')+'</i></div>';
                }).join('');
              }catch(e){cells='<div class="slot"><i>—</i></div><div class="slot"></div><div class="slot"></div>';}
            }
            return '<div class="row'+(current===ch.num?' tuned':'')+'" data-num="'+ch.num+'">'
              +'<div class="ch"><b>'+String(ch.num).padStart(2,'0')+' '+ch.call+'</b><span>'+ch.name+'</span></div>'+cells+'</div>';
          }).join('');
          buildNetStrip();
          rows.innerHTML=html;
          /* VHF ran 2-13 and was the network affiliate; 14 and up was UHF, the
             independent with the movie package and the local car dealer. Marking
             where the band changes costs nothing and is the kind of detail this
             audience reads instantly. Channel 1 is absent on purpose -- the FCC
             took it back in 1948. */
          const firstUhf=[...rows.querySelectorAll('.row')].find(r=>+r.dataset.num>=14);
          if(firstUhf && !rows.querySelector('.bandmark')){
            const d=document.createElement('div');
            d.className='bandmark'; d.textContent='UHF';
            rows.insertBefore(d, firstUhf);
          }
          rows.querySelectorAll('.row').forEach(r=>r.addEventListener('click',()=>{if(suppressClick)return;tune(+r.dataset.num);}));
          $id('guidedate').textContent=GDATE+' \u00b7 '+NET.label+' \u00b7 '+CHANNELS.length+' CH';
        }
        setInterval(()=>{if(NET)buildGrid();},15000);
        
        /* manual + auto scroll */
        let scrollY=0, manualUntil=0, dragY=null, dragMoved=0, suppressClick=false;
        const gridEl=$id('grid');
        gridEl.addEventListener('wheel',e=>{e.preventDefault();
          scrollY+=e.deltaY; manualUntil=Date.now()+4000;},{passive:false});
        gridEl.addEventListener('pointerdown',e=>{dragY=e.clientY; dragMoved=0;});
        gridEl.addEventListener('pointermove',e=>{ if(dragY===null)return;
          const d=dragY-e.clientY; if(Math.abs(d)>0){scrollY+=d; dragMoved+=Math.abs(d); dragY=e.clientY; manualUntil=Date.now()+4000;} });
        root.addEventListener('pointerup',()=>{ suppressClick=dragMoved>8; dragY=null;
          setTimeout(()=>suppressClick=false,80); });
        (function autoScroll(){
          const h=rows.scrollHeight, vh=gridEl.clientHeight;
          if(h<=vh||tv.classList.contains('tuned')){ scrollY=0; rows.style.transform='translateY(0)'; }
          else{
            const manual=Date.now()<manualUntil;
            if(!manual&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
              scrollY+=0.5; if(scrollY>h-vh+60)scrollY=-60;
            }
            if(manual)scrollY=Math.max(0,Math.min(scrollY,h-vh));
            rows.style.transform='translateY('+(-Math.max(0,Math.min(scrollY,h-vh)))+'px)';
          }
          requestAnimationFrame(autoScroll);
        })();
        
        /* ---------- playback ---------- */
        async function resolveSpot(ch,index){
          const q=ch.queue[index];
          if(q.url)return q;
          const files=await fetchItemFiles(q.id);
          const vf=files.find(f=>!f.audio)||files[0];
          q.url=vf.url; q.audio=!!vf.audio;
          if(files.length===1)q.title=q.title||vf.title;
          q.len=files.reduce((s,f)=>s+f.len,0)||q.len;
          return q;
        }
        function showSpot(item){
          nowbar.textContent='NOW SHOWING \u25B8 '+item.title+(vid.muted?'  \u00b7  TAP "SOUND" FOR AUDIO':'');
          radiocard.style.display=item.audio?'flex':'none';
          if(item.audio)$id('radiotitle').textContent=item.title.toUpperCase();
        }
        async function playAt(ch,index,seek){
          const token=++tuneToken; curIdx=index;
          staticHold(true);
          try{
            if(ch.queue&&ch.queue[index].dead)throw new Error('skipped');
            const item=ch.playlist?ch.playlist[index]:await resolveSpot(ch,index);
            if(token!==tuneToken)return;
            const cap=(NET&&NET.maxLen)||8000;
            if(ch.queue&&item.len>cap){item.dead=true;throw new Error('over network length cap');}
            let s=seek;
            if(!s&&ch.queue&&item.len>240)s=Math.floor(Date.now()/1000)%Math.floor(item.len);
            vid.src=item.url;
            vid.onloadedmetadata=()=>{ if(s>1&&isFinite(vid.duration)&&s<vid.duration-2)vid.currentTime=s;
              vid.play().catch(()=>{}); };
            showSpot(item);
            if(ch.queue&&ch.queue[(index+1)%ch.queue.length]) resolveSpot(ch,(index+1)%ch.queue.length).catch(()=>{});
          }catch(e){ if(token===tuneToken)advance(ch); }
        }
        function advance(ch){ const list=ch.playlist||ch.queue; if(!list||!list.length)return;
          playAt(ch,(curIdx+1)%list.length,0); }
        vid.addEventListener('playing',()=>staticHold(false));
        vid.addEventListener('ended',()=>{const ch=CHANNELS.find(c=>c.num===current); if(ch)advance(ch); buildGrid();});
        vid.addEventListener('error',()=>{if(!vid.src)return;const ch=CHANNELS.find(c=>c.num===current); if(ch)advance(ch);});
        
        function showGuideHintOnce(){
          /* Only where the guide is hidden behind the button -- on a wide
             screen the listings are already on show and a hint would be noise. */
          const small = Math.min(window.innerWidth, window.innerHeight) <= 900
            || window.innerHeight <= 600;
          if (!small) return;
          try { if (localStorage.getItem('ntv4_guidehint')) return; } catch (e) {}
          const h = $id('hint'); if (!h) return;
          poke();                       // bring the controls up so it points at something
          h.classList.add('on');
          const kill = function(){ h.classList.remove('on'); try { localStorage.setItem('ntv4_guidehint','1'); } catch (e) {} };
          setTimeout(kill, 6500);
          $id('btnGuide').addEventListener('click', kill, { once: true });
        }
        function tune(num){
          if (host.__ntvToTop) host.__ntvToTop();
          if (typeof poke === 'function') poke();
          const ch=CHANNELS.find(c=>c.num===num); if(!ch)return;
          current=num;
          osd.textContent='CH '+String(num).padStart(2,'0')+'  '+ch.call;
          osd.classList.add('show'); clearTimeout(osdTimer);
          osdTimer=setTimeout(()=>osd.classList.remove('show'),3500);
          if(ch.failed){ ch.failed=false; ch.loading=false; } // a tap earns a retry
          const go=()=>{ if(current!==num)return;
            if(ch.playlist){const p=livePosItems(ch);playAt(ch,p.index,p.seek);}
            else if(ch.queue){const p=livePosQuery(ch);playAt(ch,p.index,0);}
            else{nowbar.textContent='CH '+num+' IS OFF AIR';} };
          if(ch.playlist||ch.queue)go();
          else{nowbar.textContent='TUNING…';staticHold(true);loadChannel(ch).then(go);}
          buildGrid();
        }
        function step(dir){ const nums=CHANNELS.filter(c=>!c.thin).map(c=>c.num);
          if(current===null){tune(nums[0]);return;}
          tune(nums[(nums.indexOf(current)+dir+nums.length)%nums.length]); }
        
        if(IS_TOUCH){ vid.muted=true; }
        $id('menuchip').addEventListener('click',exitToMenu);
        $id('screen').addEventListener('click',e=>{ if(e.target.id==='menuchip')return; if(vid.src&&vid.paused)vid.play().catch(()=>{}); });
        $id('btnUp').addEventListener('click',()=>step(1));
        $id('btnDown').addEventListener('click',()=>step(-1));
        /* FULL used to only collapse the guide -- it never left the browser, which
           is why Chrome's tabs stayed on screen. It now asks for real fullscreen
           on the host and locks landscape where the platform allows it. iOS
           Safari refuses element fullscreen outright (video only), so there we
           fall back to the guide-collapse, which is the most screen an iPhone
           will actually give us. */
        const fsSupported = !!(host.requestFullscreen || host.webkitRequestFullscreen);
        function inFullscreen(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
        function lockLandscape(){
          try {
            if (screen.orientation && screen.orientation.lock) {
              screen.orientation.lock('landscape').catch(function(){});
            }
          } catch (e) {}
        }
        function goFull(){
          if (inFullscreen()) {
            (document.exitFullscreen || document.webkitExitFullscreen || function(){}).call(document);
            return;
          }
          const req = host.requestFullscreen || host.webkitRequestFullscreen;
          if (!req) { tv.classList.toggle('tuned'); return; }
          const r = req.call(host);
          if (r && r.then) { r.then(lockLandscape).catch(function(){ tv.classList.add('tuned'); }); }
          else { lockLandscape(); }
        }
        $id('btnFull').addEventListener('click', goFull);

        /* GUIDE slides the listings up over the picture; on a phone the guide is
           no longer permanently eating half the screen. */
        /* An installed app has no browser chrome, so a viewer has no way to pull
           a newer build. This button does, and the check below does it for them:
           on returning to the app after a while, re-fetch so they are not stuck
           on whatever shipped the day they added it. */
        $id('btnReload').addEventListener('click', function(){
          try { location.reload(); } catch (e) {}
        });
        let lastActive = Date.now();
        document.addEventListener('visibilitychange', function(){
          if (document.visibilityState === 'hidden') { lastActive = Date.now(); return; }
          if (Date.now() - lastActive > 1800000) { try { location.reload(); } catch (e) {} }
        });

        $id('btnGuide').addEventListener('click', function(){
          tv.classList.toggle('guideon');
          poke();
        });

        /* Controls fade off the picture after a few idle seconds and come back
           on any touch, move or key -- the way a real player behaves. */
        let idleTimer = null;
        function poke(){
          tv.classList.remove('idle');
          clearTimeout(idleTimer);
          idleTimer = setTimeout(function(){
            if (!tv.classList.contains('guideon')) tv.classList.add('idle');
          }, 3200);
        }
        ['pointerdown','pointermove','touchstart','keydown','wheel'].forEach(function(ev){
          host.addEventListener(ev, poke, { passive: true });
        });
        poke();

        /* Every click used to leave the viewer parked wherever they had scrolled,
           so the top of the new screen was off-screen. Snap back each time. */
        function toTop(){
          try { host.scrollIntoView({ block: 'start' }); } catch (e) {}
          try { window.scrollTo(0, 0); } catch (e) {}
        }
        host.__ntvToTop = toTop;
        ['fullscreenchange','webkitfullscreenchange'].forEach(function(ev){
          document.addEventListener(ev, function(){
            $id('btnFull').textContent = inFullscreen() ? 'EXIT' : 'FULL';
            checkRotate();
          });
        });

        /* Small screen held upright only, and dismissible -- a wall nobody can
           get past is worse than a narrow picture. */
        let rotDismissed = false;
        try { rotDismissed = localStorage.getItem('ntv4_introSeen') === '1'; } catch (e) {}
        function checkRotate(){
          const el = $id('rotate'); if (!el) return;
          const short = Math.min(window.innerWidth, window.innerHeight);
          const portrait = window.innerHeight > window.innerWidth;
          /* Phones and tablets get the install card in any orientation, because
             on iOS the bars stay whichever way you hold it. Everyone else only
             sees the rotate nudge, and only when actually held upright. */
          const wants = (isIOS || androidPrompt) ? (short <= 900) : (short <= 500 && portrait);
          el.classList.toggle('on', wants && !standalone && !rotDismissed);
        }
        $id('rotSkip').addEventListener('click', dismissCard);
        /* A real user gesture, so both fullscreen and the install prompt are
           permitted from this handler. */
        $id('rotFull').addEventListener('click', function(){
          if (androidPrompt) { androidPrompt.prompt(); androidPrompt = null; dismissCard(); return; }
          dismissCard();
          if (!isIOS) { goFull(); }
        });
        /* iPhone refuses element fullscreen entirely, so point at the one route
           that does work: Add to Home Screen launches without Safari's chrome.
           The meta tags have to be injected here -- this element does not own
           the Wix page head, and iOS reads them when the user adds the page. */
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
          || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const standalone = window.navigator.standalone === true
          || window.matchMedia('(display-mode: standalone)').matches
          || window.matchMedia('(display-mode: fullscreen)').matches;
        /* Favicon, scoped to THIS page. The element only exists on /newtv, and
           Wix is a single-page app -- navigating away does not reload the head,
           so the original icons are stashed and put back on disconnect.
           Otherwise the whole J.Noir site would keep wearing a TV set. */
        /* The Wix page around this element is taller than the screen, so the
           viewer could still scroll the TV off and find white page underneath.
           Lock the document while NEW TV is on screen and paint it black, then
           put both back on disconnect -- Wix never reloads the head between
           pages, so leaving this set would break every other page. */
        this._pageLock = (function lockPage(){
          const de = document.documentElement, bd = document.body;
          const prev = {
            deOverflow: de.style.overflow, bdOverflow: bd.style.overflow,
            deBg: de.style.background,     bdBg: bd.style.background,
            bdMargin: bd.style.margin
          };
          de.style.setProperty('overflow','hidden','important');
          bd.style.setProperty('overflow','hidden','important');
          de.style.setProperty('background','#05060A','important');
          bd.style.setProperty('background','#05060A','important');
          bd.style.setProperty('margin','0','important');
          return function unlock(){
            de.style.overflow = prev.deOverflow; bd.style.overflow = prev.bdOverflow;
            de.style.background = prev.deBg;     bd.style.background = prev.bdBg;
            bd.style.margin = prev.bdMargin;
          };
        })();

        this._faviconRestore = (function swapFavicon(){
          const NEW_ICON = 'https://pierceology.github.io/fleet-assets/newtv/favicon-32.png';
          const prev = Array.prototype.slice.call(
            document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"]'));
          const stash = prev.map(function(l){ return { el: l, parent: l.parentNode, next: l.nextSibling }; });
          prev.forEach(function(l){ l.parentNode && l.parentNode.removeChild(l); });
          const link = document.createElement('link');
          link.rel = 'icon'; link.type = 'image/png'; link.href = NEW_ICON;
          document.head.appendChild(link);
          return function restore(){
            if (link.parentNode) link.parentNode.removeChild(link);
            stash.forEach(function(o){
              if (o.parent) o.parent.insertBefore(o.el, o.next || null);
            });
          };
        })();

        (function addHomeScreenMeta(){
          const ICON = 'https://pierceology.github.io/fleet-assets/newtv/icon-180.png';
          const metas = [
            ['apple-mobile-web-app-capable','yes'],
            ['mobile-web-app-capable','yes'],
            ['apple-mobile-web-app-status-bar-style','black-translucent'],
            ['apple-mobile-web-app-title','NEW TV'],
            ['theme-color','#05060A']
          ];
          metas.forEach(function(pair){
            if (document.querySelector('meta[name="'+pair[0]+'"]')) return;
            const m = document.createElement('meta');
            m.name = pair[0]; m.content = pair[1];
            document.head.appendChild(m);
          });
          /* Wix ships its own apple-touch-icon, so skipping when one exists meant
             Add to Home Screen saved a blank Wix favicon instead of the TV.
             Replace it, and stash the originals to put back on disconnect. */
          const prevTouch = Array.prototype.slice.call(
            document.querySelectorAll('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'));
          const touchStash = prevTouch.map(function(l){ return { el:l, parent:l.parentNode, next:l.nextSibling }; });
          prevTouch.forEach(function(l){ l.parentNode && l.parentNode.removeChild(l); });
          const touch = document.createElement('link');
          touch.rel = 'apple-touch-icon'; touch.href = ICON;
          document.head.appendChild(touch);
          window.__ntvTouchRestore = function(){
            if (touch.parentNode) touch.parentNode.removeChild(touch);
            touchStash.forEach(function(o){ if (o.parent) o.parent.insertBefore(o.el, o.next || null); });
          };
        })();
        /* One adaptive card, shown once per device. It is NOT a wall -- there is
           always a one-tap way past it. Gating a TV behind an install prompt is
           the surest way to lose someone who just tapped a friend's link.
           On iOS it leads with Add to Home Screen because rotating does NOT
           remove Safari's bars -- installing is the only thing that does. */
        const SEEN_KEY = 'ntv4_introSeen';
        let androidPrompt = null;
        window.addEventListener('beforeinstallprompt', function(e){
          e.preventDefault(); androidPrompt = e; paintCard();
        });

        function paintCard(){
          const small = Math.min(window.innerWidth, window.innerHeight) <= 900;
          if (!small || standalone) return;
          const portrait = window.innerHeight > window.innerWidth;
          if (isIOS) {
            $id('rotTitle').textContent = 'WATCH IT PROPERLY';
            $id('rotBody').textContent = 'Add NEW TV to your Home Screen. It opens with no browser bars \u2014 the whole screen, like a real set.';
            $id('rotSteps').hidden = false;
            $id('rotSteps').innerHTML =
              '1. Tap <b>Share</b> <span class="share"></span> at the bottom<br>' +
              '2. Scroll and tap <b>Add to Home Screen</b><br>' +
              '3. Open NEW TV from your Home Screen';
            $id('rotFull').textContent = 'GOT IT \u2014 WATCH NOW';
            $id('rotSub').textContent = portrait ? 'Tip: turn the phone sideways too.' : '';
          } else if (androidPrompt) {
            $id('rotTitle').textContent = 'WATCH IT PROPERLY';
            $id('rotBody').textContent = 'Install NEW TV for the whole screen, no browser bars.';
            $id('rotFull').textContent = 'INSTALL NEW TV';
            $id('rotSub').textContent = portrait ? 'Or just turn the phone sideways.' : '';
          } else {
            $id('rotTitle').textContent = 'TURN YOUR PHONE';
            $id('rotBody').textContent = 'NEW TV is a widescreen. Rotate for the full picture.';
            $id('rotFull').textContent = fsSupported ? 'GO FULLSCREEN' : 'WATCH WIDE';
            $id('rotSub').textContent = '';
          }
        }

        function dismissCard(){
          rotDismissed = true;
          try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
          checkRotate();
        }
        ['resize','orientationchange'].forEach(function(ev){ window.addEventListener(ev, function(){ paintCard(); checkRotate(); }); });
        paintCard();
        checkRotate();
        function paintMute(){
          /* Write the WORD only -- textContent on the button would delete the
             icon markup inside it. The icon swaps off a class on #controls. */
          const lbl = $id('btnMute').querySelector('.t');
          if (lbl) lbl.textContent = 'SOUND: ' + (vid.muted ? 'OFF' : 'ON');
          $id('controls').classList.toggle('muted', !!vid.muted);
        }
        $id('btnMute').addEventListener('click', function(){ vid.muted = !vid.muted; paintMute(); });
        paintMute();
        
        /* S = station inventory */
        /* ---------- inventory, whole station ---------- */
        let statsScan=null;
        function fmtRun(sec){ return sec>=3600?(sec/3600).toFixed(1)+' hr':Math.round(sec/60)+' min'; }

        /* Every channel on both branches, with whatever its inventory is known to
           be: live if the channel is tuned, from the query cache if it has ever
           been tuned, otherwise unknown until the scan reaches it. */
        function stationRows(){
          const groups=cache('brandgroups');
          const live={}; if(NET) CHANNELS.forEach(c=>{ if(c.q) live[c.q]=c; });
          return [{branch:'AD TV',keys:AD_ORDER},{branch:'TV TV',keys:SUBNET_ORDER}].map(b=>({
            branch:b.branch,
            nets:b.keys.map(k=>{
              const net=NETWORKS[k];
              const chans=net.channels?net.channels:adChansFor(net,groups);
              return {key:k,label:net.label,chans:chans.map(ch=>{
                const l=live[ch.q];
                let list=l&&(l.playlist||l.queue);
                if(!list&&ch.q){ const d=cache(qkey(ch.q)); if(d&&d.length) list=d.map(()=>({len:ch.est||600})); }
                return {name:ch.name,q:ch.q,est:ch.est||600,
                  n:list?list.length:null,
                  sec:list?list.reduce((t,p)=>t+(p.len||ch.est||600),0):0,
                  thin:!!(l&&l.thin)};
              })};
            })
          }));
        }

        function renderStats(){
          const data=stationRows();
          let grandN=0,grandSec=0,unknown=0,body='';
          data.forEach(b=>{
            let bN=0,bSec=0,bBody='';
            b.nets.forEach(net=>{
              if(!net.chans.length){
                /* AD TV networks build their channels from the AdViews brand map.
                   Before that map is fetched they enumerate to nothing -- and
                   silently vanishing from the tally is worse than saying so. */
                bBody+='<tr><td>'+net.label+'</td><td>\u2026</td><td>\u2014</td></tr>';
                unknown++; return;
              }
              let nN=0,nSec=0;
              net.chans.forEach(c=>{
                if(c.n===null){unknown++;return;}
                nN+=c.n; nSec+=c.sec;
              });
              bN+=nN; bSec+=nSec;
              const known=net.chans.filter(c=>c.n!==null).length;
              bBody+='<tr><td>'+net.label+'</td><td>'+(known?nN:'\u2026')+'</td><td>'
                +(known?fmtRun(nSec):'\u2014')+'</td></tr>';
            });
            grandN+=bN; grandSec+=bSec;
            body+='<tr class="tot"><td>'+b.branch+'</td><td>'+bN+'</td><td>'+fmtRun(bSec)+'</td></tr>'+bBody;
          });
          statsEl.innerHTML='<h3>STATION INVENTORY</h3><table>'
            +'<tr><td>NETWORK</td><td>ITEMS</td><td>RUNTIME</td></tr>'+body
            +'<tr class="tot"><td>WHOLE STATION</td><td>'+grandN+'</td><td>'+(grandSec/3600).toFixed(1)+' hrs</td></tr></table>'
            +'<p>'+(unknown?('Counting '+unknown+' channels not yet tuned\u2026 '):'Every channel counted. ')
            +'Runtimes are estimates until each item has played once. Press S to close.</p>';
        }

        /* Fill the gaps gently: two at a time with a pause between, because every
           viewer shares one archive.org rate-limit bucket with everyone else on
           their IP, and a burst of ninety requests is indistinguishable from abuse. */
        async function scanStation(){
          /* Without the brand map the entire commercials side is uncountable, so
             fetch it before anything else and repaint once it lands. */
          if(!cache('brandgroups')){
            try{ await getBrandGroups(); renderStats(); }catch(e){}
            if(statsEl.style.display!=='block')return;
          }
          const seen={};
          const targets=[];
          stationRows().forEach(b=>b.nets.forEach(n=>n.chans.forEach(c=>{
            if(c.n===null&&c.q&&!seen[c.q]){seen[c.q]=1;targets.push(c);}
          })));
          for(let i=0;i<targets.length;i+=2){
            if(statsEl.style.display!=='block')return; // closed -- stop asking
            await Promise.all(targets.slice(i,i+2).map(async c=>{
              try{ const docs=await fetchDocs(c.q); if(docs&&docs.length)cache(qkey(c.q),docs); }catch(e){}
            }));
            renderStats();
            await new Promise(r=>setTimeout(r,260));
          }
          renderStats();
        }

        function toggleStats(){
          if(statsEl.style.display==='block'){statsEl.style.display='none';statsScan=null;return;}
          renderStats();
          statsEl.style.display='block';
          if(!statsScan) statsScan=scanStation().then(()=>{statsScan=null;});
        }
        onKey(e=>{
          if(e.key&&e.key.toLowerCase()==='s'){toggleStats();return;} // works on the portal too
          if(!NET)return;
          if(e.key==='ArrowUp')step(-1);
          if(e.key==='ArrowDown')step(1);
          if(e.key.toLowerCase()==='g')tv.classList.remove('tuned');
          if(e.key.toLowerCase()==='f')tv.classList.toggle('tuned');
          if(e.key.toLowerCase()==='s')toggleStats();
          if(e.key==='Escape')exitToMenu();
          const n=parseInt(e.key,10);
          if(!isNaN(n)&&CHANNELS.some(c=>c.num===n))tune(n);
        });
        
        /* ---------- static ---------- */
        const cvs=$id('static'), ctx=cvs.getContext('2d');
        let staticActive=false;
        function drawStaticFrame(){
          const img=ctx.createImageData(cvs.width,cvs.height),d=img.data;
          for(let i=0;i<d.length;i+=4){const v=Math.random()*255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}
          ctx.putImageData(img,0,0);
        }
        function staticHold(on){
          if(matchMedia('(prefers-reduced-motion: reduce)').matches){cvs.style.opacity=0;return;}
          if(on&&!staticActive){
            staticActive=true;
            cvs.width=Math.floor(cvs.parentElement.clientWidth/3);
            cvs.height=Math.floor(cvs.parentElement.clientHeight/3);
            cvs.style.width='100%';cvs.style.height='100%';cvs.style.opacity=1;
            (function loop(){ if(!staticActive)return; drawStaticFrame(); requestAnimationFrame(loop); })();
          }else if(!on&&staticActive){ staticActive=false; cvs.style.opacity=0; }
        }
      }
    } catch (err) {
      console.error('[newtv] boot failed', err);
    }
  }
}

if (!customElements.get('newtv-portal')) customElements.define('newtv-portal', NewTvPortal);
