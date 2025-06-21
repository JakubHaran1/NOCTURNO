"use strict";
import { menuFunction, show } from "./base.js";

// SearchingNav
const navSearch = document.querySelector(".search-nav");
let searchOption = navSearch.querySelector(".active");

// Search buddies
const searchRow = document.querySelector(".search-row");

// Sending data link
const getData = async function (link) {
  let searchRowHtml = "";
  let data;
  try {
    const fetchResponse = await fetch(link);
    if (!fetchResponse.ok) throw new Error("Wrong link ✋✋");
    data = await fetchResponse.json();
    searchRow.textContent = "";
    data.forEach((el) => {
      searchRowHtml += `
    <div class="buddy-box">
        <img src="{% static "${el.avatar}" %}" alt="${el.username}">
        <div class="buddy-info">
            <h3 class='nick'>${el.username}</h3>
            
            <form action="POST" >
                <button>Add</button>
            </form>
        </div>
    </div>
    `;
    });
    searchRow.insertAdjacentHTML("afterbegin", searchRowHtml);
  } catch (error) {
    throw new Error(error);
  }
};

// Zmiana typów wyszukiwań (dla find init value)
const changeSearch = async function (e) {
  const el = e.target.closest(".search-link");

  if (!el) return;
  searchOption.classList.remove("active");
  searchOption = el;
  searchOption.classList.add("active");
  console.log(searchOption);
  document.cookie = `searchingType=${el.textContent}`;
  const fetchLink = "buddies/initial-find";
  getData(fetchLink);
  // if (el.textContent == "Find") {
  //   const fetchLink = "buddies/initial-find";
  //   getData(fetchLink);
  // }else{

  // }
};

// Searching <- właściwe wyszukiwanie
const searchingBtn = document.querySelector(".searching-btn");
const searchingInput = document.querySelector(".search input");

const searchingBuddie = async function (e) {
  e.preventDefault();

  const value = searchingInput.value.trim().toLowerCase();
  if (value == "") return;
  const fetchLink = `/buddies/find-buddie/?nick=${value}`;
  getData(fetchLink);
};

// Unique
navSearch.addEventListener("click", changeSearch);
searchingBtn.addEventListener("click", searchingBuddie);

// Basic function
document.addEventListener("DOMContentLoaded", menuFunction);
window.addEventListener("scroll", show);
