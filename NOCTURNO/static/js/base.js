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

const animateScroll = (inner, outer, speed) => {
  let maxScroll = inner.scrollWidth - outer.clientWidth;
  let currX = new Number(inner.style.transform.match(/-?\d+/g));
  currX += speed;
  console.log(currX);
  if (currX > 0) {
    currX = 0;
  } else if (currX <= -maxScroll) {
    currX = -maxScroll;
  }
  inner.style.transform = `translateX(${currX}px)`;
};

export { menuFunction, iconLoad, show, animateScroll };
