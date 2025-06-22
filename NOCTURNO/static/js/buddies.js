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
    // Obsługa nawigacji wyszukiwania
    this.navSearch.addEventListener("click", this.changeSearch.bind(this));

    // Uruchamia wyszukiwanie
    this.searchingBtn.addEventListener(
      "click",
      this.searchingBuddie.bind(this)
    );

    // Dodawnie buddietgo do listy zaiobserwowanych przez zalogowanego uzytkownika
    this.searchRow.addEventListener("click", this.addBuddie.bind(this));
  }

  // Funkcja pomocnicza do pobierania danych i tworzenia userbox
  async getData(link) {
    try {
      const fetchResponse = await fetch(link);
      if (!fetchResponse.ok) throw new Error("Wrong link ✋✋");
      const data = await fetchResponse.json();
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  createBuddiesBox(data) {
    let searchRowHtml = "";
    this.searchRow.textContent = "";
    data.forEach((el) => {
      searchRowHtml += `
    <div class="buddy-box" data-name="${el.username}">
        <img src="{% static "${el.avatar}" %}" alt="${el.username}">
        <div class="buddy-info">
            <h3 class='nick'>${el.username}</h3>
            <form class="add-buddie" action="buddies/add-buddie/" method='POST'>
                
                <button>Add</button>
            </form>
        </div>
    </div>
    `;
    });
    this.searchRow.insertAdjacentHTML("afterbegin", searchRowHtml);
  }

  // Zmiana typów wyszukiwań (dla find/yours init value)
  async changeSearch(e) {
    const el = e.target.closest(".search-link");
    console.log(el);

    if (!el) return;
    this.searchOption.classList.remove("active");
    this.searchOption = el;
    this.searchOption.classList.add("active");
    document.cookie = `searchingType=${el.textContent}`;
    const fetchLink = "buddies/initial-find";
    const fetchData = await this.getData(fetchLink);
    this.createBuddiesBox(fetchData);
  }

  // Właściwe wyszukiwanie buddies
  async searchingBuddie(e) {
    e.preventDefault();
    const value = this.searchingInput.value.trim().toLowerCase();
    if (value == "") return;
    const fetchLink = `/buddies/find-buddie/?nick=${value}`;
    const fetchData = await getData(fetchLink);
    this.createBuddiesBox(fetchData);
  }

  async addBuddie(e) {
    e.preventDefault();
    const el = e.target.closest(".buddy-box");
    const friendName = el.dataset.name;
    console.log(friendName);
    const fetchLink = `buddies/add-buddie/`;
    try {
      const sendData = await fetch(fetchLink, {
        method: "POST",
        body: JSON.stringify({ friend: friendName }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
      });
      if (!sendData.ok)
        throw new Error("We can't add this buddie to your list 😭");
      const dataReturn = await sendData.json();
      console.log(dataReturn);
    } catch (err) {
      console.log(err);
    }
  }
}

// Basic function
document.addEventListener("DOMContentLoaded", menuFunction);
window.addEventListener("scroll", show);

// Class
const buddies = new Buddies();
