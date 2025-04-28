const menu = document.querySelector(".nav");

let timeOut;
const show = () => {
  menu.classList.add("scroll");
  clearTimeout(timeOut);
  console.log("chuj");
  timeOut = setTimeout(() => {
    menu.classList.remove("scroll");
  }, 300);
};
window.addEventListener("scroll", show);
