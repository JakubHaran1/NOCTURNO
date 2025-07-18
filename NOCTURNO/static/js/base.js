"use strict";
const nav = document.querySelector(".nav");

const menuFunction = () => {
  window.addEventListener("scroll", show);
  const menu = document.querySelector(".nav");
  const menuHeight = menu.getBoundingClientRect().height;
  const layout = document.querySelector(".layout");
  layout.style.marginBottom = `${menuHeight + menuHeight / 2}px`;
};

const iconLoad = () => {
  const layout = document.querySelector(".layout");
  layout.classList.add("unload");
  window.addEventListener("load", () => {
    layout.classList.remove("unload");
  });
};

//
let timeOut;
const show = () => {
  clearTimeout(timeOut);
  nav.classList.add("scroll");
  timeOut = setTimeout(() => {
    nav.classList.remove("scroll");
  }, 300);
};

let lastScroll = container.scrollLeft;
let working = false;
const partiesSlider = (e) => {
  e.preventDefault();
  const now = Date.now();
  if (!e.target.closest(".row-parties")) return;
  const container = e.target.closest(".row-parties");
  if (e.deltaY != 0) {
    container.scrollLeft -= e.deltaY;
  }
  console.log(e);
};

export { menuFunction, iconLoad, show, partiesSlider };
