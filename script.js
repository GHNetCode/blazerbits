const root = document.documentElement;

// Determine base path for assets
function getBasePath() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/projects/')) {
        return '../';
    }
    return '';
}

// Get the base path once
const basePath = getBasePath();
//console.log('Base path:', basePath);

// FIXED: Use basePath in fetch calls
fetch(basePath + 'navbar.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Navbar not found at: ' + basePath + 'navbar.html');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('navbar').innerHTML = data;
        // Initialize components
        initializeGTranslate();
        initializeThemeSlider();
        initializeMobileMenu();
        initializeJustFireF();
        // NO NEED for initializeNavbar() - using root-relative paths!
    })
    .catch(error => {
        console.warn('Could not load navbar:', error);
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.innerHTML = '<div style="padding: 1rem; text-align: center; opacity: 0.5;">Navigation unavailable</div>';
        }
    });

// REMOVE updateNavbarLinks() and initializeNavbar() entirely

// FIXED: Use basePath in modal fetch
fetch(basePath + 'modal.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('Modal not found at: ' + basePath + 'modal.html');
        }
        return response.text();
    })
    .then(data => {
        const container = document.getElementById('loginModalContainer');
        if (container) {
            container.innerHTML = data;
            setTimeout(initializeLoginModal, 100);
        }
    })
    .catch(error => {
        console.warn('Could not load modal:', error);
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
    script.src = 'https://cdn.gtranslate.net/widgets/latest/dwf.js';

    script.defer = true;
    script.setAttribute('data-gtranslate', 'true');
    document.body.appendChild(script);
}

function initializeMobileMenu() {
    const menu = document.getElementById("menu");
    const hamburger = document.getElementById("hamburger");
    const root = document.getElementById("mob-panel-root");
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
        
        // Prevent body scroll when menu is open (improves performance)
        if (isOpen) {
            document.body.classList.add("menu-open");
        } else {
            document.body.classList.remove("menu-open");
            closeAllSubmenus();
        }
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
            document.body.classList.remove("menu-open");
            closeAllSubmenus();
        }
    });
}

window.gtranslateSettings = {
    default_language: "en",
    native_language_names: true,
    detect_browser_language: true,
    languages: ["en", "hu", "cy", "ga", "iw", "nl", "fr", "de", "it", "es"],
    wrapper_selector: ".gtranslate_wrapper",
    flag_size: 16,
    // switcher_vertical_position: "top",
    switcher_horizontal_position: "inline",
    flag_style: "3d",
    // switcher_text_color:"#f7f7f7",
    // switcher_text_color:"#ffffff",
    // switcher_arrow_color:"#f2f2f2",
    // switcher_arrow_color:"#f2f2f2",
    switcher_border_color: "#161616",
    switcher_border_radius: "10",
    switcher_background_color: "#040308",
    switcher_background_shadow_color: "#232323",
    switcher_background_hover_color: "#3a3a3a",
    dropdown_text_color: "#ffffff",
    dropdown_hover_color: "#3a3a3a",
    dropdown_background_color: "#040308"
};

//--------------------------------------- 
/* APPLY THEME Start*/
function applyTheme(value) {
    const lightness = value / 100;

    const bg = interpolateColor([14, 16, 24], [14, 16, 24], lightness);

    const text = interpolateColor([255, 255, 255], [20, 20, 20], lightness);
    const accent = interpolateColor([181, 210, 254], [38, 42, 44], lightness);
    const accentBtn = interpolateColor([63, 73, 87], [27, 33, 42], lightness);
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
 * Now wrapped in a function that only runs on pages with the required containers
 */
function initFireflies() {
    // Skip if the page signals it doesn't want fireflies
    if (window.skipFireflies) {
        console.log('Fireflies: skipped by page flag');
        return;
    }

    const back = document.getElementById('particles-back');
    const front = document.getElementById('particles-front');
    const landing = document.querySelector('.landing');

    // Guard: only run if both containers exist AND we're on the landing page
    if (!back || !front || !landing) {
        console.log('Fireflies: containers not found or not on landing page — skipping');
        return;
    }

    const FIREFLY_COUNT = 20;

    // Weighted palette — warm amber/gold dominant, rare cool accent
    const palette = [
        { r: 255, g: 210, b: 80, w: 5 },  // warm gold
        { r: 255, g: 190, b: 50, w: 4 },  // deep amber
        { r: 220, g: 255, b: 130, w: 4 },  // soft lime-green
        { r: 255, g: 230, b: 140, w: 4 },  // pale gold
        { r: 180, g: 255, b: 160, w: 3 },  // cool mint
        { r: 200, g: 220, b: 255, w: 1 },  // icy blue-white accent
    ];

    const weighted = [];
    palette.forEach(c => { for (let w = 0; w < c.w; w++) weighted.push(c); });

    function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

    function randF(a, b) { return +(Math.random() * (b - a) + a).toFixed(3); }

    function pick(arr) { return arr[rand(0, arr.length - 1)]; }

    for (let i = 1; i <= FIREFLY_COUNT; i++) {

        const col = pick(weighted);
        const isFront = Math.random() < 0.25;

        // Size — tiny core dot
        const core = rand(2, 4);

        // Opacity range — back layer noticeably dimmer
        const dim = isFront ? randF(0.08, 0.30) : randF(0.04, 0.16);
        const bright = isFront ? randF(0.75, 0.99) : randF(0.55, 0.99);

        // Single glow shadow — one compositing op per frame
        const glowSpread = core * rand(4, 7);
        const glowAlpha = (isFront ? randF(0.3, 0.6) : randF(0.1, 0.3));
        const shadow = `0 0 ${glowSpread}px ${glowSpread / 2}px rgba(${col.r},${col.g},${col.b},${glowAlpha})`;

        // Drift path — gentle wander, slight upward bias
        const x0 = rand(5, 95);
        const y0 = rand(15, 90);
        const xMid = Math.min(95, Math.max(5, x0 + rand(-20, 20)));
        const yMid = Math.min(90, Math.max(5, y0 + rand(-20, 5)));
        const x1 = Math.min(95, Math.max(5, x0 + rand(-25, 25)));
        const y1 = Math.min(85, Math.max(5, y0 + rand(-30, 10)));

        // Durations — long and lazy
        const duration = rand(20000, 55000);
        const delay = rand(0, 30000);

        const el = document.createElement('div');
        el.className = 'firefly';
        
        // Set all properties as inline styles — CSS custom properties for the animation
        el.style.cssText = `
            width: ${core}px;
            height: ${core}px;
            background: rgba(${col.r},${col.g},${col.b},1);
            box-shadow: ${shadow};
            --x0: ${x0}vw;
            --y0: ${y0}vh;
            --xMid: ${xMid}vw;
            --yMid: ${yMid}vh;
            --x1: ${x1}vw;
            --y1: ${y1}vh;
            --dim: ${dim};
            --bright: ${bright};
            animation: firefly-drift ${duration}ms -${delay}ms infinite linear;
        `;

        (isFront ? front : back).appendChild(el);
    }
}

// Initialize fireflies when DOM is ready
if (document.readyState === 'complete') {
    initFireflies();
} else {
    document.addEventListener('DOMContentLoaded', initFireflies);
}
 

 function initializeJustFireF() {
    const navbar = document.getElementById("navbar");
    const content = document.getElementById("content");
    const justFireFBtns = document.querySelectorAll("#JustFireF");
    const menu = document.getElementById("menu");
    const hamburger = document.getElementById("hamburger");

    if (!justFireFBtns.length) return;

    /* ── Create the dismissible toast message ── */
    const toast = document.createElement("div");
    toast.id = "justFireF-toast";
    toast.innerHTML = `
        <span>Tap or press <kbd>Esc</kbd> to return</span>
        <button id="justFireF-ok">OK</button>
    `;

    document.body.appendChild(toast);

    const okBtn = toast.querySelector("#justFireF-ok");

    /* ── Hide everything: enter firefly mode ── */
    function hide() {
        // Close mobile menu if open
        if (menu && menu.classList.contains("active")) {
            menu.classList.remove("active");
            if (hamburger) hamburger.classList.remove("active");
            menu.querySelectorAll(".mob-submenu.active").forEach(s => s.classList.remove("active"));
            const root = document.getElementById("mob-panel-root");
            if (root) root.classList.remove("dimmed");
        }

        if (navbar) {
            navbar.style.transition = "opacity 0.5s ease";
            navbar.style.opacity = "0";
        }
        if (content) {
            content.style.transition = "opacity 0.5s ease";
            content.style.opacity = "0";
        }

        setTimeout(() => {
            if (navbar) navbar.style.display = "none";
            if (content) content.style.display = "none";
            toast.style.opacity = "1";
        }, 500);

        setTimeout(() => {
            document.addEventListener("keydown", onKey);
            document.addEventListener("click", onPointer);
            document.addEventListener("touchend", onPointer);
        }, 0);

        okBtn.addEventListener("click", dismissToast, { once: true });
    }

    function dismissToast(e) {
        e.stopPropagation();
        toast.style.opacity = "0";
    }

    function revert() {
        toast.style.opacity = "0";
        if (navbar) { navbar.style.display = ""; }
        if (content) { content.style.display = ""; }
        requestAnimationFrame(() => {
            if (navbar) navbar.style.opacity = "1";
            if (content) content.style.opacity = "1";
        });
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("click", onPointer);
        document.removeEventListener("touchend", onPointer);
    }

    function onPointer(e) {
        if (toast.contains(e.target)) return;
        revert();
    }

    function onKey(e) {
        if (e.code === "Space" || e.code === "Escape") {
            e.preventDefault();
            revert();
        }
    }

    // Attach to ALL JustFireF buttons
    justFireFBtns.forEach(btn => btn.addEventListener("click", hide));
}


// ============================================================
// LOGIN NOTICE MODAL
// ============================================================
function initializeLoginModal() {
  const modal = document.getElementById('loginModal');
  const closeBtn = document.getElementById('loginModalClose');
  const gotItBtn = document.getElementById('loginModalGotIt');
  const notifyBtn = document.getElementById('loginModalNotify');
  
  if (!modal) return;
  
  // ── Open modal ──
  function openModal(e) {
    if (e) e.preventDefault();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // ── Close modal ──
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // ── Attach to Login buttons ──
  // Desktop login (top-right nav)
  const loginLinks = document.querySelectorAll('.nav-right a[href="login.html"]');
  loginLinks.forEach(link => {
    link.addEventListener('click', openModal);
    // Keep the href for fallback, but prevent navigation
    link.addEventListener('click', (e) => e.preventDefault());
  });
  
  // Main "Login" button in centre of landing page
  const mainLoginBtn = document.querySelector('.buttons .secondary');
  if (mainLoginBtn) {
    mainLoginBtn.addEventListener('click', openModal);
  }
  
  // Also catch any other login buttons by text content
document.querySelectorAll('a, button').forEach(el => {
  const text = el.textContent.trim();
  
  // Check if this element should trigger the modal
  const shouldShowModal = 
    (text === 'Login' && !el.closest('.nav-left') && !el.closest('.logo')) ||
    ((text === 'BlazerBits' || 
      text === 'FAQ' || 
      text === 'Blog Profiles' ||
      text === 'Highlighted Posts') && 
     (el.closest('.dropdown') || el.closest('.mob-submenu')));/* ||
    (text === 'Just Fireflies' && (el.closest('.dropdown') || el.closest('.mob-submenu')));
     */
  if (shouldShowModal) {
    el.removeEventListener('click', openModal);
    el.addEventListener('click', openModal);
    el.removeEventListener('click', (e) => e.preventDefault());
    el.addEventListener('click', (e) => e.preventDefault());
  }
});

  
  // ── Close handlers ──
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (gotItBtn) gotItBtn.addEventListener('click', closeModal);
  
  if (notifyBtn) {
    notifyBtn.addEventListener('click', () => {
      alert('We\'ll notify you as soon as login is ready! 🚀');
      closeModal();
    });
  }
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

// ── Call initialiser after navbar loads ──
// Wrap in a small delay to ensure DOM is ready
if (document.readyState === 'complete') {
  initializeLoginModal();
} else {
  document.addEventListener('DOMContentLoaded', initializeLoginModal);
}

// Also re-initialise after navbar fetch (in case login links are injected)
const origFetch = window.fetch;
// We'll hook into the existing navbar fetch
const navbarObserver = new MutationObserver(() => {
  if (document.querySelector('.nav-right a[href="login.html"]')) {
    initializeLoginModal();
    navbarObserver.disconnect();
  }
});
navbarObserver.observe(document.body, { childList: true, subtree: true });

// Fallback: re-run after 2 seconds
setTimeout(initializeLoginModal, 2000);

// Load the login modal
//  fetch('modal.html')
//    .then(response => response.text())
//    .then(data => {
//      document.getElementById('loginModalContainer').innerHTML = data;
//      // Initialize after modal is loaded
//      setTimeout(initializeLoginModal, 100);
//    })
//    .catch(() => {
//      // Fallback: if modal.html doesn't exist, check if modal is already in page
//      setTimeout(initializeLoginModal, 100);
//    });