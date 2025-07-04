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
  errorHandler(first, second = "Try again") {
    const errorBox = `
    <div class="buddies-txt">
        <p>${first}</p>
        <p>${second}</p>
    </div>`;
    this.searchRow.textContent = "";
    this.searchRow.insertAdjacentHTML("afterbegin", errorBox);
  }
  // Funkcja pomocnicza do pobierania danych i tworzenia userbox
  async getData(link) {
    const fetchResponse = await fetch(link);
    if (!fetchResponse.ok) throw new Error("Something goes wrong with link");
    const data = await fetchResponse.json();
    return data;
  }

  createBuddiesBox(data, friendsId = null) {
    this.searchRow.textContent = "";

    const generate = (el, btnAction = "delete") => {
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
      button.setAttribute("data-action", `${btnAction}`);
      button.classList.add(`${btnAction}-buddie`, "actionBtn");
      button.textContent = `${btnAction}`;

      buddyInfo.appendChild(nick);
      buddyInfo.appendChild(button);
      buddyBox.appendChild(avatar);
      buddyBox.appendChild(buddyInfo);
      this.searchRow.appendChild(buddyBox);
    };

    // Dwie wersje pętli tworzących aby przy generowaniu "Yours" nie sprawedzało czy znajduje sie na liscie znajomych tylko od razu generowało z przyciskiem delete -> lepsze wydajność
    // Dla find sprawdza żeby był wyświetlany przycisk delete lub add

    if (friendsId != null) {
      data.forEach((el) => {
        let keyWord = "add";
        if (friendsId.includes(el.id)) keyWord = "delete";
        generate(el, keyWord);
      });
    } else {
      data.forEach((el) => {
        generate(el);
      });
    }
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
    try {
      const [friendsList, friendsId] = await this.getData(fetchLink);

      this.createBuddiesBox(friendsList, friendsId);
    } catch {
      this.errorHandler("Something goes wrong with initiation 😥");
    }
  }

  // Właściwe wyszukiwanie buddies
  async searchingBuddie(e) {
    e.preventDefault();
    const value = this.searchingInput.value.trim().toLowerCase();
    let fetchLink = `/buddies/find-buddie/?nick=${value}`;
    if (value == "") fetchLink = "/buddies/find-buddie";
    try {
      const [fetchData, friendsId] = await this.getData(fetchLink);
      console.log(fetchData, friendsId);
      this.createBuddiesBox(fetchData, friendsId);
    } catch {
      this.errorHandler("Something goes wrong with search engine 😥");
    }
  }

  // Dodawanie,usuwanie buddies
  async addBuddie(e) {
    e.preventDefault();
    const el = e.target.closest(".actionBtn");
    console.log(el);
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
      this.errorHandler(err);
    }
  }
}

// Basic function
document.addEventListener("DOMContentLoaded", menuFunction);
window.addEventListener("scroll", show);

// Class
const buddies = new Buddies();
