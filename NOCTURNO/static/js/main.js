"use strict";
import { menuFunction, show } from "./base.js";
const rowParties = document.querySelector(".row-parties");
const partiesBgc = document.querySelector(".parties_bgc");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);

// ////////////////////////////////////////////////

const animate = (inner, outer, speed) => {
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

if (matchMedia("(min-width: 724px)").matches) {
  rowParties.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      let speed = e.deltaY;

      if (speed == 0) return;

      animate(partiesBgc, rowParties, speed);
    },
    { passive: false }
  );
}
