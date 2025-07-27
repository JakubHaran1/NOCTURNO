"use strict";
import { menuFunction, show, animateScroll } from "./base.js";
const rowTrendings = document.querySelector(".popular-party .row-parties");
const userPerties = document.querySelector(".user-party .row-parties");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);

// ////////////////////////////////////////////////

if (matchMedia("(min-width: 724px)").matches) {
  rowTrendings.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (e.deltaY == 0) return;
      const partiesBgc = rowTrendings.querySelector(".parties_bgc");
      animateScroll(partiesBgc, rowTrendings, e.deltaY);
    },
    { passive: false }
  );

  userPerties.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      if (e.deltaY == 0) return;
      const partiesBgc = userPerties.querySelector(".parties_bgc");
      animateScroll(partiesBgc, userPerties, e.deltaY);
    },
    { passive: false }
  );
}
