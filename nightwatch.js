(() => {
  "use strict";
  const stage = document.getElementById("night-stage");
  const knight = document.getElementById("knight-art");
  const dex = document.getElementById("dex-patrol");
  const picture = document.getElementById("dex-frame");
  const response = document.getElementById("dex-response");
  if (!stage || !knight || !dex || !picture || !response) return;

  // Intentionally only one place to configure replacement sprites and sizing.
  const characterAssets = window.SiteCharacters;
  if (!characterAssets?.knight?.idle || !Array.isArray(characterAssets?.dex?.frames)) return;
  const frames = characterAssets.dex.frames;
  if (!frames.length) return;
  knight.src = characterAssets.knight.idle;
  picture.src = frames[0];
  const setSize = (variable, value) => {
    if (Number.isFinite(value) && value > 0 && value < 1200)
      stage.style.setProperty(variable, value + "px");
  };
  setSize("--knight-width", characterAssets.knight.width);
  setSize("--knight-height", characterAssets.knight.height);
  setSize("--dex-width", characterAssets.dex.width);
  setSize("--dex-height", characterAssets.dex.height);
  stage.style.setProperty("--knight-x", (characterAssets.knight.offsetX || 0) + "px");
  stage.style.setProperty("--knight-y", (characterAssets.knight.offsetY || 0) + "px");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const frameMs = Math.min(2000, Math.max(100, Number(characterAssets.dex.frameMs) || 270));
  let frame = 0, visible = false, timer = null, messageTimer = null, primed = false;

  function stop() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  }
  function update() {
    stop();
    stage.classList.toggle("offscreen", !visible || document.hidden || reduceMotion.matches);
    if (!visible || document.hidden || reduceMotion.matches) return;
    if (!primed) {
      frames.slice(1).forEach(src => { const img = new Image(); img.src = src; });
      primed = true;
    }
    timer = window.setInterval(() => {
      frame = (frame + 1) % frames.length;
      picture.src = frames[frame];
    }, frameMs);
  }
  dex.addEventListener("click", () => {
    response.textContent = "Good dog, Dex.";
    response.classList.add("visible");
    if (messageTimer !== null) window.clearTimeout(messageTimer);
    messageTimer = window.setTimeout(() => response.classList.remove("visible"), 2600);
  });
  document.addEventListener("visibilitychange", update);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", update);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(items => {
      visible = items[0].isIntersecting;
      update();
    }, { threshold: 0.05 });
    observer.observe(stage);
  } else { visible = true; update(); }
})();
