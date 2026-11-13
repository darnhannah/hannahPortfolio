const main = document.querySelector("main");
const sections = [...document.querySelectorAll("main section")];
const links = [...document.querySelectorAll(".rail-right a")];
const desktop = window.matchMedia("(min-width: 861px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let index = 0;
let locked = false;

function setActive(next) {
  index = next;
  links.forEach((link, i) => {
    const active = i === next;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function goTo(next) {
  const target = Math.max(0, Math.min(sections.length - 1, next));
  setActive(target);
  locked = true;
  sections[target].scrollIntoView({
    behavior: reduceMotion.matches ? "auto" : "smooth",
    block: "start",
  });
  window.setTimeout(() => {
    locked = false;
  }, reduceMotion.matches ? 50 : 800);
}

links.forEach((link, i) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    goTo(i);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    if (locked) return;
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    setActive(sections.indexOf(visible.target));
  },
  { root: main, threshold: [0.55, 0.75] }
);

sections.forEach((section) => observer.observe(section));

window.addEventListener(
  "wheel",
  (event) => {
    if (!desktop.matches) return;
    event.preventDefault();
    if (locked || Math.abs(event.deltaY) < 12) return;
    goTo(index + (event.deltaY > 0 ? 1 : -1));
  },
  { passive: false }
);

const initial = sections.findIndex((section) => section.id === location.hash.slice(1));
setActive(initial > -1 ? initial : 0);
if (initial > 0) {
  sections[initial].scrollIntoView({ behavior: "auto", block: "start" });
}

window.addEventListener("keydown", (event) => {
  if (!desktop.matches || locked) return;
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    goTo(index + 1);
  } else if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    goTo(index - 1);
  }
});
