"use strict";
import { menuFunction, show } from "./base.js";
const rowParties = document.querySelector(".row-parties");
const partiesBgc = document.querySelector(".parties_bgc");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);

// ////////////////////////////////////////////////
let animateFrame;
let currentX = 0;
let maxAvailable = rowParties.clientWidth - partiesBgc.scrollWidth;
const animate = (speed, frict) => {
  currentX += speed;
  speed *= frict;
  console.log(maxAvailable);
  if (currentX > 0) return;
  else if (currentX >= maxAvailable) return;

  partiesBgc.style.transform = `translateX(${currentX}px)`;

  console.log(Math.abs(speed));
  if (Math.abs(speed) > 0.1)
    animateFrame = requestAnimationFrame(() => animate(speed, frict, max));
  else animateFrame = null;
};

if (matchMedia("(min-width: 724px)").matches) {
  let friction = 0.95;

  let speed = 0;

  window.addEventListener("resize", () => {
    maxAvailable = partiesBgc.scrollWidth - rowParties.clientWidth;
  });

  rowParties.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      console.log(partiesBgc.scrollWidth, rowParties.clientWidth);
      if (e.deltaY == 0) return;
      speed -= e.deltaY;

      if (!animateFrame) {
        console.log(speed);
        animateFrame = requestAnimationFrame(() => animate(speed, friction));
      }
    },
    { passive: false }
  );
}
