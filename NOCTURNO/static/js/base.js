("use strict");
let timeOut;
const menu = document.querySelector(".nav");

const show = () => {
  menu.classList.add("scroll");
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    menu.classList.remove("scroll");
  }, 300);
};
const menuFunction = () => {
  const menuHeight = menu.getBoundingClientRect().height;

  const layout = document.querySelector(".layout");

  layout.style.marginBottom = `${menuHeight + menuHeight / 2}px`;
};

const main = () => {
  window.addEventListener("scroll", show);

  menuFunction();
};

document.addEventListener("DOMContentLoaded", main);
