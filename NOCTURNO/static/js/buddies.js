"use strict";
import { menuFunction, show } from "./base.js";

class Buddies {
  searchRow = document.querySelector(".search-row");
  // SearchingNav
  navSearch = document.querySelector(".search-nav");
  searchOption = this.navSearch.querySelector(".active");

  // Searching <- właściwe wyszukiwanie
  searchingBtn = document.querySelector(".searching-btn");
  searchingInput = document.querySelector(".search input");

  constructor() {
    // Unique
    this.navSearch.addEventListener("click", this.changeSearch.bind(this));
    this.searchingBtn.addEventListener(
      "click",
      this.searchingBuddie.bind(this)
    );
  }

  // Funkcja pomocnicza do pobierania danych i tworzenia userbox
  async getData(link) {
    let searchRowHtml = "";
    let data;
    try {
      const fetchResponse = await fetch(link);
      if (!fetchResponse.ok) throw new Error("Wrong link ✋✋");
      data = await fetchResponse.json();
      this.searchRow.textContent = "";
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
      this.searchRow.insertAdjacentHTML("afterbegin", searchRowHtml);
    } catch (error) {
      throw new Error(error);
    }
  }

  // Zmiana typów wyszukiwań (dla find init value)
  async changeSearch(e) {
    const el = e.target.closest(".search-link");
    console.log(el);

    if (!el) return;
    this.searchOption.classList.remove("active");
    this.searchOption = el;
    this.searchOption.classList.add("active");
    document.cookie = `searchingType=${el.textContent}`;
    const fetchLink = "buddies/initial-find";
    this.getData(fetchLink);
  }

  async searchingBuddie(e) {
    e.preventDefault();

    const value = this.searchingInput.value.trim().toLowerCase();
    if (value == "") return;
    const fetchLink = `/buddies/find-buddie/?nick=${value}`;
    getData(fetchLink);
  }
}

// Basic function
document.addEventListener("DOMContentLoaded", menuFunction);
window.addEventListener("scroll", show);

// Class
const buddies = new Buddies();
