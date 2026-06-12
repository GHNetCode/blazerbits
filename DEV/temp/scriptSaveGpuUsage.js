const root = document.documentElement;



//lightweight component system for the Navbar.
// - use <div id="navbar"></div> and 
//       <script src="script.js"></script> in all html files..
  fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;
        //Initialize components
        initializeGTranslate();
        initializeThemeSlider();
        initializeMobileMenu();
         initializeJustFireF();

    });  
      /* LOAD SAVED THEME */
      function initializeThemeSlider() {
        const slider = document.getElementById("themeSlider");
        if (!slider) return;
        const saved = localStorage.getItem("themeValue");
        if (saved) {
          slider.value = saved;
          applyTheme(saved);
        } else {
          applyTheme(slider.value); // 👈 use the HTML default (30) on first visit
        }
        slider.addEventListener("input", (e) => {
          const value = e.target.value;
          applyTheme(value);
          localStorage.setItem("themeValue", value);
        });
      }

      function initializeGTranslate() {
        if (document.querySelector('script[data-gtranslate]')) return;
        const script = document.createElement('script');
        script.src ='https://cdn.gtranslate.net/widgets/latest/dwf.js';
      
        script.defer = true;
        script.setAttribute('data-gtranslate', 'true');
        document.body.appendChild(script);
      }

      function initializeMobileMenu() {
        const menu      = document.getElementById("menu");
        const hamburger = document.getElementById("hamburger");
        const root      = document.getElementById("mob-panel-root");
        if (!menu || !hamburger) return;

        function closeAllSubmenus() {
          menu.querySelectorAll(".mob-submenu.active").forEach(s => s.classList.remove("active"));
          root.classList.remove("dimmed");
        }

        function openSubmenu(id) {
          closeAllSubmenus();
          const sub = document.getElementById(id);
          if (sub) {
            sub.classList.add("active");
            root.classList.add("dimmed");
          }
        }

        // ── Open / close overlay ──
        hamburger.addEventListener("click", () => {
          const isOpen = menu.classList.toggle("active");
          hamburger.classList.toggle("active");
          if (!isOpen) closeAllSubmenus();
        });

        // ── Event delegation ──
        menu.addEventListener("click", (e) => {
          const drillBtn = e.target.closest(".mob-drill");
          const closeBtn = e.target.closest(".mob-close");

          if (drillBtn) {
            e.preventDefault();
            openSubmenu(drillBtn.dataset.target);
            return;
          }

          if (closeBtn) {
            closeAllSubmenus();
            return;
          }

          // Tap bare backdrop to close entire menu
          if (e.target === menu) {
            menu.classList.remove("active");
            hamburger.classList.remove("active");
            closeAllSubmenus();
          }
        });
      }




  window.gtranslateSettings = {
  default_language: "en",
  native_language_names: true,
  detect_browser_language: true,
  languages: ["en","hu","cy","ga","iw","nl","fr","de","it","es"],
  wrapper_selector: ".gtranslate_wrapper",
  flag_size: 16,
  // switcher_vertical_position: "top",
  switcher_horizontal_position:"inline",
  flag_style: "3d",
  // switcher_text_color:"#f7f7f7",
  // switcher_text_color:"#ffffff",
  // switcher_arrow_color:"#f2f2f2",
  // switcher_arrow_color:"#f2f2f2",
  switcher_border_color:"#161616",
  switcher_border_radius:"10",
  switcher_background_color:"#040308",
  switcher_background_shadow_color:"#232323",
  switcher_background_hover_color:"#3a3a3a",
  dropdown_text_color:"#ffffff",
  dropdown_hover_color:"#3a3a3a",
  dropdown_background_color:"#040308"
};




//--------------------------------------- 
/* APPLY THEME Start*/
function applyTheme(value) {
  const lightness = value / 100;

  const bg = interpolateColor([14,16,24 ], [14,16,24], lightness);

  const text = interpolateColor([255,255,255], [20,20,20], lightness);
  const accent = interpolateColor([181, 210, 254 ], [38, 42, 44], lightness);
  const accentBtn = interpolateColor([63, 73, 87 ], [27, 33, 42], lightness);
  root.style.setProperty("--bg", `rgb(${bg})`);
  root.style.setProperty("--text", `rgb(${text})`);
  root.style.setProperty("--accent", `rgb(${accent})`);
  root.style.setProperty("--accentBtn", `rgb(${accentBtn})`);
    // Set theme attribute on body
  if (lightness > 0.5) {
    document.body.setAttribute('data-theme', 'dark');
  } else {
    document.body.setAttribute('data-theme', 'light');
  }
  updateGTranslateArrowColor(text);
}
    //----------------------------------
    /* COLOR INTERPOLATION */
    function interpolateColor(start, end, factor) {
      return start.map((s, i) => Math.round(s + factor * (end[i] - s))).join(",");
    }
      function updateGTranslateArrowColor(rgbColor) {
       // Convert RGB to hex for the SVG fill
       const hexColor = rgbToHex(rgbColor);
 
       // Create new SVG data URL with the dynamic color
       const svgString = `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 285 285'><path d='M282 76.5l-14.2-14.3a9 9 0 0 0-13.1 0L142.5 174.4 30.3 62.2a9 9 0 0 0-13.2 0L3 76.5a9 9 0 0 0 0 13.1l133 133a9 9 0 0 0 13.1 0l133-133a9 9 0 0 0 0-13z' fill='${hexColor}'/></svg>`;
 
       const encodedSVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
 
       // Find all GTranslate arrows and update them
       const styleId = 'gtranslate-arrow-style';
       let styleElement = document.getElementById(styleId);
 
       if (!styleElement) {
         styleElement = document.createElement('style');
         styleElement.id = styleId;
         document.head.appendChild(styleElement);
       }
 
       styleElement.textContent = `
         .gt_switcher .gt_selected a:after {
           background-image: url("${encodedSVG}") !important;
         }
       `;
      }
       function rgbToHex(rgb) {
        // Handle rgb string like "234,234,234"
        const rgbValues = rgb.split(',').map(Number);
        return '#' + rgbValues.map(v => {
          const hex = v.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        }).join('');
       }

/* APPLY THEME End*/

   /*
     * FIREFLY SYSTEM — maximum CPU efficiency build
     * ═══════════════════════════════════════════════
     *
     * Every optimisation explained:
     *
     * 1. ONE animation per firefly (was 2)
     *    Drift + blink merged into a single @keyframes rule.
     *    Both transform and opacity change in the same keyframe steps.
     *    Browser schedules one timeline instead of two → half the
     *    animation overhead immediately.
     *
     * 2. 40 fireflies (was 60)
     *    Fewer compositor layers. Still looks full because glow halos
     *    are generous. Each layer has a memory + scheduling cost.
     *
     * 3. Single box-shadow (was two layered shadows)
     *    Two shadows = two texture compositing operations per frame.
     *    One shadow still produces a convincing glow halo.
     *
     * 4. animation-timing-function: linear on everything
     *    ease-in-out requires the browser to evaluate a cubic bezier
     *    curve every frame. linear is a trivial multiply — near zero cost.
     *
     * 5. Long durations: 25–55s drift (was 18–38s)
     *    Fewer interpolation steps per second across the whole set.
     *    Fireflies are slow anyway — nobody notices the difference.
     *
     * 6. contain: strict on .firefly
     *    Tells the browser this element will never affect layout outside
     *    itself. Skips all ancestor reflow checks every frame.
     *
     * 7. will-change: transform, opacity — explicit, not just transform
     *    Browser knows BOTH properties animate → one optimised GPU path.
     *    Listing only transform would force a separate opacity layer.
     *
     * 8. Opacity baked into keyframes (not a separate animation)
     *    The compositor handles transform + opacity together in one pass
     *    when they share the same @keyframes. Separate animations get
     *    separate scheduling slots even on GPU.
     *
     * Net result: roughly 40–50 active compositor layers doing linear
     * interpolation on two cheap properties. CPU involvement after the
     * first frame is near zero — the GPU compositor runs it autonomously.
     */

    const FIREFLY_COUNT = 40;

    // Weighted palette — warm amber/gold dominant, rare cool accent
    const palette = [
      { r: 255, g: 210, b:  80, w: 5 },  // warm gold
      { r: 255, g: 190, b:  50, w: 4 },  // deep amber
      { r: 220, g: 255, b: 130, w: 4 },  // soft lime-green
      { r: 255, g: 230, b: 140, w: 4 },  // pale gold
      { r: 180, g: 255, b: 160, w: 3 },  // cool mint
      { r: 200, g: 220, b: 255, w: 1 },  // icy blue-white accent
    ];

    const weighted = [];
    palette.forEach(c => { for (let w = 0; w < c.w; w++) weighted.push(c); });

    function rand(a, b)  { return Math.floor(Math.random() * (b - a + 1)) + a; }
    function randF(a, b) { return +(Math.random() * (b - a) + a).toFixed(3); }
    function pick(arr)   { return arr[rand(0, arr.length - 1)]; }

    const back  = document.getElementById('particles-back');
    const front = document.getElementById('particles-front');
    const sheet = document.createElement('style');
    document.head.appendChild(sheet);

    for (let i = 1; i <= FIREFLY_COUNT; i++) {

      const col     = pick(weighted);
      const isFront = Math.random() < 0.25;

      // Size — tiny core dot
      const core = rand(2, 4);

      // Opacity range — back layer noticeably dimmer
    //  const dim    = isFront ? randF(0.04, 0.15) : randF(0.02, 0.08);
    //  const bright = isFront ? randF(0.60, 0.95) : randF(0.25, 0.55);
      const dim    = isFront ? randF(0.08, 0.30) : randF(0.04, 0.16);
      const bright = isFront ? randF(0.75, 0.99) : randF(0.55, 0.99);


      // Single glow shadow — one compositing op per frame
      const glowSpread = core * rand(4, 7);
      const glowAlpha  = (isFront ? randF(0.3, 0.6) : randF(0.1, 0.3));
      const shadow     = `0 0 ${glowSpread}px ${glowSpread / 2}px rgba(${col.r},${col.g},${col.b},${glowAlpha})`;

      // Drift path — gentle wander, slight upward bias
      const x0   = rand(5, 95);
      const y0   = rand(15, 90);
      const xMid = Math.min(95, Math.max(5, x0 + rand(-20, 20)));
      const yMid = Math.min(90, Math.max(5, y0 + rand(-20,  5)));
      const x1   = Math.min(95, Math.max(5, x0 + rand(-25, 25)));
      const y1   = Math.min(85, Math.max(5, y0 + rand(-30, 10)));

      // Durations — long and lazy
      const duration = rand(25000, 55000);
      const delay    = rand(0, 40000);

      /*
       * MERGED keyframe — transform + opacity in one animation.
       * Blink pattern: dim → bright → dim → bright → dim
       * mapped across the drift so the two effects feel independent
       * even though they share one timeline.
       */
      const name = `ff${i}`;
      sheet.sheet.insertRule(`
        @keyframes ${name} {
          0%   { transform: translate3d(${x0}vw,   ${y0}vh,  0); opacity: ${dim};    }
          20%  { transform: translate3d(${xMid}vw, ${yMid}vh,0); opacity: ${bright}; }
          40%  {                                                   opacity: ${dim};    }
          60%  { transform: translate3d(${x1}vw,   ${y1}vh,  0); opacity: ${bright}; }
          80%  {                                                   opacity: ${dim};    }
          100% { transform: translate3d(${x0}vw,   ${y0}vh,  0); opacity: ${bright}; }
        }
      `, sheet.sheet.cssRules.length);

      const el = document.createElement('div');
      el.className = 'firefly';
      el.style.cssText = `
        width:              ${core}px;
        height:             ${core}px;
        background:         rgba(${col.r},${col.g},${col.b},1);
        box-shadow:         ${shadow};
        animation:          ${name} ${duration}ms -${delay}ms infinite linear;
      `;

      (isFront ? front : back).appendChild(el);
    }
 



// ═══════════════════════════════════════════════════════════
// PAGE VISIBILITY — pause GPU work when tab/screen is hidden
// Pauses: all firefly CSS animations + the .landing::before
//         slowMove animation. Resumes instantly on return.
// ═══════════════════════════════════════════════════════════
document.addEventListener('visibilitychange', () => {
  const state = document.hidden ? 'paused' : 'running';

  // Pause/resume every firefly dot
  document.querySelectorAll('.firefly').forEach(el => {
    el.style.animationPlayState = state;
  });

  // Pause/resume the slow background gradient drift on .landing::before
  // We inject/update a <style> rule that overrides the CSS animation-play-state
  const styleId = 'visibility-pause-style';
  let pauseStyle = document.getElementById(styleId);
  if (!pauseStyle) {
    pauseStyle = document.createElement('style');
    pauseStyle.id = styleId;
    document.head.appendChild(pauseStyle);
  }
  pauseStyle.textContent = document.hidden
    ? `.landing::before { animation-play-state: paused !important; }`
    : '';
});


// fix below error null when trying to read the 
//script.js:290 Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
//  at script.js:290:20
//fixed by putting it into an initialize function..
function initializeJustFireF() {
  const navbar    = document.getElementById("navbar");
  const content   = document.getElementById("content");
  const JustFireF = document.getElementById("JustFireF");

  /* ── Create the dismissible toast message ── */
  const toast = document.createElement("div");
  toast.id = "justFireF-toast";
  toast.innerHTML = `
    <span>Click, <kbd>Space</kbd> or <kbd>Esc</kbd> to return</span>
    <button id="justFireF-ok">OK</button>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(10, 10, 26, 0.75);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.78rem;
    font-family: system-ui, sans-serif;
    letter-spacing: 0.05em;
    padding: 0.55rem 1rem 0.55rem 1.2rem;
    border-radius: 999px;
    pointer-events: auto;
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: 9999;
    white-space: nowrap;
  `;

  /* Style the kbd tags */
  toast.querySelectorAll("kbd").forEach(k => {
    k.style.cssText = `
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
      padding: 1px 5px;
      font-family: inherit;
      font-size: 0.75rem;
    `;
  });

  /* Style the OK button */
  const okBtn = toast.querySelector("#justFireF-ok");
  okBtn.style.cssText = `
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.8);
    font-size: 0.72rem;
    font-family: system-ui, sans-serif;
    padding: 3px 12px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s ease;
  `;
  okBtn.addEventListener("mouseenter", () => okBtn.style.background = "rgba(255,255,255,0.22)");
  okBtn.addEventListener("mouseleave", () => okBtn.style.background = "rgba(255,255,255,0.12)");

  document.body.appendChild(toast);

  /* ── Hide everything: enter firefly mode ── */
  function hide() {
    navbar.style.transition  = "opacity 0.5s ease";
    content.style.transition = "opacity 0.5s ease";
    navbar.style.opacity  = "0";
    content.style.opacity = "0";

    setTimeout(() => {
      navbar.style.display  = "none";
      content.style.display = "none";
      toast.style.opacity   = "1";
    }, 500);

    /*
     * Delay adding revert listeners by one event-loop tick so the
     * triggering click/tap doesn't immediately bubble into onPointer
     * and revert before the user has done anything.
     */
    setTimeout(() => {
      document.addEventListener("keydown",     onKey);
      document.addEventListener("click",       onPointer); /* mouse left-click */
      document.addEventListener("touchend",    onPointer); /* mobile tap        */
    }, 0);

    /* OK button dismisses the toast only — keeps firefly mode active */
    okBtn.addEventListener("click", dismissToast, { once: true });

    console.log("JustFireF — firefly mode ON");
  }

  /* ── Dismiss just the toast, stay in firefly mode ── */
  function dismissToast(e) {
    e.stopPropagation(); /* prevent the OK click bubbling into onPointer */
    toast.style.opacity = "0";
  }

  /* ── Revert: bring everything back ── */
  function revert() {
    toast.style.opacity = "0";

    navbar.style.display  = "";
    content.style.display = "";

    requestAnimationFrame(() => {
      navbar.style.opacity  = "1";
      content.style.opacity = "1";
    });

    document.removeEventListener("keydown",  onKey);
    document.removeEventListener("click",    onPointer);
    document.removeEventListener("touchend", onPointer);

    console.log("JustFireF — firefly mode OFF");
  }

  /* ── Pointer handler: mouse left-click OR mobile tap ── */
  function onPointer(e) {
    /* Ignore clicks on the toast itself so OK doesn't double-trigger */
    if (toast.contains(e.target)) return;
    revert();
  }

  /* ── Key handler: Space or Escape ── */
  function onKey(e) {
    if (e.code === "Space" || e.code === "Escape") {
      e.preventDefault();
      revert();
    }
  }

  JustFireF.addEventListener("click", hide);
}

