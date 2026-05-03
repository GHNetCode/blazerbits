const slider = document.getElementById("themeSlider");
const root = document.documentElement;
const menu = document.getElementById("menu");




window.gtranslateSettings = {
  default_language: "en",
  native_language_names: true,
  detect_browser_language: true,
  languages: ["en","hu","cy","ga","nl","fr","de","it","es"],
  wrapper_selector: ".gtranslate_wrapper",
  flag_size: 16,
  // switcher_vertical_position: "top",
  switcher_horizontal_position:"inline",
  flag_style: "3d",
  switcher_text_color:"#f7f7f7",
  switcher_arrow_color:"#f2f2f2",
  switcher_border_color:"#161616",
  switcher_border_radius:"10",
  switcher_background_color:"#040308",
  switcher_background_shadow_color:"#232323",
  switcher_background_hover_color:"#3a3a3a",
  dropdown_text_color:"#eaeaea",
  dropdown_hover_color:"#3a3a3a",
  dropdown_background_color:"#040308"
};


/*Temporarily disabled due to navigation bar added*/
// const hamburger = document.getElementById("hamburger");


/* LOAD SAVED THEME */
const saved = localStorage.getItem("themeValue");
if (slider) {
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

/* APPLY THEME */
function applyTheme(value) {
  // Convert 0–100 → lightness scale
  const lightness = value / 100;

  // Background interpolation
  const bg = interpolateColor([0,0,0], [245,245,245], lightness);
  const text = interpolateColor([234,234,234], [20,20,20], lightness);

  root.style.setProperty("--bg", `rgb(${bg})`);
  root.style.setProperty("--text", `rgb(${text})`);
}

/* COLOR INTERPOLATION */
function interpolateColor(start, end, factor) {
  return start.map((s, i) => Math.round(s + factor * (end[i] - s))).join(",");
}



/* MENU TOGGLE */ //Temporarily disabled due to navigation bar added.
  hamburger.addEventListener("click", () => {
    menu.classList.toggle("active");
    hamburger.classList.toggle("active");
  });
  //If User Clicks Outside to Close Menu
    menu.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-content")) {
      menu.classList.remove("active");
      hamburger.classList.remove("active");
    }
  });

