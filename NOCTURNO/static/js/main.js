"use strict";
const main = () => {
  const menu = document.querySelector(".nav");
  const menuFunction = () => {
    const menuHeight = menu.getBoundingClientRect().height;

    const layout = document.querySelector(".layout");

    layout.style.marginBottom = `${menuHeight + menuHeight / 2}px`;
  };

  menuFunction();
};
document.addEventListener("DOMContentLoaded", main);
