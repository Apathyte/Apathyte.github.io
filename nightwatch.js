
(() => {
  "use strict";
  const stage = document.getElementById("night-stage");
  const dex = document.getElementById("dex-patrol");
  const picture = document.getElementById("dex-frame");
  const response = document.getElementById("dex-response");
  if (!stage || !dex || !picture || !response) return;
  const frames = [0,1,2,3].map(i => "/assets/dex/trot-" + i + ".png");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0, visible = false, timer = null, messageTimer = null, primed = false;
  function stop() { if (timer !== null) clearInterval(timer); timer = null; }
  function update() {
    stop();
    stage.classList.toggle("offscreen", !visible || document.hidden || motion.matches);
    if (!visible || document.hidden || motion.matches) return;
    if (!primed) { frames.slice(1).forEach(src => { const img = new Image(); img.src = src; }); primed = true; }
    timer = setInterval(() => { frame = (frame + 1) % frames.length; picture.src = frames[frame]; }, 270);
  }
  dex.addEventListener("click", () => {
    response.textContent = "Good dog, Dex.";
    response.classList.add("visible");
    if (messageTimer !== null) clearTimeout(messageTimer);
    messageTimer = setTimeout(() => response.classList.remove("visible"), 2800);
  });
  document.addEventListener("visibilitychange", update);
  if (motion.addEventListener) motion.addEventListener("change", update);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(items => { visible = items[0].isIntersecting; update(); }, {threshold: 0.05}).observe(stage);
  } else { visible = true; update(); }
})();
