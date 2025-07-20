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

export { menuFunction, iconLoad, show };
