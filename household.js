/* Pierce Household Dashboard — loader.

   GitHub Pages serves every file with Cache-Control: max-age=600, so a browser
   that has already loaded the dashboard keeps showing a ten-minute-old build.
   That made every test on a phone unreliable.

   This file is the one Wix points at, so it is the one that gets cached. It
   stays tiny and never changes. The real code lives next door and is fetched
   with a minute-stamped query, so a push is genuinely live in under a minute
   on every device, which is the whole point of the Pages setup.            */
(function () {
  var base = 'https://pierceology.github.io/jnoir-elements/';
  var stamp = Math.floor(Date.now() / 60000);
  var s = document.createElement('script');
  s.src = base + 'household.core.js?v=' + stamp;
  s.async = false;
  s.onerror = function () {
    var again = document.createElement('script');   // one retry, uncached
    again.src = base + 'household.core.js?v=' + (stamp + 1);
    document.head.appendChild(again);
  };
  (document.head || document.documentElement).appendChild(s);
})();
