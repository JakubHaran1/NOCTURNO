"use strict";
import { menuFunction, show } from "./base.js";

// SearchingNav
const navSearch = document.querySelector(".search-nav");
let searchOption = navSearch.querySelector(".active");

const changeSearch = function (e) {
  const el = e.target.closest(".search-link");
  if (!el) return;
  searchOption.classList.remove("active");
  searchOption = el;
  searchOption.classList.add("active");
  document.cookie = `searchingType=${el.textContent}`;
  print(`searchingType=${el.textContent}`);
};

// Searching
const searchingBtn = document.querySelector(".searching-btn");
const searchingInput = document.querySelector(".search input");

const searchingBuddie = async function (e) {
  e.preventDefault();

  const value = searchingInput.value.trim().toLowerCase();
  if (value == "") return;
  const link = `/buddies/find-buddie/?nick=${value}`;
  const searchinResponse = await fetch(link);
  const searchingData = await searchinResponse.json();
  const searchRow = document.querySelector(".search-row");
  let searchRowHtml = "";

  searchingData.forEach((el) => {
    const html = `
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
    searchRowHtml += html;
  });

  searchRow.insertAdjacentHTML("afterbegin", searchRowHtml);
};

// Unique
navSearch.addEventListener("click", changeSearch);
searchingBtn.addEventListener("click", searchingBuddie);

// Basic function
document.addEventListener("DOMContentLoaded", menuFunction);
window.addEventListener("scroll", show);
