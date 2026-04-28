const slider = document.getElementById("themeSlider");
const root = document.documentElement;
const menu = document.getElementById("menu");
const hamburger = document.getElementById("hamburger");


/* LOAD SAVED THEME */
const saved = localStorage.getItem("themeValue");
if (saved) {
  slider.value = saved;
  applyTheme(saved);
console.log(slider.value);
}

/* SLIDER CHANGE */
slider.addEventListener("input", (e) => {
  const value = e.target.value;
  applyTheme(value);
  localStorage.setItem("themeValue", value);
  
});

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

/* MENU TOGGLE */
hamburger.addEventListener("click", () => {
  menu.classList.toggle("active");
});