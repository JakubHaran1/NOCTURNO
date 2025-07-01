"use strict";
import { menuFunction, show, partiesSlider } from "./base.js";
const rowParties = document.querySelectorAll(".row-parties");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);
if (matchMedia("(min-width: 724px)").matches)
  rowParties.forEach((el) => {
    el.addEventListener("wheel", partiesSlider);
  });
