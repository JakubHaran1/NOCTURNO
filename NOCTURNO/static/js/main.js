"use strict";
import { menuFunction, show } from "./base.js";
const rowParties = document.querySelector(".row-parties");
const partiesBgc = document.querySelector(".parties_bgc");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);

// ////////////////////////////////////////////////
let animateFrame;
let currentX = 0;
let maxAvailable = partiesBgc.scrollWidth - rowParties.clientWidth;
let speed = 0;
const animate = () => {
  currentX += speed;
  if (currentX >= 0) {
    currentX = 0;
  }

  if (currentX <= -maxAvailable) {
    currentX = -maxAvailable;
    speed = 0;
  }
  // speed *= frict;
  console.log("cur", currentX);
  console.log(maxAvailable);
  console.log("sp", speed);

  partiesBgc.style.transform = `translateX(${currentX}px)`;

  // if (Math.abs(speed) > 25) {
  //   console.log(Math.abs(speed));
  //   animateFrame = requestAnimationFrame(() => animate(speed));
  // } else animateFrame = null;
  speed = 0;
  animateFrame = null;
};

if (matchMedia("(min-width: 724px)").matches) {
  // let friction = 0.5;

  window.addEventListener("resize", () => {
    maxAvailable = partiesBgc.scrollWidth - rowParties.clientWidth;
  });

  rowParties.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      console.log(maxAvailable);
      if (e.deltaY == 0) return;
      speed = e.deltaY;
      console.log(e.deltaY);
      if (!animateFrame) {
        animateFrame = requestAnimationFrame(() => animate());
      }
    },
    { passive: false }
  );
}
