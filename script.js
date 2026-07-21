//const root = document.documentElement;

// Determine base path for assets
function getBasePath() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('/projects/')&& !path.includes('/projects/projects-1/')) {
        console.log("found: /projects/")
        return '../';
    }else if (path.includes('/projects/projects-1/')) {
        console.log("found: /projects/projects-1/ ")
        return '../../';
    }
    else{
        return ''; 
    }
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
        
        // ── CHECK FIREFLIES AFTER NAVBAR IS LOADED ──
        // This ensures the #JustFireF buttons exist in the DOM
        checkAndHideFireflyButton();
 
        
    })
    .catch(error => {
        console.warn('Could not load navbar:', error);
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.innerHTML = '<div style="padding: 1rem; text-align: center; opacity: 0.5;">Navigation unavailable</div>';
        }
    });

 
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

    // Track state
    let isMenuOpen = false;
    let touchStartTarget = null;

    function closeAllSubmenus() {
        menu.querySelectorAll(".mob-submenu.active").forEach(s => s.classList.remove("active"));
        if (root) root.classList.remove("dimmed");
    }

    function openSubmenu(id) {
        closeAllSubmenus();
        const sub = document.getElementById(id);
        if (sub) {
            sub.classList.add("active");
            if (root) root.classList.add("dimmed");
        }
    }

    // Clear text selection helper
    function clearSelection() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    }

    // ── Open / close overlay ──
    hamburger.addEventListener("click", (e) => {
        e.preventDefault();
        clearSelection();
        
        isMenuOpen = !isMenuOpen;
        menu.classList.toggle("active", isMenuOpen);
        hamburger.classList.toggle("active", isMenuOpen);
        
        if (isMenuOpen) {
            document.body.classList.add("menu-open");
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove("menu-open");
            document.body.style.overflow = '';
            closeAllSubmenus();
        }
    });

    // ── Touch event handling for better mobile support ──
    menu.addEventListener('touchstart', (e) => {
        // Store the target for later use
        touchStartTarget = e.target;
        
        // Prevent default on interactive elements to avoid selection
        if (e.target.closest('a') || e.target.closest('button') || 
            e.target.closest('.mob-drill') || e.target.closest('.mob-close')) {
            // Don't prevent default completely - allow scrolling
        }
    }, { passive: true });

    menu.addEventListener('touchend', (e) => {
        // Clear any text selection that might have occurred
        clearSelection();
        
        // If touch was on an interactive element, handle it
        const target = e.target.closest('a, button, .mob-drill, .mob-close');
        if (target) {
            // Simulate click after touch ends
            setTimeout(() => {
                target.click();
            }, 10);
        }
    }, { passive: true });

    // ── Click event delegation ──
    menu.addEventListener("click", (e) => {
        // Clear selection on any click
        clearSelection();
        
        const drillBtn = e.target.closest(".mob-drill");
        const closeBtn = e.target.closest(".mob-close");

        // Handle drill buttons
        if (drillBtn) {
            e.preventDefault();
            e.stopPropagation();
            clearSelection();
            openSubmenu(drillBtn.dataset.target);
            return;
        }

        // Handle close buttons
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            clearSelection();
            closeAllSubmenus();
            return;
        }

        // Handle backdrop click
        if (e.target === menu || e.target === menu.querySelector('.mobile-menu-content')) {
            e.preventDefault();
            clearSelection();
            menu.classList.remove("active");
            hamburger.classList.remove("active");
            document.body.classList.remove("menu-open");
            document.body.style.overflow = '';
            closeAllSubmenus();
        }
    });

    // ── Prevent context menu on long press ──
    menu.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // Also prevent context menu on hamburger
    hamburger.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    // ── Global touch prevention when menu is open ──
    document.addEventListener('touchmove', (e) => {
        if (isMenuOpen && e.target.closest('.mobile-menu-overlay')) {
            // Allow scrolling within menu
        }
    }, { passive: true });

    // Clear selection on any touch interaction with the menu
    menu.addEventListener('mousedown', clearSelection);
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
//const root = document.documentElement;
function applyTheme(value) {
    const root = document.documentElement;

    const lightness = value / 100;  // 0.0 to 0.8 (since max is 80)

    // FIX: Background actually changes now (was interpolating same color twice)
    const bg = interpolateColor([14, 16, 24], [255, 255, 255], lightness);
 //   const bg = interpolateColor([14, 16, 24], [20, 22, 32], lightness * 0.4); // Very subtle shift
    const text = interpolateColor([255, 255, 255], [20, 20, 20], lightness);
    const text1 = interpolateColor([220, 220, 220], [20, 20, 20], lightness);
    const accent = interpolateColor([212, 222, 237], [38, 42, 44], lightness);
    const accentBtn = interpolateColor([63, 73, 87], [27, 33, 42], lightness);
    
    root.style.setProperty("--bg", `rgb(${bg})`);
    root.style.setProperty("--text", `rgb(${text})`);
    root.style.setProperty("--text1", `rgb(${text1})`);
    root.style.setProperty("--accent", `rgb(${accent})`);
    root.style.setProperty("--accentBtn", `rgb(${accentBtn})`);
    
    // CORRECTED: Left (low value) = LIGHT, Right (high value) = DARK   -- <0.5
    if (lightness < 0.3) {
        document.body.setAttribute('data-theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
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
 * CHECK AND HIDE FIREFLY BUTTON
 * ═══════════════════════════════════════════════
 * This function runs after navbar loads to check if fireflies should be shown
 */
function checkAndHideFireflyButton() {
    const back = document.getElementById('particles-back');
    const front = document.getElementById('particles-front');
    const landing = document.querySelector('.landing');

    // If firefly containers don't exist, hide the button
    if (!back || !front || !landing) {
        console.log('Fireflies: containers not found — hiding button');
        const justFireFBtns = document.querySelectorAll('#JustFireF');
        justFireFBtns.forEach(btn => {
            btn.classList.add('hidden');
        });
    }
}

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
        // The button is already hidden by checkAndHideFireflyButton()
        return;
    }

    // If we get here, fireflies should be shown — make sure button is visible
    const justFireFBtns = document.querySelectorAll('#JustFireF');
    justFireFBtns.forEach(btn => {
        btn.classList.remove('hidden');
    });

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
    // Wait a moment for the navbar to load
    setTimeout(() => {
        checkAndHideFireflyButton();
        initFireflies();
    }, 250);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a moment for the navbar to load
        setTimeout(() => {
            checkAndHideFireflyButton();
            initFireflies();
        }, 250);
    });
}
 

function initializeJustFireF() {
    const navbar = document.getElementById("navbar");
    const content = document.getElementById("content");
    const justFireFBtns = document.querySelectorAll("#JustFireF");
    const menu = document.getElementById("menu");
    const hamburger = document.getElementById("hamburger");
    const mobPanelRoot = document.getElementById("mob-panel-root");

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

    // Track state
    let isFireflyMode = false;
    let pressTimer = null;

    // Clear selection helper
    function clearSelection() {
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        } else if (document.selection) {
            document.selection.empty();
        }
    }

    /* ── Hide everything: enter firefly mode ── */
    function hide(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (isFireflyMode) return;
        isFireflyMode = true;
        
        // Clear any text selection
        clearSelection();
        document.body.classList.add('firefly-mode-active');
        toast.style.opacity = "1";

        setTimeout(() => {
            // Close mobile menu
            if (menu) {
                menu.classList.remove("active");
                menu.style.display = "";
            }
            if (hamburger) {
                hamburger.classList.remove("active");
            }
            
            document.body.classList.remove("menu-open");
            document.body.style.overflow = '';
            
            if (mobPanelRoot) {
                mobPanelRoot.classList.remove("dimmed");
            }
            
            document.querySelectorAll(".mob-submenu.active").forEach(s => s.classList.remove("active"));

            // Hide navbar/content
            if (navbar) {
                navbar.style.transition = "none";
                navbar.style.display = "none";
            }
            if (content) {
                content.style.transition = "none";
                content.style.display = "none";
            }
        }, 300);

        setTimeout(() => {
            document.addEventListener("keydown", onKey);
            document.addEventListener("click", onPointer);
        }, 450);

        okBtn.addEventListener("click", dismissToast, { once: true });
    }

    function dismissToast(e) {
        e.stopPropagation();
        toast.style.opacity = "0";
    }

    function revert() {
        if (!isFireflyMode) return;
        
        isFireflyMode = false;
        document.body.classList.remove('firefly-mode-active');
        toast.style.opacity = "0";
        clearSelection();
        
        if (navbar) {
            navbar.style.display = "";
            navbar.style.transition = "";
        }
        if (content) {
            content.style.display = "";
            content.style.transition = "";
        }
        
        if (menu) {
            menu.classList.remove("active");
            menu.style.display = "";
        }
        if (hamburger) {
            hamburger.classList.remove("active");
        }
        
        document.body.classList.remove("menu-open");
        document.body.style.overflow = '';
        
        if (mobPanelRoot) {
            mobPanelRoot.classList.remove("dimmed");
        }
        
        document.querySelectorAll(".mob-submenu.active").forEach(s => s.classList.remove("active"));

        document.removeEventListener("keydown", onKey);
        document.removeEventListener("click", onPointer);
        clearSelection();
    }

    function onPointer(e) {
        if (isFireflyMode && !e.target.closest('#JustFireF')) {
            revert();
        }
    }

    function onKey(e) {
        if ((e.code === "Space" || e.code === "Escape") && isFireflyMode) {
            e.preventDefault();
            revert();
        }
    }

    // ── Button Event Handlers ──
    justFireFBtns.forEach(btn => {
        // Remove old listeners to prevent duplicates
        btn.removeEventListener('mousedown', handlePressStart);
        btn.removeEventListener('touchstart', handlePressStart);
        btn.removeEventListener('mouseup', handlePressEnd);
        btn.removeEventListener('touchend', handlePressEnd);
        btn.removeEventListener('touchcancel', handlePressEnd);
        btn.removeEventListener('click', handleClick);
        btn.removeEventListener('contextmenu', preventContextMenu);
        
        // Add fresh listeners
        btn.addEventListener('mousedown', handlePressStart);
        btn.addEventListener('touchstart', handlePressStart, { passive: true });
        btn.addEventListener('mouseup', handlePressEnd);
        btn.addEventListener('touchend', handlePressEnd, { passive: true });
        btn.addEventListener('touchcancel', handlePressEnd, { passive: true });
        btn.addEventListener('click', handleClick);
        btn.addEventListener('contextmenu', preventContextMenu);
    });

    function handlePressStart(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        
        if (!isFireflyMode) {
            pressTimer = setTimeout(() => {
                if (!isFireflyMode) {
                    if (e.type === 'touchstart') {
                        e.preventDefault();
                    }
                    pressTimer = null;
                }
            }, 1000);
        }
    }

    function handlePressEnd(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        clearSelection();
    }

    function handleClick(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
        
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
        
        if (!isFireflyMode) {
            hide(e);
        }
    }
    
    function preventContextMenu(e) {
        e.preventDefault();
        return false;
    }
}


// ============================================================
// LOGIN\"Under construction" NOTICE MODAL
// ============================================================
function initializeLoginModal() {
    const modal = document.getElementById('loginModal');
    const closeBtn = document.getElementById('loginModalClose');
    const gotItBtn = document.getElementById('loginModalGotIt');
    const notifyBtn = document.getElementById('loginModalNotify');

    if (!modal) return;

    // ── Open modal ──
    function openModal(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // ── Close modal ──
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── SIMPLIFIED: Direct click handler for ALL login links ──
    document.addEventListener('click', function(e) {
        const target = e.target.closest('a, button');
        if (!target) return;

        // Check if it's a project tile with valid href
        const projectTile = target.closest('.project-tile');
        if (projectTile) {
            const href = projectTile.getAttribute('href');
            if (projectTile.hasAttribute('data-modal-trigger') && (!href || href === '#')) {
                e.preventDefault();
                e.stopPropagation();
                openModal(e);
                return;
            }
            return;
        }

        // ── FIXED: Simple text-based check for login ──
        const text = target.textContent.trim();
        const href = target.getAttribute('href');
        
        // Check if this is a login link (by text or href)
        if (text === 'Login' || href === '/login.html' || href === 'login.html') {
            // Don't intercept if it's the logo area or desktop nav-left (if you want to keep those working)
            // But since you want all Login to show modal, remove the exclusion
            
            e.preventDefault();
            e.stopPropagation();
            openModal(e);
            return;
        }

        // Nav dropdown items
        if (['BlazerBits', 'FAQ', 'Blog Profiles', 'Highlighted Posts'].includes(text) && 
            (target.closest('.dropdown') || target.closest('.mob-submenu'))) {
            e.preventDefault();
            e.stopPropagation();
            openModal(e);
        }
    }, true);

    // ── Close handlers ──
    if (closeBtn) closeBtn.onclick = closeModal;
    if (gotItBtn) gotItBtn.onclick = closeModal;
    if (notifyBtn) {
        notifyBtn.onclick = () => {
            alert('We\'ll notify you as soon as login is ready! 🚀');
            closeModal();
        };
    }

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    document.onkeydown = (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    };
}

// ── CALL ONCE, AT THE RIGHT TIME ──
// Run AFTER navbar loads (ensure login links exist)
if (document.readyState === 'complete') {
    setTimeout(initializeLoginModal, 100);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeLoginModal, 100);
    });
}

// REMOVED: MutationObserver and fallback timeout (prevents duplicate bindings)

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