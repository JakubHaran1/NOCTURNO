"use strict";
import { menuFunction, show, partiesSlider } from "./base.js";
const rowParties = document.querySelectorAll(".row-parties");
document.addEventListener("DOMContentLoaded", menuFunction);

window.addEventListener("scroll", show);

rowParties.forEach((el) => {
  el.addEventListener("wheel", partiesSlider);
});
