/* Industrial mischief: curated, full-resolution original GIFs. No resized derivative files. */
(() => {
  'use strict';
  const base = '/assets/gifs/';
  const items = [
    ['buzzwords.gif', 'Buzzword disposal', 'Corporate buzzword placards get dismissed'],
    ['holographic-badger.gif', 'Holographic honey badger', 'A fierce holographic honey badger appears'],
    ['chess.gif', 'The endgame', 'A king and pawn meet on a chessboard'],
    ['agent-ducks.gif', 'Kwik, Kwek & Kwak', 'Three small agent ducks assemble a glowing network'],
    ['excel-exorcist.gif', 'Excel intervention', 'An Excel screen meets an unexpectedly forceful intervention'],
    ['privateer.gif', 'Digital privateering', 'A privateer emerges against an industrial treasure map'],
    ['industrial-wizard.gif', 'Industrial wizardry', 'Factory symbols swirl around an industrial wizard'],
    ['vision-goggles.gif', 'Vision goggles', 'Industrial goggles become a playful technical interface'],
    ['factory-hologram.gif', 'Factory in hand', 'A factory hologram forms between outstretched hands'],
    ['council.gif', 'Governance goblin', 'Works council paperwork swirls around a tiny governance goblin'],
    ['phishing.gif', 'Phishing versus firewall', 'A phishing icon is confronted by a glowing shield'],
    ['badger-reality-check.gif', 'Reality check', 'A honey badger presides over a factory reality check'],
    ['nine-faces.gif', 'Nine faces', 'An industrial portrait changes through absurd personas'],
    ['slide-peel.gif', 'Peel off the slides', 'A glossy corporate overlay peels away from the factory'],
    ['demokit.gif', 'DemoKit, dramatically', 'Holographic industrial technologies form a tiny demo kit'],
    ['factory-epiphany.gif', 'Factory epiphany', 'A tiny factory and system diagram come to life'],
    ['privateer-2.gif', 'Privateer, again', 'A second pirate persona appears with compass and hat'],
    ['industrial-multiverse.gif', 'Industrial multiverse', 'A regal chess-themed industrial scene unfolds'],
    ['explosions-and-music.gif', 'Walk away from the explosion', 'A figure in sunglasses ignores a factory explosion'],
    ['badger.gif', 'Honey badger mode', 'A glowing honey-badger alter ego appears beside the portrait']
  ];

  const root = document.getElementById('signal-carousel');
  const grid = document.getElementById('signal-grid');
  const previous = document.getElementById('signal-prev');
  const next = document.getElementById('signal-next');
  const toggle = document.getElementById('signal-pause');
  const status = document.getElementById('signal-status');
  const announcer = document.getElementById('signal-announcer');
  if (!root || !grid || !previous || !next || !toggle || !status) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let first = 0;
  let count = 3;
  let timer = null;
  let visible = false;
  let hovered = false;
  let focused = false;
  let manuallyPaused = false;

  function visibleCount() {
    return window.innerWidth <= 680 ? 1 : window.innerWidth <= 1100 ? 2 : 3;
  }

  function card(item, index) {
    const figure = document.createElement('figure');
    figure.className = 'signal-card';
    const artwork = document.createElement('span');
    artwork.className = 'signal-thumb';
    artwork.setAttribute('data-fallback', '✦');

    const img = document.createElement('img');
    img.src = base + item[0];
    img.alt = item[2];
    img.width = 414;
    img.height = 414;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.draggable = false;
    artwork.appendChild(img);

    const caption = document.createElement('figcaption');
    const title = document.createElement('strong');
    title.textContent = item[1];
    const number = document.createElement('small');
    number.textContent = String(index + 1).padStart(2, '0') + ' / ' + items.length;
    caption.append(title, number);
    figure.append(artwork, caption);
    return figure;
  }

  function render(announce = false) {
    count = visibleCount();
    const nodes = [];
    for (let offset = 0; offset < count; offset++) {
      const index = (first + offset) % items.length;
      nodes.push(card(items[index], index));
    }
    grid.replaceChildren(...nodes);
    const end = (first + count - 1) % items.length;
    status.textContent = `${String(first + 1).padStart(2, '0')}–${String(end + 1).padStart(2, '0')} / ${items.length}`;
    if (announce && announcer) announcer.textContent = `Showing ${count} of ${items.length} animations, starting with ${items[first][1]}.`;
  }

  function stop() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  }

  function canRotate() {
    return visible && !document.hidden && !reduced.matches && !hovered && !focused && !manuallyPaused;
  }

  function updateTimer() {
    stop();
    if (!canRotate()) return;
    timer = window.setInterval(() => {
      first = (first + count) % items.length;
      render();
    }, 7600);
  }

  function change(direction) {
    first = (first + direction * count + items.length) % items.length;
    render(true);
    updateTimer();
  }

  previous.addEventListener('click', () => change(-1));
  next.addEventListener('click', () => change(1));
  toggle.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    toggle.textContent = manuallyPaused ? 'Resume rotation' : 'Pause rotation';
    toggle.setAttribute('aria-pressed', String(manuallyPaused));
    updateTimer();
  });
  root.addEventListener('pointerenter', () => { hovered = true; updateTimer(); });
  root.addEventListener('pointerleave', () => { hovered = false; updateTimer(); });
  root.addEventListener('focusin', () => { focused = true; updateTimer(); });
  root.addEventListener('focusout', event => {
    if (!root.contains(event.relatedTarget)) { focused = false; updateTimer(); }
  });
  root.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      change(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  document.addEventListener('visibilitychange', updateTimer);
  if (reduced.addEventListener) reduced.addEventListener('change', updateTimer);
  window.addEventListener('resize', () => {
    const newCount = visibleCount();
    if (newCount !== count) { render(); updateTimer(); }
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      updateTimer();
    }, { threshold: 0.1 });
    observer.observe(root);
  } else { visible = true; }

  render();
  updateTimer();
})();