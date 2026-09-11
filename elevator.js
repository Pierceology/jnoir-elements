/* The Elevator — loader.

   GitHub Pages serves every file with Cache-Control: max-age=600, so the file Wix
   points at is the one that gets stuck ten minutes behind. This one stays tiny and
   never changes; the shaft lives next door and is fetched with a minute stamp, so a
   push is genuinely live in under a minute on every device. Same trick as household.js. */
(function () {
  var base = 'https://pierceology.github.io/jnoir-elements/';
  var stamp = Math.floor(Date.now() / 60000);
  var s = document.createElement('script');
  s.src = base + 'elevator.core.js?v=' + stamp;
  s.async = false;
  s.onerror = function () {
    var again = document.createElement('script');   // one retry, uncached
    again.src = base + 'elevator.core.js?v=' + (stamp + 1);
    document.head.appendChild(again);
  };
  (document.head || document.documentElement).appendChild(s);
})();
