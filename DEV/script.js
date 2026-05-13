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
    });  
      /* LOAD SAVED THEME */
      function initializeThemeSlider() {
        const slider = document.getElementById("themeSlider");
        if (!slider) return;
        const saved = localStorage.getItem("themeValue");
        if (saved) {
          slider.value = saved;
          applyTheme(saved);
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
        const menu = document.getElementById("menu");
        const hamburger = document.getElementById("hamburger");
        if (!menu || !hamburger) return;
        hamburger.addEventListener("click", () => {
                  menu.classList.toggle("active");
                  hamburger.classList.toggle("active");
              });
            
        menu.addEventListener("click", (e) => {
          if (!e.target.closest(".mobile-menu-content")) {
            menu.classList.remove("active");
            hamburger.classList.remove("active");
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
  const bg = interpolateColor([0,0,0], [245,245,245], lightness);
  const text = interpolateColor([234,234,234], [20,20,20], lightness);
  root.style.setProperty("--bg", `rgb(${bg})`);
  root.style.setProperty("--text", `rgb(${text})`);
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




// To resolve Default language (English) from being displayed
// when switch between languages adding a small delay.


