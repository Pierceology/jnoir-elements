/* Pierce Household Dashboard — one element, whole page.
   Data in:   household-json   (attribute, set by page code from the CMS)
   State out: hh-state         (attribute) + hh-qty / hh-scan / hh-fav events
   Scan modes: in (putting away, +1) · out (using, -1) · fav (tag a person, qty untouched) */

const CSS = `
:host, .hh * { box-sizing: border-box; }
.hh{
  --ink:#f7f3ec; --dim:#a9a196; --faint:#6d665b;
  --bg:#17130f; --bg2:#221a15; --card:#241d18; --card2:#2b221c; --line:#3a2f27;
  --gold:#f0b955; --mango:#f2874e; --good:#63d3a0; --warn:#f0b046; --bad:#f0715a; --fav:#c98ae0;
  background:
    radial-gradient(1100px 600px at 12% -10%, rgba(240,135,78,.16), transparent 62%),
    radial-gradient(900px 520px at 96% 4%, rgba(201,138,224,.11), transparent 60%),
    linear-gradient(180deg, var(--bg2) 0%, var(--bg) 44%);
  color:var(--ink); min-height:100vh; min-height:100svh;
  font:400 16px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased; padding:0 0 132px; text-wrap:pretty;
}
.hh.money{ padding-bottom:48px;
}
.hh ::-webkit-scrollbar{width:0;height:0}
.hh{position:fixed;inset:0;width:100vw;height:100vh;height:100svh;
    overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;z-index:100000}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}
@media(min-width:1000px){ .wrap{max-width:1140px;padding:0 32px} }

/* row lists become columns as the screen grows */
.rows{display:grid;gap:8px}
.rows .row{margin-bottom:0;height:100%}
@media(min-width:760px){ .rows{grid-template-columns:repeat(2,minmax(0,1fr))} }
@media(min-width:1240px){ .rows{grid-template-columns:repeat(3,minmax(0,1fr))} }
.rows.solo{grid-template-columns:minmax(0,1fr)}
@media(min-width:1000px){ .rows.pair{grid-template-columns:repeat(2,minmax(0,1fr))} }

.top{padding:26px 0 18px;display:flex;align-items:flex-end;justify-content:space-between;gap:16px}
@media(min-width:820px){ .top{padding:40px 0 24px} .h1{font-size:38px} .when{font-size:13px} }
.name{font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin:0 0 6px}
.h1{font-size:clamp(25px,7.4vw,29px);line-height:1.05;letter-spacing:-.02em;margin:0;font-weight:600}
.when{font-size:12px;color:var(--faint);text-align:right;letter-spacing:.04em;white-space:nowrap}

.tabs{display:flex;gap:4px;overflow-x:auto;padding:4px;background:var(--card);
  border:1px solid var(--line);border-radius:13px;margin:2px 0 22px}
@media(min-width:820px){
  .tabs{display:inline-flex;overflow:visible;margin:2px 0 28px}
  .tab{flex:0 0 auto;padding:11px 22px;font-size:14.5px}
}
.tab{flex:1 1 auto;appearance:none;border:0;background:transparent;color:var(--dim);
  font:600 13.5px/1 inherit;letter-spacing:.01em;padding:10px 9px;border-radius:9px;cursor:pointer;
  transition:background .16s,color .16s;white-space:nowrap}
.tab[aria-selected="true"]{background:#26231e;color:var(--ink)}

.grid{display:grid;gap:12px}
.grid>*{min-width:0}
.two{grid-template-columns:repeat(2,1fr)}
.stats{grid-template-columns:repeat(2,minmax(0,1fr))}
@media(min-width:820px){ .stats{grid-template-columns:repeat(4,minmax(0,1fr))} }
@media(min-width:620px){.three{grid-template-columns:repeat(3,1fr)}}

.card{background:linear-gradient(165deg,var(--card2),var(--card));border:1px solid var(--line);
  border-radius:16px;padding:17px 18px;transition:transform .18s cubic-bezier(.2,.9,.3,1),border-color .18s}
.card:hover{border-color:#4a3c32}

/* a section wears its aisle's colour */
.sect{--acc:var(--gold)}
.sect h2{color:var(--acc)}
.sect h2::before{content:'';display:inline-block;width:22px;height:3px;border-radius:99px;
  background:var(--acc);margin-right:9px;vertical-align:middle;opacity:.9}
.sect h2 span{color:var(--faint)}

/* the shelf: a real photograph, or a coloured tile with its letter */
.thumb{width:54px;height:54px;border-radius:11px;flex:none;overflow:hidden;position:relative;
  background:#221f1b;display:grid;place-items:center}
.thumb img{width:100%;height:100%;object-fit:contain;background:#fff;display:block}
.thumb .ltr{font:700 19px/1 inherit;color:#14120f;width:100%;height:100%;display:grid;place-items:center;
  background:var(--acc);opacity:.92}
.row.item{gap:14px}
.klabel{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:0 0 9px}
.big{font-size:clamp(23px,7.2vw,31px);line-height:1;letter-spacing:-.03em;font-weight:600;
  font-variant-numeric:tabular-nums;margin:0}
.sub{font-size:12.5px;color:var(--dim);margin:7px 0 0}
.gold{color:var(--gold)} .good{color:var(--good)} .bad{color:var(--bad)} .warn{color:var(--warn)}

.sect{margin:26px 0 0}
.sect h2{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);
  margin:0 0 11px;font-weight:600;display:flex;justify-content:flex-start;align-items:center;gap:0}
.sect h2 > span{margin-left:auto}
.sect h2 span{color:var(--faint);font-weight:400;letter-spacing:.04em;text-transform:none;font-size:12px}

.row{display:flex;align-items:center;gap:13px;padding:13px 16px;
  background:linear-gradient(165deg,var(--card2),var(--card));
  border:1px solid var(--line);border-radius:14px;margin-bottom:8px;
  transition:transform .16s cubic-bezier(.2,.9,.3,1),border-color .16s,box-shadow .16s}
.row:hover{border-color:color-mix(in srgb,var(--acc,#f0b955) 40%,var(--line));
  box-shadow:0 6px 22px rgba(0,0,0,.34)}
.row:active{transform:scale(.994)}
.row .grow{flex:1;min-width:0}
.rt{font-size:15px;font-weight:500;margin:0;line-height:1.3}
.rt.one{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.rs{font-size:12px;color:var(--dim);margin:3px 0 0}
.amt{font-size:16px;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}

.dot{width:8px;height:8px;border-radius:50%;flex:none}
.pill{font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;font-weight:700;
  padding:4px 9px;border-radius:99px;white-space:nowrap}
.pill.ok{background:rgba(126,209,165,.13);color:var(--good)}
.pill.lo{background:rgba(226,160,63,.14);color:var(--warn)}
.pill.no{background:rgba(224,122,95,.14);color:var(--bad)}

.step{display:flex;align-items:center;gap:2px;flex:none}
.step button{appearance:none;width:33px;height:33px;border-radius:9px;border:1px solid var(--line);
  background:#221f1b;color:var(--ink);font:600 17px/1 inherit;cursor:pointer}
.step button:active{background:#2e2a24}
.qty{min-width:46px;text-align:center;font-variant-numeric:tabular-nums;font-weight:600;font-size:15px}
.qty small{display:block;font-size:10px;font-weight:400;color:var(--faint);letter-spacing:.04em}

.bar{height:3px;background:#262320;border-radius:99px;margin-top:9px;overflow:hidden}
.bar i{display:block;height:100%;border-radius:99px;background:var(--good)}
.bar i.lo{background:var(--warn)} .bar i.no{background:var(--bad)}

@media(min-width:820px){ .find{max-width:420px} }
.groupby{display:flex;gap:3px;padding:3px;background:var(--card);border:1px solid var(--line);
  border-radius:11px;margin:0 0 16px}
@media(min-width:820px){ .groupby{display:inline-flex;margin-right:12px;vertical-align:top} }
.gb{flex:1;appearance:none;border:0;background:transparent;color:var(--dim);cursor:pointer;
  font:600 12.5px/1 inherit;padding:9px 14px;border-radius:8px;white-space:nowrap}
.gb[aria-selected="true"]{background:#26231e;color:var(--ink)}
.brand{color:var(--gold);font-weight:600}
.kitchenhead{display:flex;flex-wrap:wrap;gap:0 12px;align-items:flex-start}
@media(min-width:820px){ .kitchenhead .find{flex:1;min-width:260px;margin-bottom:16px} }
.find{width:100%;appearance:none;background:var(--card);border:1px solid var(--line);
  border-radius:12px;color:var(--ink);font:400 15px/1 inherit;padding:14px 16px;margin:0 0 16px}
.find::placeholder{color:var(--faint)}

.who{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.av{width:46px;height:46px;border-radius:13px;display:grid;place-items:center;
  font:700 14px/1 inherit;color:#17130f;flex:none;overflow:hidden;background:#221b16}
.av svg{width:100%;height:100%;display:block}
.pill.sex{background:#2b221c;color:var(--dim)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.chip{font-size:12.5px;padding:5px 11px;border-radius:99px;background:#221f1b;
  border:1px solid var(--line);color:var(--dim)}
.empty{font-size:13px;color:var(--faint);font-style:italic;margin:0}
.ghost{appearance:none;width:100%;margin-top:13px;background:transparent;color:var(--fav);
  border:1px dashed #3a3630;border-radius:11px;font:600 13px/1 inherit;padding:12px;cursor:pointer}
.ghost:active{background:#211e1a}
.ghost[aria-pressed="true"]{border-style:solid;border-color:var(--fav);background:rgba(199,138,214,.09)}

.scanbar{position:fixed;left:0;right:0;bottom:0;padding:12px 20px calc(14px + env(safe-area-inset-bottom));
  background:linear-gradient(to top,var(--bg) 68%,rgba(18,17,15,0));z-index:20}
@media(min-width:820px){
  .scanbar{left:50%;transform:translateX(-50%);right:auto;bottom:24px;padding:0;
    background:none;width:min(560px,calc(100vw - 64px))}
  .scaninner{gap:8px}
  .modes{box-shadow:0 10px 34px rgba(0,0,0,.55)}
  .scan{padding:15px;font-size:15px}
  .hh{padding-bottom:40px}
}
.scaninner{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:9px}
.modes{display:flex;gap:3px;padding:3px;background:var(--card);border:1px solid var(--line);border-radius:11px}
.mode{flex:1;appearance:none;border:0;background:transparent;color:var(--dim);cursor:pointer;
  font:600 12.5px/1 inherit;padding:9px 6px;border-radius:8px;white-space:nowrap}
.mode[aria-selected="true"]{background:#26231e;color:var(--ink)}
.mode[aria-selected="true"][data-mode="fav"]{color:var(--fav)}
.scan{width:100%;appearance:none;border:0;border-radius:15px;cursor:pointer;
  background:linear-gradient(100deg,var(--gold),var(--mango));color:#17130f;font:700 16px/1 inherit;padding:17px;
  animation:breathe 3.6s ease-in-out infinite;
  display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.scan.fav{background:linear-gradient(100deg,var(--fav),#9a7de0)}
.scan:hover{filter:brightness(1.06)}
.scan:active{transform:translateY(1px)}
.scan svg{width:19px;height:19px;flex:none}
`;

const AISLE_TINT = {
  'Produce':'#7ed1a5', 'Bakery':'#e0b878', 'Deli':'#e39aa6', 'Meat & Seafood':'#e07a5f',
  'Dairy':'#f0e2c0', 'Frozen':'#8fc7e8', 'Aisle 3 · Soup & Canned':'#d9a24a',
  'Aisle 4 · Pasta & Rice':'#e8a552', 'Aisle 5 · Cereal':'#e8c94a',
  'Aisle 6 · Baking & Spices':'#c9a0dc', 'Aisle 7 · Condiments':'#6ec7b8',
  'Aisle 8 · Beverages':'#78c4d6', 'Aisle 9 · Snacks':'#e08fb8',
  'Aisle 12 · Home':'#9aa4b2', 'Unfiled':'#8d857a'
};
const CAT_TINT = {
  'Produce':'#7ed1a5','Bread & Bakery':'#e0b878','Deli & Prepared Food':'#e39aa6','Meat':'#e07a5f',
  'Dairy & Eggs':'#f0e2c0','Frozen':'#8fc7e8','Soups & Canned Goods':'#d9a24a',
  'Rice, Pasta & Beans':'#e8a552','Breakfast':'#e8c94a','Baking & Cooking':'#c9a0dc',
  'Condiments & Sauces':'#6ec7b8','Beverages':'#78c4d6','Snacks':'#e08fb8',
  'Office, Home & Garden':'#9aa4b2','Other':'#8d857a'
};
const AISLE_COLOR = i => (i && (AISLE_TINT[i.aisle] || CAT_TINT[i.category])) || '#e8b45c';

/* --- motion, all of it switched off for anyone who asks --- */
const MOTION = `
@keyframes riseIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
@keyframes breathe{0%,100%{box-shadow:0 8px 30px rgba(0,0,0,.5),0 0 0 0 rgba(240,185,85,0)}
                   50%{box-shadow:0 8px 34px rgba(0,0,0,.5),0 0 0 7px rgba(240,185,85,.07)}}
@keyframes drawBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes pop{0%{transform:scale(1)}42%{transform:scale(1.24)}100%{transform:scale(1)}}
@keyframes fillBar{from{width:0}}
.hh .row,.hh .card{animation:riseIn .42s cubic-bezier(.2,.9,.3,1) both}
.hh .sect h2::before{transform-origin:left center;animation:drawBar .5s cubic-bezier(.2,.9,.3,1) both}
.hh .bar i{animation:fillBar .7s cubic-bezier(.2,.9,.3,1)}
.hh .qty.bump{animation:pop .34s cubic-bezier(.2,.9,.3,1)}
.hh .thumb img{transition:transform .22s cubic-bezier(.2,.9,.3,1)}
.hh .row:hover .thumb img{transform:scale(1.09)}
.hh .tab,.hh .gb,.hh .mode{transition:background .16s,color .16s,transform .16s}
.hh .tab:active,.hh .gb:active,.hh .mode:active{transform:scale(.96)}
@media (prefers-reduced-motion:reduce){
  .hh *,.hh *::before,.hh *::after{animation:none!important;transition:none!important}
}`;

const BASE = 'https://pierceology.github.io/jnoir-elements/';

const SCAN_CSS = `
.scr{position:fixed;inset:0;z-index:100001;background:#0d0b09;display:flex;flex-direction:column;
  color:var(--ink);font:inherit}
.scr video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000}
.scr .veil{position:absolute;inset:0;background:
  linear-gradient(rgba(13,11,9,.72),rgba(13,11,9,.16) 28%,rgba(13,11,9,.16) 72%,rgba(13,11,9,.86))}
.scr .top{position:relative;flex:none;display:flex;align-items:center;justify-content:space-between;
  gap:12px;padding:calc(14px + env(safe-area-inset-top)) 18px 14px}
.scr .what{font:700 15px/1.25 inherit}
.scr .what small{display:block;font:400 12.5px/1.3 inherit;color:var(--dim);margin-top:3px}
.scr .x{appearance:none;border:1px solid rgba(255,255,255,.22);background:rgba(0,0,0,.45);
  color:var(--ink);width:40px;height:40px;border-radius:50%;font:600 19px/1 inherit;cursor:pointer;flex:none}
.scr .frame{position:relative;flex:1;min-height:0;display:grid;place-items:center;padding:0 30px}
.scr .box{position:relative;width:min(86vw,440px);aspect-ratio:1.7;border-radius:18px;
  box-shadow:0 0 0 100vmax rgba(13,11,9,.42)}
.scr .box i{position:absolute;width:30px;height:30px;border:3px solid var(--gold);border-radius:4px}
.scr .box i:nth-child(1){top:-2px;left:-2px;border-right:0;border-bottom:0;border-radius:14px 0 0 0}
.scr .box i:nth-child(2){top:-2px;right:-2px;border-left:0;border-bottom:0;border-radius:0 14px 0 0}
.scr .box i:nth-child(3){bottom:-2px;left:-2px;border-right:0;border-top:0;border-radius:0 0 0 14px}
.scr .box i:nth-child(4){bottom:-2px;right:-2px;border-left:0;border-top:0;border-radius:0 0 14px 0}
.scr .box u{position:absolute;left:8px;right:8px;height:2px;border-radius:2px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);
  animation:sweep 2.1s cubic-bezier(.5,0,.5,1) infinite}
@keyframes sweep{0%,100%{top:10%;opacity:.25}50%{top:88%;opacity:1}}
.scr .note{position:relative;flex:none;text-align:center;padding:0 24px calc(22px + env(safe-area-inset-bottom));
  font-size:13.5px;color:var(--dim);min-height:22px}
.scr.busy .box u{animation:none}

.hit{position:absolute;left:14px;right:14px;bottom:calc(20px + env(safe-area-inset-bottom));
  background:linear-gradient(165deg,var(--card2),var(--card));border:1px solid var(--line);
  border-radius:17px;padding:14px;display:flex;gap:13px;align-items:center;
  box-shadow:0 18px 50px rgba(0,0,0,.6);animation:riseIn .3s cubic-bezier(.2,.9,.3,1) both}
.hit .shot{width:62px;height:62px;border-radius:12px;background:#fff;flex:none;overflow:hidden;
  display:grid;place-items:center}
.hit .shot img{width:100%;height:100%;object-fit:contain}
.hit .shot span{color:#17130f;font:700 22px/1 inherit;width:100%;height:100%;display:grid;
  place-items:center;background:var(--gold)}
.hit .txt{flex:1;min-width:0}
.hit .txt b{display:block;font-size:14.5px;font-weight:600;line-height:1.25}
.hit .txt em{display:block;font-style:normal;font-size:12px;color:var(--dim);margin-top:4px}
.hit{flex-wrap:wrap}
.hit .tick{font:700 12px/1 inherit;letter-spacing:.08em;text-transform:uppercase;
  padding:7px 11px;border-radius:99px;white-space:nowrap;flex:none}
.tick.wide{flex:0 0 100%;text-align:center;margin-top:4px;padding:10px}
.ask{flex:0 0 100%;display:flex;gap:7px;margin-top:2px}
.ask button{flex:1;appearance:none;border:1px solid var(--line);border-radius:11px;cursor:pointer;
  background:#2b221c;color:var(--ink);font:600 13px/1.15 inherit;padding:11px 6px;
  transition:transform .14s,background .14s,border-color .14s}
.ask button:active{transform:scale(.96)}
.ask button b{display:block;font-size:11px;font-weight:700;letter-spacing:.06em;opacity:.62;margin-top:3px}
.ask button[data-act="in"]{border-color:rgba(99,211,160,.45)}
.ask button[data-act="out"]{border-color:rgba(240,176,70,.45)}
.ask button[data-act="fav"]{border-color:rgba(201,138,224,.45)}
.who-pick{flex:0 0 100%;display:flex;flex-wrap:wrap;gap:7px;margin-top:2px}
.who-pick button{flex:1 1 44%;display:flex;align-items:center;gap:8px;appearance:none;cursor:pointer;
  border:1px solid var(--line);border-radius:11px;background:#2b221c;color:var(--ink);
  font:600 13px/1 inherit;padding:8px 10px}
.who-pick .av{width:28px;height:28px;border-radius:8px}
.hit .tick.up{background:rgba(99,211,160,.15);color:var(--good)}
.hit .tick.dn{background:rgba(240,176,70,.15);color:var(--warn)}
.hit .tick.no{background:rgba(240,113,90,.15);color:var(--bad)}
.hit .tick.fv{background:rgba(201,138,224,.15);color:var(--fav)}
`;

/* Drawn here rather than fetched, so they work offline and take the accent. */
const FACE = {
  human: (sex, c) => `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="${c}" opacity=".18"/>
    <circle cx="32" cy="25" r="11" fill="${c}"/>
    ${sex==='f' ? `<path d="M18 26c0-9 6-15 14-15s14 6 14 15c0 4-2 5-2 1 0-7-4-10-12-10s-12 3-12 10c0 4-2 3-2-1z" fill="${c}"/>
                   <path d="M19 24c-2 8-2 14-1 18 2-3 3-8 3-13zM45 24c2 8 2 14 1 18-2-3-3-8-3-13z" fill="${c}"/>`
      : sex==='x' ? `<path d="M19 25c0-8 6-13 13-13s13 5 13 13c0 3-2 4-2 0 0-6-4-9-11-9s-11 3-11 9c0 4-2 3-2 0z" fill="${c}"/>`
                  : `<path d="M20 23c1-8 6-12 12-12s11 4 12 12c-3-4-7-5-12-5s-9 1-12 5z" fill="${c}"/>`}
    <path d="M12 60c2-11 10-17 20-17s18 6 20 17z" fill="${c}"/></svg>`,
  cat: (sex, c) => `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="${c}" opacity=".18"/>
    <path d="M13 30 15 13l13 8zM51 30 49 13l-13 8z" fill="${c}"/>
    <ellipse cx="32" cy="36" rx="${sex==='f'?18:20}" ry="${sex==='f'?17:16}" fill="${c}"/>
    <circle cx="25" cy="33" r="2.7" fill="#17130f"/><circle cx="39" cy="33" r="2.7" fill="#17130f"/>
    <path d="M32 39.5l-2.6 2.2h5.2z" fill="#17130f"/>
    <path d="M30 44c.8 1.2 3.2 1.2 4 0" stroke="#17130f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M14 36h8M14 41h8M50 36h-8M50 41h-8" stroke="#17130f" stroke-width="1.3"
      opacity=".45" stroke-linecap="round"/></svg>`,
  dog: (sex, c) => `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="${c}" opacity=".18"/>
    <path d="M14 20c-4 6-4 16 0 22 3 4 6 1 6-5V22c0-5-3-6-6-2zM50 20c4 6 4 16 0 22-3 4-6 1-6-5V22c0-5 3-6 6-2z" fill="${c}"/>
    <ellipse cx="32" cy="34" rx="17" ry="16" fill="${c}"/>
    <circle cx="26" cy="31" r="2.7" fill="#17130f"/><circle cx="38" cy="31" r="2.7" fill="#17130f"/>
    <ellipse cx="32" cy="40" rx="4.4" ry="3.2" fill="#17130f"/>
    <path d="M32 43.5v3.5M28.5 48c1.8 1.4 5.2 1.4 7 0" stroke="#17130f" stroke-width="1.7"
      fill="none" stroke-linecap="round"/></svg>`
};
const faceFor = (kind, sex, accent) => {
  const k = String(sex||'').toLowerCase()[0];
  return (FACE[kind] || FACE.human)(k === 'f' ? 'f' : k === 'm' ? 'm' : 'x', accent || '#f0b955');
};

const P = n => '$' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const initials = n => String(n).trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
const day = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const num = q => Number(q)%1 ? Number(q).toFixed(2).replace(/0$/,'') : String(Number(q));

class PierceHousehold extends HTMLElement {
  static get observedAttributes(){ return ['household-json','hh-view']; }

  connectedCallback(){
    if (this._built) return;
    this._built = true;
    this.tab = 'today';
    this.mode = 'in';
    this.favPerson = null;
    this.filter = '';
    this.groupBy = 'aisle';
    this.view = this.getAttribute('hh-view') === 'money' ? 'money' : 'house';
    this.tab = this.view === 'money' ? 'overview' : 'today';
    this.data = this.data || {items:[],spend:[],subs:[],people:[],pets:[]};
    const s = document.createElement('style'); s.textContent = CSS + MOTION + SCAN_CSS;
    this.root = document.createElement('div'); this.root.className = 'hh';
    this.appendChild(s); this.appendChild(this.root);
    this.addEventListener('click', e => this.onClick(e));
    this.addEventListener('input', e => {
      if (!e.target.matches('.find')) return;
      this.filter = e.target.value;
      this.paint('kitchenBody');
    });
    this.render();
    this.mark('ready');
  }

  attributeChangedCallback(n,o,v){
    if (n === 'hh-view'){
      this.view = v === 'money' ? 'money' : 'house';
      this.tab = this.view === 'money' ? 'overview' : 'today';
      if (this._built) this.render();
      return;
    }
    if (n !== 'household-json' || !v) return;
    try { this.data = JSON.parse(v); } catch(_) { return this.mark('bad-json'); }
    if (this._built) this.render();
    const d = this.data;
    this.mark(`data:${(d.items||[]).length}i/${(d.spend||[]).length}s/${(d.pets||[]).length}p`);
  }

  mark(v){ this.setAttribute('hh-state', v); }

  onClick(e){
    const tab = e.target.closest('[data-tab]');
    if (tab){ this.tab = tab.dataset.tab; this.render(); return; }

    const g = e.target.closest('[data-groupby]');
    if (g){ this.groupBy = g.dataset.groupby; this.render(); this.mark('groupby:'+this.groupBy); return; }

    const m = e.target.closest('[data-mode]');
    if (m){
      this.mode = m.dataset.mode;
      if (this.mode !== 'fav') this.favPerson = null;
      else if (!this.favPerson) this.favPerson = (this.data.people||[])[0]?.title || null;
      this.render(); return;
    }

    const f = e.target.closest('[data-fav]');
    if (f){
      const who = f.dataset.fav;
      const on = this.mode === 'fav' && this.favPerson === who;
      this.mode = on ? 'in' : 'fav';
      this.favPerson = on ? null : who;
      this.render();
      this.mark('fav-mode:' + (this.favPerson || 'off'));
      return;
    }

    const b = e.target.closest('[data-step]');
    if (b){
      const it = (this.data.items||[]).find(x => x._id === b.dataset.id);
      if (!it) return;
      const inc = Number(b.dataset.step) * (String(it.unit).toUpperCase() === 'LB' ? 0.25 : 1);
      it.qty = Math.max(0, Math.round(((+it.qty||0) + inc) * 100) / 100);
      this.render();
      const q = this.root.querySelector(`[data-step][data-id="${it._id}"]`)?.parentNode?.querySelector('.qty');
      if (q) { q.classList.add('bump'); setTimeout(()=>q.classList.remove('bump'), 360); }
      this.dispatchEvent(new CustomEvent('hh-qty',{detail:{id:it._id,qty:it.qty},bubbles:true}));
      this.mark(`qty:${it._id}:${it.qty}`);
      return;
    }

    if (e.target.closest('[data-close-scan]')){ this.closeScanner(); return; }

    const act = e.target.closest('[data-act]');
    if (act){ this.decide(act.dataset.act); return; }

    const pick = e.target.closest('[data-pick]');
    if (pick){ this.decide('fav', pick.dataset.pick); return; }

    if (e.target.closest('[data-scan]')){
      this.openScanner();
      const detail = {mode:this.mode, person:this.favPerson};
      this.dispatchEvent(new CustomEvent(this.mode === 'fav' ? 'hh-fav' : 'hh-scan',{detail,bubbles:true}));
      this.mark('scan:' + this.mode + (this.favPerson ? ':' + this.favPerson : ''));
    }
  }

  /* ---------- the scanner ---------- */
  norm(code){
    const d = String(code).replace(/\D/g,'');
    const out = [];
    [d, d.replace(/^0+/,''), d.slice(0,-1), d.slice(0,-1).replace(/^0+/,'')]
      .forEach(v => { const k = v.replace(/^0+/,'') || v; if (k && !out.includes(k)) out.push(k); });
    return out;
  }

  async catalogue(){
    if (this._cat) return this._cat;
    const r = await fetch(BASE + 'catalog.min.json');
    this._cat = await r.json();
    return this._cat;
  }

  async decoder(){
    if (this._dec) return this._dec;
    if ('BarcodeDetector' in window){
      try {
        const fmts = await window.BarcodeDetector.getSupportedFormats();
        const want = ['upc_a','ean_13','upc_e','ean_8','code_128'].filter(f => fmts.includes(f));
        if (want.length){
          const det = new window.BarcodeDetector({formats: want});
          this._dec = {kind:'native', read: async v => {
            const c = await det.detect(v);
            return c.length ? c[0].rawValue : null;
          }};
          return this._dec;
        }
      } catch(_) {}
    }
    await new Promise((ok,bad) => {                       // iPhone path
      if (window.ZXing) return ok();
      const t = document.createElement('script');
      t.src = BASE + 'zxing.js'; t.onload = ok; t.onerror = bad;
      document.head.appendChild(t);
    });
    const hints = new Map();
    const F = window.ZXing.BarcodeFormat;
    hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS,
      [F.UPC_A, F.EAN_13, F.UPC_E, F.EAN_8, F.CODE_128]);
    const reader = new window.ZXing.MultiFormatReader();
    reader.setHints(hints);
    const cv = document.createElement('canvas');
    this._dec = {kind:'zxing', read: v => {
      const w = v.videoWidth, h = v.videoHeight;
      if (!w || !h) return null;
      cv.width = w; cv.height = h;
      const cx = cv.getContext('2d', {willReadFrequently:true});
      cx.drawImage(v, 0, 0, w, h);
      const data = cx.getImageData(0, 0, w, h).data;
      const lum = new Uint8ClampedArray(w*h);
      for (let i=0, j=0; i<data.length; i+=4, j++)
        lum[j] = (data[i]*0.299 + data[i+1]*0.587 + data[i+2]*0.114) | 0;
      try {
        const src = new window.ZXing.RGBLuminanceSource(lum, w, h);
        const bmp = new window.ZXing.BinaryBitmap(new window.ZXing.HybridBinarizer(src));
        return reader.decode(bmp).getText();
      } catch(_) { return null; } finally { reader.reset(); }
    }};
    return this._dec;
  }

  say(msg){ const el = this.root.querySelector('.scr .note'); if (el) el.textContent = msg; }

  async openScanner(){
    if (this._scr) return;
    const title = 'Scan anything';
    const sub = "I'll tell you what it is, then ask what you're doing with it.";
    const w = document.createElement('div');
    w.className = 'scr';
    w.innerHTML = `
      <video playsinline muted autoplay></video><div class="veil"></div>
      <div class="top"><div class="what">${esc(title)}<small>${esc(sub)}</small></div>
        <button class="x" data-close-scan aria-label="close">&times;</button></div>
      <div class="frame"><div class="box"><i></i><i></i><i></i><i></i><u></u></div></div>
      <div class="note">Starting the camera…</div>`;
    this.root.appendChild(w);
    this._scr = w;
    this.mark('scanner:open:' + this.mode);

    const video = w.querySelector('video');
    try {
      this._stream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:'environment'}, width:{ideal:1280}, height:{ideal:720}}, audio:false});
      video.srcObject = this._stream;
      await video.play();
    } catch(err){
      this.say('No camera. ' + (err && err.name === 'NotAllowedError'
        ? 'Allow camera access for this page and try again.' : 'This device would not open one.'));
      this.mark('scanner:no-camera'); return;
    }

    this.say('Loading the store catalogue…');
    let cat, dec;
    try { [cat, dec] = await Promise.all([this.catalogue(), this.decoder()]); }
    catch(_) { this.say('Could not load the scanner. Check the connection.'); return; }
    this.say('Point it at a barcode.');
    this.mark('scanner:ready:' + dec.kind);

    this._seen = 0;
    const tick = async () => {
      if (!this._scr) return;
      if (!w.classList.contains('busy')){
        let code = null;
        try { code = await dec.read(video); } catch(_) {}
        if (code && code !== this._lastCode) this.onCode(code, cat);
      }
      this._raf = setTimeout(tick, dec.kind === 'native' ? 180 : 240);
    };
    tick();
  }

  onCode(code, cat){
    const w = this._scr; if (!w) return;
    this._lastCode = code;
    setTimeout(()=>{ if (this._lastCode === code) this._lastCode = null; }, 2200);
    w.classList.add('busy');
    if (navigator.vibrate) { try { navigator.vibrate(18); } catch(_) {} }

    let prod = null, key = null;
    for (const k of this.norm(code)) if (cat.items[k]) { prod = cat.items[k]; key = k; break; }

    const old = w.querySelector('.hit'); if (old) old.remove();
    const card = document.createElement('div');
    card.className = 'hit';

    if (!prod){
      card.innerHTML = `<span class="shot"><span>?</span></span>
        <div class="txt"><b>Not in the store catalogue</b>
          <em>${esc(code)} — add it by hand and the next scan will know it.</em></div>
        <span class="tick no">unknown</span>`;
      this.mark('scan:miss:' + code);
    } else {
      const aisle = cat.aisles[prod.a] || prod.d || '';
      this._pending = {upc:key, code, product:prod, aisle,
        aisleOrder: /^\d+$/.test(prod.a) ? 5 : 20 + (parseInt(prod.a,10) || 50)};
      card.innerHTML = `
        <span class="shot">${prod.i ? `<img src="${esc(prod.i)}" alt="">`
                                    : `<span>${esc(prod.n.trim()[0]||'?')}</span>`}</span>
        <div class="txt"><b>${esc(prod.n)}</b>
          <em>${[prod.b, prod.s, aisle, prod.p != null ? P(prod.p) : ''].filter(Boolean).map(esc).join(' · ')}</em></div>
        <div class="ask">
          <button data-act="in">Putting away<b>+1</b></button>
          <button data-act="out">Using<b>&minus;1</b></button>
          <button data-act="fav">Favourite<b>WHOSE?</b></button>
        </div>`;
      this.say('Which is it?');
      this.mark('scan:hit:' + key);
    }
    w.appendChild(card);
    if (!prod){
      this.say('Point it at a barcode.');
      setTimeout(()=>{ if (this._scr) this._scr.classList.remove('busy'); }, 1200);
    }
  }

  /* the answer to "adding or leaving?" — nothing is written until this runs */
  decide(mode, person){
    const p = this._pending; if (!p) return;
    const card = this._scr && this._scr.querySelector('.hit'); if (!card) return;

    if (mode === 'fav' && !person && this.favPerson) person = this.favPerson;
    if (mode === 'fav' && !person){
      const people = (this.data.people||[]).slice().sort((a,b)=>(+a.sortOrder||0)-(+b.sortOrder||0));
      const ask = card.querySelector('.ask');
      if (ask) ask.outerHTML = `<div class="who-pick">${people.map(w=>
        `<button data-pick="${esc(w.title)}"><span class="av">${faceFor('human', w.sex, w.accent)}</span>${
          esc(w.title.split(' ')[0])}</button>`).join('')}</div>`;
      this.say('Whose favourite?');
      return;
    }

    const word = mode === 'fav' ? (person ? person.split(' ')[0] + "'s favourite" : 'favourite')
               : mode === 'out' ? 'taken out' : 'put away';
    const cls  = mode === 'fav' ? 'fv' : mode === 'out' ? 'dn' : 'up';
    const tail = card.querySelector('.ask') || card.querySelector('.who-pick');
    if (tail) tail.outerHTML = `<span class="tick wide ${cls}">${esc(word)}</span>`;

    this.dispatchEvent(new CustomEvent('hh-scanned',{bubbles:true,
      detail:Object.assign({mode, person: person || null}, p)}));
    this._seen = (this._seen||0) + 1;
    this._pending = null;
    this.mark('scan:' + mode + ':' + p.upc);
    this.say(`${this._seen} done. Next one.`);
    if (navigator.vibrate) { try { navigator.vibrate([10,40,10]); } catch(_) {} }
    if (this._scr) this._scr.classList.remove('busy');
  }

  closeScanner(){
    if (this._raf) { clearTimeout(this._raf); this._raf = null; }
    if (this._stream) { this._stream.getTracks().forEach(t=>t.stop()); this._stream = null; }
    if (this._scr) { this._scr.remove(); this._scr = null; }
    this._lastCode = null;
    this.mark('scanner:closed:' + (this._seen||0));
    this.dispatchEvent(new CustomEvent('hh-scan-done',{bubbles:true,detail:{count:this._seen||0}}));
  }

  /* ---------- derived ---------- */
  low(){ return (this.data.items||[]).filter(i => (+i.qty||0) <= (+i.par||0)); }
  since(days){
    const cut = Date.now() - days*864e5;
    return (this.data.spend||[]).filter(s => !s.declined && new Date(s.spentOn).getTime() >= cut);
  }
  sum(rows){ return rows.reduce((a,s)=>a+(+s.amount||0),0); }
  byCat(rows){
    const m = {};
    rows.forEach(s => { const k = s.category||'Other'; m[k] = (m[k]||0) + (+s.amount||0); });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  }
  subsTotal(){ return (this.data.subs||[]).filter(s=>s.status!=='SUSPENDED').reduce((a,s)=>a+(+s.amount||0),0); }

  /* ---------- pieces ---------- */
  itemRow(i){
    const q = +i.qty||0, par = +i.par||0, ceil = Math.max(par*3, q, 1);
    const cls = q === 0 ? 'no' : q <= par ? 'lo' : 'ok';
    const gone = q === 0 && /OUT OF STOCK/.test(i.notes||'');
    const img = (i.image||'').trim();
    const thumb = img
      ? `<span class="thumb"><img src="${esc(img)}" alt="" loading="lazy"
           onerror="this.parentNode.innerHTML='<span class=&quot;ltr&quot;>${esc(i.title.trim()[0]||'?')}</span>'"></span>`
      : `<span class="thumb"><span class="ltr">${esc(i.title.trim()[0]||'?')}</span></span>`;
    return `<div class="row item" style="--acc:${AISLE_COLOR(i)}">${thumb}
      <div class="grow">
        <p class="rt">${esc(i.title)}</p>
        <p class="rs">${gone ? '<span class="bad">never delivered</span> · ' : ''}${
          i.brand ? `<span class="brand">${esc(i.brand)}</span> · ` : ''}${esc(i.aisle||i.category||'')}${
          i.upc ? ` · ${esc(i.upc)}` : ''}${
          (this.view==='money' && i.lastPrice) ? ` · ${P(+i.lastPrice)}${i.lastStore?` at ${esc(i.lastStore)}`:''}` : ''}</p>
        <div class="bar"><i class="${cls}" style="width:${Math.min(100,q/ceil*100)}%"></i></div>
      </div>
      <div class="step">
        <button data-step="-1" data-id="${esc(i._id)}" aria-label="one less">&#8722;</button>
        <span class="qty">${num(q)}${i.unit?`<small>${esc(i.unit)}</small>`:''}</span>
        <button data-step="1" data-id="${esc(i._id)}" aria-label="one more">+</button>
      </div></div>`;
  }

  catRows(rows){
    const cats = this.byCat(rows), top = cats[0] ? cats[0][1] : 1;
    if (!cats.length) return `<div class="card"><p class="empty">No spending in this window.</p></div>`;
    return `<div class="rows pair">` + cats.map(([c,v])=>`<div class="row">
      <div class="grow"><p class="rt one">${esc(c)}</p>
        <div class="bar"><i style="width:${v/top*100}%;background:var(--gold)"></i></div></div>
      <span class="amt">${P(v)}</span></div>`).join('') + `</div>`;
  }

  /* ---------- tabs ---------- */
  house(){
    const items = this.data.items||[], low = this.low();
    const pets = (this.data.pets||[]).length;
    const floors = new Set(items.map(i=>i.location||'Kitchen'));
    const noUpc = items.filter(i => !(i.upc||'').trim()).length;
    const gone = items.filter(i => /OUT OF STOCK/.test(i.notes||''));
    return `
      <div class="grid stats">
        <div class="card"><p class="klabel">In the house</p><p class="big" data-to="${items.length}">${items.length}</p>
          <p class="sub">${floors.size} location${floors.size===1?'':'s'}</p></div>
        <div class="card"><p class="klabel">Running low</p><p class="big ${low.length?'warn':''}" data-to="${low.length}">${low.length}</p>
          <p class="sub">${low.length?'need replacing':'all above par'}</p></div>
        <div class="card"><p class="klabel">Animals</p><p class="big" data-to="${pets}">${pets}</p>
          <p class="sub">${(this.data.pets||[]).filter(p=>!p.food).length} with no food on file</p></div>
        <div class="card"><p class="klabel">Not scanned</p><p class="big" data-to="${noUpc}">${noUpc}</p>
          <p class="sub">no barcode yet</p></div>
      </div>
      <div class="sect"><h2>Running low${low.length?`<span>${low.length}</span>`:''}</h2>${
        low.length ? `<div class="rows">${low.map(i=>this.itemRow(i)).join('')}</div>`
                   : `<div class="card"><p class="empty">Nothing below par. The kitchen is stocked.</p></div>`}</div>
      ${gone.length ? `<div class="sect"><h2>Ordered, never turned up</h2><div class="rows">${
        gone.map(i=>this.itemRow(i)).join('')}</div></div>` : ''}`;
  }

  today(){
    const week = this.since(7), month = this.since(30), low = this.low();
    const declined = (this.data.spend||[]).filter(s=>s.declined).length;
    const flags = [
      ...(this.data.subs||[]).filter(s => s.status==='check'||s.status==='declined'||s.status==='SUSPENDED')
        .map(s=>({t:s.title, n:s.note||s.status, bad:s.status==='SUSPENDED'})),
      ...(this.data.spend||[]).filter(s=>s.note).map(s=>({t:s.title+' · '+day(s.spentOn), n:s.note, bad:true}))
    ];
    return `
      <div class="grid stats">
        <div class="card"><p class="klabel">Last 7 days</p><p class="big" data-to="${this.sum(week)}" data-money="1">${P(this.sum(week))}</p>
          <p class="sub">${week.length} purchase${week.length===1?'':'s'}</p></div>
        <div class="card"><p class="klabel">Last 30 days</p><p class="big" data-to="${this.sum(month)}" data-money="1">${P(this.sum(month))}</p>
          <p class="sub">${declined ? `<span class="bad">${declined} declined</span>` : 'nothing declined'}</p></div>
        <div class="card"><p class="klabel">Subscriptions</p><p class="big" data-to="${this.subsTotal()}" data-money="1">${P(this.subsTotal())}</p>
          <p class="sub">every month</p></div>
        <div class="card"><p class="klabel">In the kitchen</p><p class="big" data-to="${(this.data.items||[]).length}">${(this.data.items||[]).length}</p>
          <p class="sub">${low.length ? `<span class="warn">${low.length} running low</span>` : 'all above par'}</p></div>
      </div>
      ${flags.length ? `<div class="sect"><h2>Needs a look</h2><div class="rows pair">${flags.map(f=>`
        <div class="row"><span class="dot" style="background:var(--${f.bad?'bad':'warn'})"></span>
          <div class="grow"><p class="rt">${esc(f.t)}</p><p class="rs">${esc(f.n)}</p></div>
        </div>`).join('')}</div></div>` : ''}
      <div class="sect"><h2>Where it went, 30 days</h2>${this.catRows(month)}</div>`;
  }

  kitchenBody(){
    const q = this.filter.trim().toLowerCase();
    let items = this.data.items||[];
    if (q) items = items.filter(i => (i.title+' '+(i.category||'')).toLowerCase().includes(q));
    if (!items.length) return `<div class="card"><p class="empty">${
      q ? 'Nothing matches “'+esc(this.filter)+'”.'
        : 'Nothing in the kitchen yet — scan the first thing you unpack and it lands here.'}</p></div>`;
    const key = i => this.groupBy==='aisle' ? (i.aisle||'Unfiled')
                   : this.groupBy==='brand' ? (i.brand||'Store brand / loose')
                   : (i.category||'Other');
    const order = {};
    const groups = {};
    items.forEach(i => {
      const k = key(i);
      (groups[k] = groups[k]||[]).push(i);
      if (this.groupBy==='aisle') order[k] = +i.aisleOrder||99;
    });
    const sorted = Object.entries(groups).sort((a,b)=>
      this.groupBy==='aisle' ? (order[a[0]]-order[b[0]]) || a[0].localeCompare(b[0])
      : this.groupBy==='brand' ? (b[1].length-a[1].length) || a[0].localeCompare(b[0])
      : a[0].localeCompare(b[0]));
    return sorted.map(([c,list]) =>
      `<div class="sect" style="--acc:${AISLE_COLOR(list[0])}"><h2>${esc(c)}<span>${list.length}</span></h2><div class="rows">${
        list.sort((a,b)=>a.title.localeCompare(b.title)).map(i=>this.itemRow(i)).join('')}</div></div>`).join('');
  }

  kitchen(){
    const items = this.data.items||[];
    const n = items.length;
    const noUpc = items.filter(i => !(i.upc||'').trim()).length;
    const gb = [['aisle','By aisle'],['category','By category'],['brand','By brand']];
    return `<div class="kitchenhead">
        <div class="groupby" role="tablist">${gb.map(([k,l])=>
          `<button class="gb" role="tab" data-groupby="${k}" aria-selected="${this.groupBy===k}">${l}</button>`).join('')}</div>
        <input class="find" placeholder="Find anything — ${n} items" value="${esc(this.filter)}">
      </div>
      ${this.groupBy==='aisle' ? `<p class="rs" style="margin:-6px 0 16px">Aisles come from the real
        Stop &amp; Shop on Furlong Drive. Ones marked <em>likely</em> are where that department lives,
        not that exact product — correct any of them and it sticks.</p>` : ''}
      ${noUpc ? `<p class="rs" style="margin:-6px 0 16px">${noUpc} of ${n} have no barcode yet.
        The first scan of anything binds its UPC for good.</p>` : ''}
      <div id="kitchenBody">${this.kitchenBody()}</div>`;
  }

  money(){
    const all = (this.data.spend||[]).slice().sort((a,b)=>new Date(b.spentOn)-new Date(a.spentOn));
    const groc = this.since(30).filter(s=>s.category==='Groceries').reduce((a,s)=>a+(+s.amount||0),0);
    return `
      <div class="grid two">
        <div class="card"><p class="klabel">30 days</p><p class="big" data-to="${this.sum(this.since(30))}" data-money="1">${P(this.sum(this.since(30)))}</p></div>
        <div class="card"><p class="klabel">Groceries, 30 days</p><p class="big" data-to="${groc}" data-money="1">${P(groc)}</p></div>
      </div>
      <div class="sect"><h2>Every purchase</h2><div class="rows">${all.map(s=>`
        <div class="row"><span class="dot" style="background:var(--${s.declined?'bad':'faint'})"></span>
          <div class="grow"><p class="rt one">${esc(s.title)}</p>
            <p class="rs">${day(s.spentOn)} · ${esc(s.source)}${s.declined?' · <span class="bad">declined</span>':''}</p></div>
          <span class="amt">${P(+s.amount||0)}</span></div>`).join('')}</div></div>`;
  }

  subs(){
    const list = (this.data.subs||[]).slice().sort((a,b)=>(+b.amount||0)-(+a.amount||0));
    const t = this.subsTotal();
    return `
      <div class="grid two">
        <div class="card"><p class="klabel">Every month</p><p class="big" data-to="${t}" data-money="1">${P(t)}</p>
          <p class="sub">${list.length} service${list.length===1?'':'s'}</p></div>
        <div class="card"><p class="klabel">Every year</p><p class="big" data-to="${t*12}" data-money="1">${P(t*12)}</p>
          <p class="sub">at today's rate</p></div>
      </div>
      <div class="sect"><h2>What renews</h2><div class="rows pair">${list.map(s=>{
        const k = s.status==='active' ? 'ok' : s.status==='SUSPENDED' ? 'no' : 'lo';
        return `<div class="row"><div class="grow">
            <p class="rt">${esc(s.title)}</p>
            <p class="rs">${esc(s.payMethod||'')}${s.note?` · ${esc(s.note)}`:''}</p></div>
          <span class="pill ${k}">${esc(s.status)}</span>
          <span class="amt">${P(+s.amount||0)}</span></div>`;}).join('')}</div></div>`;
  }

  us(){
    const people = (this.data.people||[]).slice().sort((a,b)=>(+a.sortOrder||0)-(+b.sortOrder||0));
    return `<div class="grid three">${people.map(p=>{
      const fav = String(p.favourites||'').split(',').map(s=>s.trim()).filter(Boolean);
      const no  = String(p.avoid||'').split(',').map(s=>s.trim()).filter(Boolean);
      const armed = this.mode==='fav' && this.favPerson===p.title;
      return `<div class="card">
        <div class="who"><span class="av">${faceFor('human', p.sex, p.accent)}</span>
          <div><p class="rt">${esc(p.title)}</p>
            <p class="rs">${fav.length} favourite${fav.length===1?'':'s'}</p></div></div>
        ${fav.length ? `<div class="chips">${fav.map(f=>`<span class="chip">${esc(f)}</span>`).join('')}</div>`
                     : `<p class="empty">No favourites yet. Hit the button, then scan whatever ${esc(p.title.split(' ')[0])} loves.</p>`}
        ${no.length ? `<p class="klabel" style="margin:14px 0 7px">Never buy</p>
          <div class="chips">${no.map(f=>`<span class="chip">${esc(f)}</span>`).join('')}</div>` : ''}
        <button class="ghost" data-fav="${esc(p.title)}" aria-pressed="${armed}">${
          armed ? 'Scanning favourites — tap to stop' : `Scan ${esc(p.title.split(' ')[0])}'s favourites`}</button>
      </div>`;}).join('')}</div>`;
  }

  pets(){
    const pets = (this.data.pets||[]).slice().sort((a,b)=>(+a.sortOrder||0)-(+b.sortOrder||0));
    if (!pets.length) return `<div class="card"><p class="empty">No animals on file.</p></div>`;
    const floors = {};
    pets.forEach(p => { const k = p.floor||'House'; (floors[k] = floors[k]||[]).push(p); });
    return Object.entries(floors).map(([f,list])=>`
      <div class="sect"><h2>${esc(f)}<span>${list.length}</span></h2><div class="rows pair">${list.map(p=>`
        <div class="row" style="--acc:${esc(p.accent || (p.species==='Dog' ? '#e8a552' : '#7fb4d8'))}">
          <span class="av">${faceFor(p.species==='Dog'?'dog':'cat', p.sex, p.accent || (p.species==='Dog'?'#e8a552':'#7fb4d8'))}</span>
          <div class="grow"><p class="rt">${esc(p.title)}</p>
            <p class="rs">${[p.species==='?'?'species unconfirmed':p.species, p.sex,
              p.sibling?`${p.sex==='Female'?'sister':p.sex==='Male'?'brother':'sibling'} of ${esc(p.sibling)}`:''].filter(Boolean).map(esc).join(' · ')}</p>
            ${p.note?`<p class="rs">${esc(p.note)}</p>`:''}</div>
          ${p.food?`<span class="pill ok">${esc(p.food)}</span>`:`<span class="pill lo">no food on file</span>`}
        </div>`).join('')}</div></div>`).join('');
  }

  animate(){
    const els = this.root.querySelectorAll('.card, .row');
    els.forEach((el,i) => { el.style.animationDelay = Math.min(i*26, 520) + 'ms'; });
    this.root.querySelectorAll('.big[data-to]').forEach(el => this.countUp(el));
  }

  countUp(el){
    const to = parseFloat(el.dataset.to), money = el.dataset.money === '1';
    if (!isFinite(to)) return;
    const dur = 780, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur);
      const v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = money ? P(v) : Math.round(v).toLocaleString('en-US');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  paint(id){
    const el = this.root.querySelector('#'+id);
    if (el) el.innerHTML = this[id]();
  }

  render(){
    const tabs = this.view === 'money'
      ? [['overview','Overview'],['money','Purchases'],['subs','Subscriptions']]
      : [['today','Today'],['kitchen','Kitchen'],['us','Us'],['pets','Pets']];
    const views = { today:()=>this.house(), overview:()=>this.today(), kitchen:()=>this.kitchen(),
                    money:()=>this.money(), subs:()=>this.subs(), us:()=>this.us(), pets:()=>this.pets() };
    const body = (views[this.tab] || views[tabs[0][0]])();
    const label = this.mode === 'fav' && this.favPerson
      ? `Scan ${this.favPerson.split(' ')[0]}'s favourites`
      : 'Scan an item';

    this.root.className = 'hh' + (this.view === 'money' ? ' money' : '');
    this.root.innerHTML = `
      <div class="wrap">
        <header class="top">
          <div><p class="name">Pierce Household</p><h1 class="h1">${
            this.view === 'money' ? 'Expenses' : 'Dashboard'}</h1></div>
          <p class="when">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
        </header>
        <div class="tabs" role="tablist">${tabs.map(([k,l])=>
          `<button class="tab" role="tab" data-tab="${k}" aria-selected="${this.tab===k}">${l}</button>`).join('')}</div>
        ${body}
      </div>
      ${this.view === 'money' ? '' : `<div class="scanbar"><div class="scaninner">
        <button class="scan${this.mode==='fav'?' fav':''}" data-scan>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
            <path d="M7 8v8M10.5 8v8M14 8v8M17 8v8"/></svg>
          ${esc(label)}</button>
      </div></div>`}`;
    this.animate();
  }
}

if (!customElements.get('pierce-household')) customElements.define('pierce-household', PierceHousehold);
if (!customElements.get('wix-default-custom-element'))
  customElements.define('wix-default-custom-element', class extends PierceHousehold {});
