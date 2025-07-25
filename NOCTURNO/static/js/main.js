"use strict";
import { menuFunction, show } from "./base.js";
const rowParties = document.querySelector(".row-parties");
const partiesBgc = document.querySelector(".parties_bgc");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);

// ////////////////////////////////////////////////

let maxAvailable = partiesBgc.scrollWidth - rowParties.clientWidth;
let currentX = 0;

const animate = (frame, speed, frict) => {
  currentX += speed;
  partiesBgc.style.transform = `translateX(${currentX}px)`;
  if (currentX >= 0) {
    currentX = 0;
  }

  if (currentX <= -maxAvailable) {
    currentX = -maxAvailable;
    speed = 0;
  }
  speed *= frict;
  console.log("cur", currentX);
  console.log(maxAvailable);
  console.log("sp", speed);

  if (Math.abs(speed) > 0.1) {
    console.log(Math.abs(speed));
    frame = requestAnimationFrame(() => animate(frame, speed, frict));
  } else {
    frame = undefined;
    speed = 0;
  }
};

if (matchMedia("(min-width: 724px)").matches) {
  window.addEventListener("resize", () => {
    maxAvailable = partiesBgc.scrollWidth - rowParties.clientWidth;
  });

  let animateFrame;

  let friction = 0.75;

  rowParties.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      let speed = 0;

      if (e.deltaY == 0) return;
      speed = e.deltaY;
      if (!animateFrame) {
        animateFrame = requestAnimationFrame(() => {
          animate(animateFrame, speed, friction);
          animateFrame = undefined;
        });
      }
    },
    { passive: false }
  );
}
