"use strict";

import { menuFunction } from "./_menuScroll.js";

let timeOut;

const show = () => {
  const menu = document.querySelector(".nav");
  menu.classList.add("scroll");
  clearTimeout(timeOut);
  timeOut = setTimeout(() => {
    menu.classList.remove("scroll");
  }, 300);
};

const main = () => {
  window.addEventListener("scroll", show);
  menuFunction();
};

document.addEventListener("DOMContentLoaded", main);
