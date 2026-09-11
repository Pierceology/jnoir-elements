/* The Elevator — one page, one element, and every project on its own floor.

   Pierce's idea, 2026-09-11: rather than thirty cloned pages, one shaft you ride.
   The decision that makes it work is that a floor is DATA, not a page. Thirty page
   clones would mean a white flash and a cold start every time the doors opened, and
   an elevator that reloads the page is not an elevator — the illusion dies at the
   page load. So floors.json is the building, and adding a floor is a git push.

   The doors are the loading screen. That is the part that makes the theme and the
   engineering want the same thing: the fetch happens while they are shut, so a slow
   floor reads as a long ride rather than a hang.

   A floor can be three things, which is what lets two years of work move in without
   being rewritten:
     element — load a script, then place its tag (the household dashboard)
     frame   — an iframe of something already live (Drive Winthrop)
     html    — inline markup (the lobby)

   Each floor takes over the tab while you are on it: its own title and its own
   favicon, so a floor you leave open is findable among twenty others.              */

(function () {
  const BASE = 'https://pierceology.github.io/jnoir-elements/';
  const TAG = 'jnoir-elevator';
  if (customElements.get(TAG)) return;

  const CSS = `
:host,.shaft{position:fixed;inset:0;overflow:hidden;background:#0b0d10;color:#e9edf1;
  font:400 16px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
*{box-sizing:border-box}
.car{position:absolute;inset:0}
.floorbox{position:absolute;inset:0;opacity:0;transition:opacity .28s ease}
.floorbox.here{opacity:1}
.floorbox>iframe{width:100%;height:100%;border:0;display:block}

/* The doors. They part from the middle, which is the whole reason he calls them that. */
.door{position:absolute;top:0;bottom:0;width:50.6%;background:
   linear-gradient(180deg,#161a20 0%,#10141a 42%,#0c1015 100%);
  border-color:rgba(255,255,255,.06);z-index:40;
  transition:transform .78s cubic-bezier(.65,.02,.25,1);will-change:transform}
.door.l{left:0;border-right:1px solid rgba(255,255,255,.07);box-shadow:14px 0 44px rgba(0,0,0,.55)}
.door.r{right:0;border-left:1px solid rgba(255,255,255,.07);box-shadow:-14px 0 44px rgba(0,0,0,.55)}
.door::after{content:'';position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.10)}
.door.l::after{right:12px}.door.r::after{left:12px}
.open .door.l{transform:translateX(-101%)}
.open .door.r{transform:translateX(101%)}

/* Floor indicator, above the doors, always legible. */
.readout{position:absolute;left:50%;top:26px;transform:translateX(-50%);z-index:60;
  display:flex;align-items:center;gap:12px;padding:9px 16px;border-radius:999px;
  background:rgba(8,10,13,.62);border:1px solid rgba(255,255,255,.10);
  backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);
  font-variant-numeric:tabular-nums;letter-spacing:.02em;white-space:nowrap}
.readout .n{font-weight:700;font-size:15px;color:#f4c46a;min-width:1.4em;text-align:right}
.readout .nm{font-size:13.5px;opacity:.9}
.readout .ic{font-size:15px}
.arrow{display:inline-block;width:9px;opacity:0;transition:opacity .2s}
.moving .arrow{opacity:.9}
.moving .arrow.up{animation:rise .9s linear infinite}
.moving .arrow.down{animation:fall .9s linear infinite}
@keyframes rise{from{transform:translateY(3px)}to{transform:translateY(-3px)}}
@keyframes fall{from{transform:translateY(-3px)}to{transform:translateY(3px)}}

/* The call panel. One column, thumb-reachable, out of the way of the floor itself. */
.panel{position:absolute;right:calc(14px + env(safe-area-inset-right,0px));
  top:50%;transform:translateY(-50%);z-index:60;display:flex;flex-direction:column;gap:6px;
  padding:8px;border-radius:20px;background:rgba(8,10,13,.55);border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);max-height:76vh;overflow:auto;
  scrollbar-width:none}
.panel::-webkit-scrollbar{display:none}
.panel button{appearance:none;width:46px;height:46px;flex:0 0 auto;border-radius:50%;cursor:pointer;
  border:1px solid rgba(255,255,255,.13);background:rgba(255,255,255,.05);color:#e9edf1;
  font:600 14px/1 inherit;font-variant-numeric:tabular-nums;display:grid;place-items:center;
  transition:background .16s,border-color .16s,transform .16s}
.panel button:hover{background:rgba(255,255,255,.11)}
.panel button:active{transform:scale(.94)}
.panel button.here{background:#f4c46a;border-color:#f4c46a;color:#15181d}
.panel button:focus-visible{outline:2px solid #f4c46a;outline-offset:2px}

.lobby{height:100%;display:grid;place-content:center;text-align:center;padding:8vh 8vw;gap:14px}
.lobby h1{margin:0;font:600 clamp(30px,6vw,58px)/1.06 Georgia,'Times New Roman',serif;letter-spacing:-.01em}
.lobby p{margin:0;max-width:34ch;opacity:.72;font-size:15.5px;justify-self:center}
.oops{height:100%;display:grid;place-content:center;text-align:center;gap:10px;padding:10vh 8vw;opacity:.8}

@media (prefers-reduced-motion:reduce){
  .door{transition:none}.floorbox{transition:none}
  .moving .arrow.up,.moving .arrow.down{animation:none}
}
`;

  // Rides are timed so the doors are never the thing you are waiting on: they shut, the
  // floor loads behind them, and they only open once it is actually there.
  const SHUT = 780, SETTLE = 240;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  class Elevator extends HTMLElement {
    constructor() {
      super();
      this.root = this.attachShadow({mode: 'open'});
      this.floors = [];
      this.at = null;
      this.mounted = new Map();      // slug -> element already built, so a floor you revisit is instant
      this.busy = false;
    }

    connectedCallback() {
      if (this._built) return;       // Wix mounts an element more than once
      this._built = true;
      this.root.innerHTML =
        `<style>${CSS}</style>
         <div class="shaft" part="shaft">
           <div class="car"></div>
           <div class="door l"></div><div class="door r"></div>
           <div class="readout" role="status" aria-live="polite">
             <span class="arrow up">▲</span><span class="n">—</span>
             <span class="ic"></span><span class="nm">…</span>
             <span class="arrow down">▼</span>
           </div>
           <nav class="panel" aria-label="Floors"></nav>
         </div>`;
      this.shaft = this.root.querySelector('.shaft');
      this.car = this.root.querySelector('.car');
      this.panel = this.root.querySelector('.panel');
      this.mark('booting');
      this.load();
      addEventListener('hashchange', () => this.goTo(this.wanted(), {fromHash: true}));
    }

    /* State out by attribute: page-code console.log is invisible on a live Wix site, so the
       only way anyone watching from outside can see what this is doing is an attribute. */
    mark(state, extra) { this.setAttribute('elevator-state', extra ? state + ':' + extra : state); }

    wanted() {
      const h = (location.hash || '').replace(/^#/, '').trim().toLowerCase();
      const byAttr = (this.getAttribute('floor') || '').trim().toLowerCase();
      const want = h || byAttr;
      if (!want) return this.floors[0];
      return this.floors.find(f => f.slug === want || String(f.n) === want) || this.floors[0];
    }

    async load() {
      const src = this.getAttribute('floors') || (BASE + 'floors.json?v=' + Math.floor(Date.now() / 60000));
      try {
        const data = await (await fetch(src, {cache: 'no-store'})).json();
        this.floors = (data.floors || []).slice().sort((a, b) => a.n - b.n);
        this.building = data.building || '';
      } catch (e) {
        this.car.innerHTML = `<div class="oops"><p>The building is not answering.</p><p style="opacity:.6;font-size:13px">${String(e).slice(0, 120)}</p></div>`;
        this.shaft.classList.add('open');
        this.mark('no-building');
        return;
      }
      this.buildPanel();
      this.mark('ready', this.floors.length);
      await this.goTo(this.wanted(), {first: true});
    }

    buildPanel() {
      this.panel.innerHTML = '';
      for (const f of this.floors) {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = f.n;
        b.title = f.name;
        b.setAttribute('aria-label', 'Floor ' + f.n + ', ' + f.name);
        b.dataset.slug = f.slug;
        b.addEventListener('click', () => this.goTo(f));
        this.panel.appendChild(b);
      }
    }

    /* Build a floor once and keep it. A floor you have already visited comes back
       instantly, which is what makes riding up and down feel like one place rather
       than a set of page loads wearing a costume. */
    build(f) {
      if (this.mounted.has(f.slug)) return this.mounted.get(f.slug);
      const box = document.createElement('div');
      box.className = 'floorbox';
      box.dataset.slug = f.slug;
      if (f.kind === 'frame') {
        const fr = document.createElement('iframe');
        fr.src = f.url;
        fr.title = f.name;
        fr.loading = 'eager';
        fr.allow = 'fullscreen; autoplay; accelerometer; gyroscope; xr-spatial-tracking';
        box.appendChild(fr);
      } else if (f.kind === 'element') {
        const place = () => {
          const el = document.createElement(f.tag);
          for (const [k, v] of Object.entries(f.attrs || {})) el.setAttribute(k, v);
          box.appendChild(el);
        };
        if (customElements.get(f.tag)) place();
        else {
          const s = document.createElement('script');
          s.src = f.src + (f.src.includes('?') ? '&' : '?') + 'v=' + Math.floor(Date.now() / 60000);
          s.async = false;
          s.onload = () => customElements.whenDefined(f.tag).then(place);
          s.onerror = () => { box.innerHTML = `<div class="oops"><p>Floor ${f.n} did not load.</p></div>`; };
          document.head.appendChild(s);
        }
      } else {
        box.innerHTML = f.html || '';
      }
      this.car.appendChild(box);
      this.mounted.set(f.slug, box);
      return box;
    }

    /* Each floor owns the tab while you are on it. The favicon is drawn from the floor's
       own emoji rather than shipped as files, so adding a floor never means adding assets. */
    dressTab(f) {
      try {
        document.title = f.name + (this.building ? ' · ' + this.building : '');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text y="50" font-size="52">${f.icon || '🛗'}</text></svg>`;
        let link = document.querySelector('link[rel~="icon"][data-elevator]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          link.setAttribute('data-elevator', '');
          document.head.appendChild(link);
        }
        link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
      } catch (e) { /* a tab that keeps the wrong icon is not worth throwing over */ }
    }

    async goTo(f, {first = false, fromHash = false} = {}) {
      if (!f || this.busy || (this.at && this.at.slug === f.slug && !first)) return;
      this.busy = true;
      const up = !this.at || f.n >= this.at.n;
      this.shaft.classList.add('moving');
      this.root.querySelector('.arrow.up').style.opacity = up ? '' : '0';
      this.root.querySelector('.arrow.down').style.opacity = up ? '0' : '';
      this.mark('moving', f.slug);

      if (!first) {                                   // shut the doors and ride
        this.shaft.classList.remove('open');
        await sleep(SHUT);
      }
      const box = this.build(f);                      // load behind shut doors
      for (const [slug, el] of this.mounted) el.classList.toggle('here', slug === f.slug);
      this.at = f;
      this.dressTab(f);
      this.readout(f);
      for (const b of this.panel.children) b.classList.toggle('here', b.dataset.slug === f.slug);
      if (!fromHash) { try { history.replaceState(null, '', '#' + f.slug); } catch (e) {} }

      await sleep(SETTLE);
      this.shaft.classList.remove('moving');
      this.shaft.classList.add('open');               // arrive
      this.mark('at', f.slug);
      this.dispatchEvent(new CustomEvent('floor', {detail: {n: f.n, slug: f.slug, name: f.name}, bubbles: true, composed: true}));
      this.busy = false;
    }

    readout(f) {
      this.root.querySelector('.readout .n').textContent = f.n;
      this.root.querySelector('.readout .ic').textContent = f.icon || '';
      this.root.querySelector('.readout .nm').textContent = f.name;
    }
  }

  customElements.define(TAG, Elevator);
  /* Wix silently resets a custom element's tag to wix-default-custom-element when the
     source URL changes, and the element renders black if that tag is undefined. Alias it. */
  if (!customElements.get('wix-default-custom-element')) {
    customElements.define('wix-default-custom-element', class extends Elevator {});
  }
})();
