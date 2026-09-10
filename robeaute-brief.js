// Robeauté brief — Wix Studio Custom Element
// Tag name: robeaute-brief
// Replace the entire contents of your custom element's Velo file with this.

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700&family=Spline+Sans:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap';

class RobeauteBrief extends HTMLElement {
  connectedCallback() {
    // Fonts must load at document level (they pass through the shadow boundary)
    if (!document.querySelector(`link[href="${FONT_HREF}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
<style>
:host{
  --ink:#13171B; --paper:#FAFAF7; --steel:#5C646C;
  --bleu:#2B4C9B; --bleu-soft:#E7ECF7; --line:#D9DBD6; --maxw:880px;
  display:block; background:var(--paper); color:var(--ink);
  font-family:'Spline Sans',system-ui,sans-serif; font-size:17px; line-height:1.65;
  -webkit-font-smoothing:antialiased;
}
*{margin:0;padding:0;box-sizing:border-box}
::selection{background:var(--bleu);color:#fff}
.mono{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--steel)}
.mono .dotmark{color:var(--bleu)}
.wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px}
header{border-bottom:1px solid var(--line)}
.memo{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:20px 0}
.memo div span{display:block}
.memo .label{color:var(--steel)}
.memo .val{color:var(--ink);font-weight:500;margin-top:2px}
@media(max-width:640px){.memo{grid-template-columns:1fr 1fr}}
.hero{padding:88px 0 72px;position:relative}
h1{font-family:'Archivo',sans-serif;font-weight:700;font-size:clamp(38px,6.4vw,64px);line-height:1.04;letter-spacing:-0.022em;max-width:15ch}
h1 em{font-style:normal;color:var(--bleu)}
.hero p.stand{margin-top:28px;max-width:52ch;font-size:19px}
.hero .mono{margin-bottom:20px;display:block}
.spine{position:relative}
.spine::before{content:"";position:absolute;left:11px;top:0;bottom:0;width:1px;background:var(--line)}
@media(max-width:640px){.spine::before{left:7px}}
section{padding:56px 0;position:relative}
.node{position:relative;padding-left:56px}
@media(max-width:640px){.node{padding-left:40px}}
.node::before{content:"";position:absolute;left:6px;top:8px;width:11px;height:11px;border-radius:50%;background:var(--bleu);box-shadow:0 0 0 5px var(--bleu-soft)}
@media(max-width:640px){.node::before{left:2px}}
h2{font-family:'Archivo',sans-serif;font-weight:600;font-size:clamp(24px,3.4vw,32px);letter-spacing:-0.015em;line-height:1.15;margin:10px 0 18px}
section .mono{display:block}
p + p{margin-top:14px}
.node > p{max-width:60ch}
strong{font-weight:600}
a{color:var(--bleu);text-decoration:none;border-bottom:1px solid var(--bleu-soft);transition:border-color .15s}
a:hover{border-bottom-color:var(--bleu)}
a:focus-visible{outline:2px solid var(--bleu);outline-offset:3px;border-radius:2px}
.obs{display:grid;gap:0;margin-top:8px;border-top:1px solid var(--line)}
.ob{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:26px 0;border-bottom:1px solid var(--line)}
@media(max-width:700px){.ob{grid-template-columns:1fr;gap:8px}}
.ob h3{font-family:'Archivo',sans-serif;font-weight:600;font-size:17px;line-height:1.3;letter-spacing:-.01em}
.ob p{max-width:58ch}
.ob p .why{color:var(--steel)}
.offers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:22px}
@media(max-width:760px){.offers{grid-template-columns:1fr}}
.offer{background:#fff;border:1px solid var(--line);border-radius:10px;padding:22px 20px;display:flex;flex-direction:column;gap:10px}
.offer .mono{color:var(--bleu)}
.offer h3{font-family:'Archivo',sans-serif;font-weight:600;font-size:17px;letter-spacing:-.01em}
.offer p{font-size:15.5px;color:var(--steel)}
.who p{max-width:60ch}
.creds{margin-top:18px;display:flex;flex-wrap:wrap;gap:8px}
.cred{font-family:'IBM Plex Mono',monospace;font-size:12px;letter-spacing:.04em;border:1px solid var(--line);border-radius:99px;padding:7px 14px;background:#fff}
.cta{padding:72px 0 96px}
.cta-inner{background:var(--ink);color:#fff;border-radius:14px;padding:clamp(32px,6vw,56px)}
.cta-inner h2{color:#fff;margin-top:8px}
.cta-inner p{color:#C9CDD2;max-width:52ch}
.cta-inner .mono{color:#8B93A0}
.cta-actions{margin-top:28px;display:flex;gap:14px;flex-wrap:wrap}
.btn{font-family:'Archivo',sans-serif;font-weight:600;font-size:15px;padding:13px 22px;border-radius:8px;border:1px solid transparent;display:inline-block;transition:transform .12s ease,background .15s}
.btn-primary{background:var(--bleu);color:#fff;border-bottom:none}
.btn-primary:hover{background:#3a5cae;transform:translateY(-1px)}
.btn-ghost{background:transparent;color:#fff;border:1px solid #3A4048}
.btn-ghost:hover{border-color:#fff}
footer{border-top:1px solid var(--line);padding:26px 0 40px}
footer p{font-size:13px;color:var(--steel);max-width:70ch;line-height:1.6}
footer p + p{margin-top:8px}
.reveal{opacity:0;transform:translateY(14px);transition:opacity .5s ease,transform .5s ease}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .btn-primary:hover{transform:none}
}
</style>

<header>
  <div class="wrap">
    <div class="memo mono">
      <div><span class="label">From</span><span class="val">JNoir Branding — Boston, MA</span></div>
      <div><span class="label">To</span><span class="val">Robeauté — Paris, FR</span></div>
      <div><span class="label">Re</span><span class="val">Your American chapter</span></div>
    </div>
  </div>
</header>

<main class="wrap">

  <div class="hero">
    <span class="mono"><span class="dotmark">●</span>&nbsp; An unsolicited brief · 5 min read</span>
    <h1>The robot leaves nothing behind. <em>The story should leave nothing to chance.</em></h1>
    <p class="stand">You've built the first microrobotic platform for the brain. Your next navigation problem isn't tissue — it's the American market. This page is a working sample of how I'd think about it with you.</p>
  </div>

  <div class="spine">

    <section class="node reveal">
      <span class="mono">The moment</span>
      <h2>You're crossing the Atlantic at the exact moment your story matters most</h2>
      <p>Your own press page leads with it: <em>"European Brain Surgery Start-Up Seeks US Expansion."</em> First-in-human trials ahead, $29M raised, and a US audience — surgeons, regulators, journalists, patients' families — about to meet you for the first time.</p>
      <p>First impressions in medtech are sticky. The narrative that greets you in America will either be the one you wrote, or the one written for you. Right now, US coverage reflexively frames every brain-tech story through one comparison: Neuralink. That framing is wrong for you — and it's winnable.</p>
    </section>

    <section class="node reveal">
      <span class="mono">Three observations</span>
      <h2>What I noticed in an afternoon with your materials</h2>
      <div class="obs">
        <div class="ob">
          <h3>You're the anti-implant. Say it first.</h3>
          <p>Neuralink's story is a device that stays. Yours is a gardener that visits, works, and <strong>leaves nothing behind</strong>. That's not a technical footnote — it's the single most reassuring sentence a patient's family can hear, and it pre-empts the comparison every US journalist will reach for. It should be load-bearing in every American-facing sentence.</p>
        </div>
        <div class="ob">
          <h3>"Closing the loop" speaks to investors. Families need the gardener.</h3>
          <p>"One platform, compounding value" is the right register for your raise. It's the wrong register for a mother in a waiting room reading about her son's biopsy options. You already own a warmer vocabulary — the Brain Gardeners' Club proves it. The US launch needs both languages, deliberately separated: platform for capital, gardener for people. <span class="why">Most deep-tech companies blur them and end up trusted by neither.</span></p>
        </div>
        <div class="ob">
          <h3>Your best US asset costs almost nothing: a Boston salon.</h3>
          <p>The Gardeners' Club gathers "in salons around the world." There is no denser square mile of neurosurgical judgment on earth than the corridor from MGH to Kendall Square. One well-produced Boston salon puts your platform in front of the exact clinicians who will one day run your US trials — as hosts of a conversation, not targets of a pitch. <span class="why">I'm twenty minutes away and produce this kind of thing for a living.</span></p>
        </div>
      </div>
    </section>

    <section class="node reveal">
      <span class="mono">The work</span>
      <h2>Three scoped ways to start small</h2>
      <div class="offers">
        <div class="offer">
          <span class="mono">01</span>
          <h3>Boston Gardeners' salon</h3>
          <p>Venue, invitations, materials, and follow-through for your first US salon — produced on the ground, in your voice, with your team owning the room.</p>
        </div>
        <div class="offer">
          <span class="mono">02</span>
          <h3>US narrative kit</h3>
          <p>Message architecture for the American press cycle: the anti-implant frame, FDA-disciplined language, boilerplate, and Q&amp;A that keeps every spokesperson on one story.</p>
        </div>
        <div class="offer">
          <span class="mono">03</span>
          <h3>Plain-language platform story</h3>
          <p>The version of Treat · Diagnose · Monitor written for clinicians and patients' families — accurate enough for your regulatory team, human enough to be repeated.</p>
        </div>
      </div>
    </section>

    <section class="node reveal who">
      <span class="mono">Who's writing</span>
      <h2>Twenty years of making complicated things land</h2>
      <p>I'm Pierce, founder of JNoir Branding. My background runs from Bromley Communications — building campaigns for major consumer brands — to rebranding a period-poverty venture whose first customer became JPMorgan Chase, on a distribution strategy I designed end to end: product, dispenser hardware, and the pitch that got it billed as a janitorial line item.</p>
      <p>Today I work the way your engineers do: AI-assisted, obsessively iterative, catching the tiny things. This page went from reading your Bloomberg coverage to what you're looking at in a single working session. Imagine the same speed pointed at your launch.</p>
      <div class="creds">
        <span class="cred">20+ yrs brand strategy</span>
        <span class="cred">Consumer &amp; enterprise</span>
        <span class="cred">AI-native workflow</span>
        <span class="cred">Boston, MA</span>
      </div>
    </section>

  </div>

  <div class="cta reveal">
    <div class="cta-inner">
      <span class="mono">Next step</span>
      <h2>Thirty minutes. I'll bring a point of view, you keep whatever's useful.</h2>
      <p>No retainer pitch, no deck. If any of the three observations above rang true, the conversation will be worth your time. If not, you've lost half an hour and gained a free brief.</p>
      <div class="cta-actions">
        <a class="btn btn-primary" href="mailto:YOUR-EMAIL-HERE?subject=Robeaut%C3%A9%20%C3%97%20JNoir">Email Pierce</a>
        <a class="btn btn-ghost" href="https://www.jnoirbranding.com" target="_blank" rel="noopener">See JNoir Branding</a>
      </div>
    </div>
  </div>

</main>

<footer>
  <div class="wrap">
    <p>This is an unsolicited brief prepared independently by JNoir Branding. It is not affiliated with, endorsed by, or commissioned by Robeauté. References to Robeauté's public materials are made in good faith for the purpose of this proposal.</p>
    <p>© 2026 JNoir Branding · Boston, Massachusetts</p>
  </div>
</footer>
`;

    // Scroll reveal
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = root.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }
}

customElements.define('robeaute-brief', RobeauteBrief);