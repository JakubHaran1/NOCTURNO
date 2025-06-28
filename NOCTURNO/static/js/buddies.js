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

  createBuddiesBox(data, friendsId = null) {
    this.searchRow.textContent = "";

    const generate = (el, btnAction) => {
      const buddyBox = document.createElement("div");
      buddyBox.classList.add("buddy-box");

      const buddyInfo = document.createElement("div");
      buddyInfo.classList.add("buddy-info");

      const avatar = document.createElement("img");
      avatar.setAttribute("src", `{% static ${el.avatar} %}`);
      avatar.setAttribute("alt", `${el.username}`);

      const nick = document.createElement("h3");
      nick.classList.add("nick");
      nick.textContent = `${el.username}`;

      const button = document.createElement("button");

      button.setAttribute("data-id", `${el.id}`);
      button.classList.add(`${btnAction}-buddie`);
      button.textContent = `${btnAction}`;

      buddyInfo.appendChild(nick);
      buddyInfo.appendChild(button);
      buddyBox.appendChild(avatar);
      buddyBox.appendChild(buddyInfo);
      this.searchRow.appendChild(buddyBox);
    };

    if (friendsId != null) {
      data.forEach((el) => {
        let keyWord = "";
        if (friendsId.includes(el.id)) keyWord = "delete";
        else keyWord = "add";
        generate(el, keyWord);
      });
    } else {
      data.forEach((el) => {
        generate(el);
      });
    }

    // Dwie wersje pętli tworzących aby przy generowaniu "Yours" nie sprawedzało czy znajduje sie na liscie znajomych tylko od razu generowało z przyciskiem delete -> lepsze wydajność
    // Dla find sprawdza żeby był wyświetlany przycisk delete lub add
  }

  // Zmiana typów wyszukiwań (inicjacja generowania buddiesbox)
  async changeSearch(e) {
    const el = e.target.closest(".search-link");

    if (!el) return;
    this.searchOption.classList.remove("active");
    this.searchOption = el;
    this.searchOption.classList.add("active");
    document.cookie = `searchingType=${el.dataset.option}`;
    const fetchLink = "buddies/initial-find";
    const [friendsList, friendsId] = await this.getData(fetchLink);

    console.log(friendsList, friendsId);
    console.log(friendsId);
    this.createBuddiesBox(friendsList, friendsId);
  }

  // Właściwe wyszukiwanie buddies
  async searchingBuddie(e) {
    e.preventDefault();
    const value = this.searchingInput.value.trim().toLowerCase();
    if (value == "") return;
    const fetchLink = `/buddies/find-buddie/?nick=${value}`;
    const [fetchData, friendsId] = await this.getData(fetchLink);
    console.log(fetchData, friendsId);
    this.createBuddiesBox(fetchData, friendsId);
  }

  // Dodawanie,usuwanie buddies
  async addBuddie(e) {
    e.preventDefault();
    const el = e.target.closest(".actionBtn");
    if (!el) return;
    const action = el.dataset.action;
    const friendID = el.dataset.id;
    const fetchLink = `buddies/action-buddie/`;
    console.log([friendID, action]);

    try {
      const sendData = await fetch(fetchLink, {
        method: "POST",
        body: JSON.stringify([friendID, action]),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": document
            .querySelector('meta[name="csrf-token"]')
            .getAttribute("content"),
        },
      });
      if (!sendData.ok)
        throw new Error("We can't add this buddie to your list 😭");
      const backData = await sendData.json();

      if (backData.redirect) {
        window.location.href = backData.redirect;
      } else {
        throw new Error(backData.error);
      }
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
