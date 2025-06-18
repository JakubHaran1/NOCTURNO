"use strict";

const menuFunction = () => {
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

const show = () => {
  let timeOut;
  const menu = document.querySelector(".nav");
  menu.classList.add("scroll");
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    menu.classList.remove("scroll");
  }, 300);
};

export { menuFunction, iconLoad, show };
