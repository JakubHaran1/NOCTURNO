const menuFunction = () => {
  const menu = document.querySelector(".nav");
  const menuHeight = menu.getBoundingClientRect().height;
  const layout = document.querySelector(".layout");
  layout.style.marginBottom = `${menuHeight + menuHeight / 2}px`;
};

export { menuFunction };
