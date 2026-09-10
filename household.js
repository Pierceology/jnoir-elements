/* Pierce Household Dashboard — one element, whole page.
   Data in:   household-json   (attribute, set by page code from the CMS)
   State out: hh-state         (attribute) + hh-qty / hh-scan / hh-fav events
   Scan modes: in (putting away, +1) · out (using, -1) · fav (tag a person, qty untouched) */

const CSS = `
:host, .hh * { box-sizing: border-box; }
.hh{
  --ink:#f4f1ea; --dim:#9a948a; --faint:#5e594f;
  --bg:#12110f; --card:#1a1815; --line:#2b2823;
  --gold:#e8b45c; --good:#7ed1a5; --warn:#e2a03f; --bad:#e07a5f; --fav:#c78ad6;
  background:var(--bg); color:var(--ink); min-height:100vh; min-height:100svh;
  font:400 16px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif;
  -webkit-font-smoothing:antialiased; padding:0 0 132px; text-wrap:pretty;
}
.hh ::-webkit-scrollbar{width:0;height:0}
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

.card{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:17px 18px}
.klabel{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin:0 0 9px}
.big{font-size:clamp(23px,7.2vw,31px);line-height:1;letter-spacing:-.03em;font-weight:600;
  font-variant-numeric:tabular-nums;margin:0}
.sub{font-size:12.5px;color:var(--dim);margin:7px 0 0}
.gold{color:var(--gold)} .good{color:var(--good)} .bad{color:var(--bad)} .warn{color:var(--warn)}

.sect{margin:26px 0 0}
.sect h2{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);
  margin:0 0 11px;font-weight:600;display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.sect h2 span{color:var(--faint);font-weight:400;letter-spacing:.04em;text-transform:none;font-size:12px}

.row{display:flex;align-items:center;gap:13px;padding:13px 16px;background:var(--card);
  border:1px solid var(--line);border-radius:13px;margin-bottom:8px}
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
.av{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;
  font:700 14px/1 inherit;color:#12110f;flex:none}
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
  .scanbar{left:auto;right:32px;bottom:24px;padding:0;background:none;width:340px}
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
.scan{width:100%;appearance:none;border:0;border-radius:14px;cursor:pointer;
  background:var(--gold);color:#12110f;font:700 16px/1 inherit;padding:17px;
  display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 30px rgba(0,0,0,.5)}
.scan.fav{background:var(--fav)}
.scan:active{transform:translateY(1px)}
.scan svg{width:19px;height:19px;flex:none}
`;

const P = n => '$' + Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc = s => String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const initials = n => String(n).trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
const day = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const num = q => Number(q)%1 ? Number(q).toFixed(2).replace(/0$/,'') : String(Number(q));

class PierceHousehold extends HTMLElement {
  static get observedAttributes(){ return ['household-json']; }

  connectedCallback(){
    if (this._built) return;
    this._built = true;
    this.tab = 'today';
    this.mode = 'in';
    this.favPerson = null;
    this.filter = '';
    this.groupBy = 'aisle';
    this.data = this.data || {items:[],spend:[],subs:[],people:[],pets:[]};
    const s = document.createElement('style'); s.textContent = CSS;
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
      this.dispatchEvent(new CustomEvent('hh-qty',{detail:{id:it._id,qty:it.qty},bubbles:true}));
      this.mark(`qty:${it._id}:${it.qty}`);
      return;
    }

    if (e.target.closest('[data-scan]')){
      const detail = {mode:this.mode, person:this.favPerson};
      this.dispatchEvent(new CustomEvent(this.mode === 'fav' ? 'hh-fav' : 'hh-scan',{detail,bubbles:true}));
      this.mark('scan:' + this.mode + (this.favPerson ? ':' + this.favPerson : ''));
    }
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
    return `<div class="row">
      <div class="grow">
        <p class="rt">${esc(i.title)}</p>
        <p class="rs">${gone ? '<span class="bad">never delivered</span> · ' : ''}${
          i.brand ? `<span class="brand">${esc(i.brand)}</span> · ` : ''}${esc(i.aisle||i.category||'')}${
          i.upc ? ` · ${esc(i.upc)}` : ''}${
          i.lastPrice ? ` · ${P(+i.lastPrice)}${i.lastStore?` at ${esc(i.lastStore)}`:''}` : ''}</p>
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
        <div class="card"><p class="klabel">Last 7 days</p><p class="big">${P(this.sum(week))}</p>
          <p class="sub">${week.length} purchase${week.length===1?'':'s'}</p></div>
        <div class="card"><p class="klabel">Last 30 days</p><p class="big">${P(this.sum(month))}</p>
          <p class="sub">${declined ? `<span class="bad">${declined} declined</span>` : 'nothing declined'}</p></div>
        <div class="card"><p class="klabel">Subscriptions</p><p class="big">${P(this.subsTotal())}</p>
          <p class="sub">every month</p></div>
        <div class="card"><p class="klabel">In the kitchen</p><p class="big">${(this.data.items||[]).length}</p>
          <p class="sub">${low.length ? `<span class="warn">${low.length} running low</span>` : 'all above par'}</p></div>
      </div>
      <div class="sect"><h2>Running low${low.length?`<span>${low.length}</span>`:''}</h2>${
        low.length ? `<div class="rows">${low.map(i=>this.itemRow(i)).join('')}</div>`
                   : `<div class="card"><p class="empty">Nothing below par. The kitchen is stocked.</p></div>`}</div>
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
      `<div class="sect"><h2>${esc(c)}<span>${list.length}</span></h2><div class="rows">${
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
      ${this.groupBy==='aisle' ? `<p class="rs" style="margin:-6px 0 16px">Walk order is a standard
        Stop &amp; Shop layout, not Winthrop's measured aisles — correct any of them and it sticks.</p>` : ''}
      ${noUpc ? `<p class="rs" style="margin:-6px 0 16px">${noUpc} of ${n} have no barcode yet.
        The first scan of anything binds its UPC for good.</p>` : ''}
      <div id="kitchenBody">${this.kitchenBody()}</div>`;
  }

  money(){
    const all = (this.data.spend||[]).slice().sort((a,b)=>new Date(b.spentOn)-new Date(a.spentOn));
    const groc = this.since(30).filter(s=>s.category==='Groceries').reduce((a,s)=>a+(+s.amount||0),0);
    return `
      <div class="grid two">
        <div class="card"><p class="klabel">30 days</p><p class="big">${P(this.sum(this.since(30)))}</p></div>
        <div class="card"><p class="klabel">Groceries, 30 days</p><p class="big">${P(groc)}</p></div>
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
        <div class="card"><p class="klabel">Every month</p><p class="big">${P(t)}</p>
          <p class="sub">${list.length} service${list.length===1?'':'s'}</p></div>
        <div class="card"><p class="klabel">Every year</p><p class="big">${P(t*12)}</p>
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
        <div class="who"><span class="av" style="background:${esc(p.accent||'#e8b45c')}">${initials(p.title)}</span>
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
        <div class="row">
          <span class="dot" style="background:var(--${p.species==='?'?'warn':'good'})"></span>
          <div class="grow"><p class="rt">${esc(p.title)}</p>
            <p class="rs">${[p.species==='?'?'species unconfirmed':p.species, p.sex,
              p.sibling?`${p.sex==='Female'?'sister':p.sex==='Male'?'brother':'sibling'} of ${esc(p.sibling)}`:''].filter(Boolean).map(esc).join(' · ')}</p>
            ${p.note?`<p class="rs">${esc(p.note)}</p>`:''}</div>
          ${p.food?`<span class="pill ok">${esc(p.food)}</span>`:`<span class="pill lo">no food on file</span>`}
        </div>`).join('')}</div></div>`).join('');
  }

  paint(id){
    const el = this.root.querySelector('#'+id);
    if (el) el.innerHTML = this[id]();
  }

  render(){
    const tabs = [['today','Today'],['kitchen','Kitchen'],['money','Money'],
                  ['subs','Subs'],['us','Us'],['pets','Pets']];
    const body = { today:()=>this.today(), kitchen:()=>this.kitchen(), money:()=>this.money(),
                   subs:()=>this.subs(), us:()=>this.us(), pets:()=>this.pets() }[this.tab]();
    const modes = [['in','Putting away'],['out','Using'],['fav','Favourite']];
    const label = this.mode === 'fav'
      ? (this.favPerson ? `Scan a favourite for ${this.favPerson.split(' ')[0]}` : 'Pick who, over on Us')
      : this.mode === 'out' ? 'Scan what you’re taking' : 'Scan what you’re putting away';

    this.root.innerHTML = `
      <div class="wrap">
        <header class="top">
          <div><p class="name">Pierce Household</p><h1 class="h1">Dashboard</h1></div>
          <p class="when">${new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
        </header>
        <div class="tabs" role="tablist">${tabs.map(([k,l])=>
          `<button class="tab" role="tab" data-tab="${k}" aria-selected="${this.tab===k}">${l}</button>`).join('')}</div>
        ${body}
      </div>
      <div class="scanbar"><div class="scaninner">
        <div class="modes" role="tablist">${modes.map(([k,l])=>
          `<button class="mode" role="tab" data-mode="${k}" aria-selected="${this.mode===k}">${l}</button>`).join('')}</div>
        <button class="scan${this.mode==='fav'?' fav':''}" data-scan>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
            <path d="M7 8v8M10.5 8v8M14 8v8M17 8v8"/></svg>
          ${esc(label)}</button>
      </div></div>`;
  }
}

if (!customElements.get('pierce-household')) customElements.define('pierce-household', PierceHousehold);
if (!customElements.get('wix-default-custom-element'))
  customElements.define('wix-default-custom-element', class extends PierceHousehold {});
