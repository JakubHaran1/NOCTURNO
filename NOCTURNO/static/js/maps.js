"use strict";
import { menuFunction, safeCreate } from "./base.js";
class Map {
  spinColor = "#9b30ff";
  iconMarkerUrl = "static/imgs/marker.svg";
  overlay = document.querySelector(".overlay");
  formSection = document.querySelector(".party-creator");
  btnClosePopUp = document.querySelector(".pop-up button");
  popUp = document.querySelector(".pop-up");
  parties_bgc = document.querySelector(".parties_bgc");
  constructor() {
    menuFunction();
    // Chowanie party_creator
    if (!this.formSection.classList.contains("attempt"))
      this.formSection.classList.add("hidden");

    this.formSection
      .querySelectorAll(".position input")
      .forEach((el) => (el.value = ""));

    // INICJACJA MAPY
    this.map = L.map("map");
    this.map.spin(true, { color: this.spinColor });

    // POBRANIE GEOLOKACJI
    this.getLatLng();

    // DRAG/ZOOM EVENT
    this.map.on("moveend", (e) => {
      // Pobieranie map range
      const range = this.map.getBounds();
      this.sendMapRange(range);
    });

    // CLICK MAP EVENT
    this.map.on("click", this.onMapClick.bind(this));

    this.parties_bgc.addEventListener("click", async (e) => {
      if (!e.target.closest(".party")) return;
      const id = e.target.closest(".party").getAttribute("id");
      const response = await fetch(`map/getting-partie/${id}`);
      const data = await response.json();
      const obj = JSON.parse(data)[0];
      console.log(obj);
    });
  }

  async sendMapRange(data) {
    const [_southWest, _northEast] = Object.values(data);

    const response = await fetch(
      `map/generate-parties/${[_southWest["lat"], _northEast["lat"]]},${[
        _southWest["lng"],
        _northEast["lng"],
      ]}`
    );
    const parties = await response.json();
    const parties_data = JSON.parse(parties);

    this.parties_bgc.textContent = "";
    parties_data.forEach((el) => {
      // Create party box and return latlng
      const party_box = safeCreate(
        "div",
        { id: el["pk"], class: "party" },
        this.parties_bgc
      );

      safeCreate(
        "div",
        {
          class: "img-hero",
          style: `background-image:url(/media/${el["fields"]["file_thumb"]})`,
        },
        party_box
      );

      safeCreate("h4", {}, party_box, el["fields"]["party_title"]);
      const desc = safeCreate("div", { class: "desc" }, party_box);

      const el1 = safeCreate("div", { class: "el" }, desc);
      safeCreate("i", { class: "fas fa-wine-glass-alt" }, el1);
      safeCreate("p", {}, el1, el["fields"]["alco"]);

      const el2 = safeCreate("div", { class: "el" }, desc);
      safeCreate("i", { class: "far fa-id-card" }, el2);
      safeCreate("p", {}, el2, el["fields"]["age"]);

      const el3 = safeCreate("div", { class: "el" }, desc);
      safeCreate("i", { class: "fas fa-users" }, el3);
      safeCreate("p", {}, el3, el["fields"]["people_number"]);

      const latlng = [el["fields"]["lat"], el["fields"]["lng"]];

      this.createPointer(latlng, el);
    });
  }

  // POBRANIE GEOLOKACJI
  getLatLng = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        this.createMap(lat, lng);
      },
      () => {
        const lat = 52.237049;
        const lng = 21.017532;
        this.createMap(lat, lng);
      }
    );
  };
  // TWORZENIE MAPY
  createMap(lat, lng) {
    // Ustawianie lokalizacji na mapie
    this.map.setView([lat, lng], 15);

    // Dodanie warstwy
    const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    // Spin on load
    tile.on("load", () => this.map.spin(false));
    tile.addTo(this.map);
  }

  // TWORZENIE ZNACZNIKÓW I MAP POP UP
  createPointer(latlng, el = false) {
    const myIcon = L.icon({
      iconUrl: this.iconMarkerUrl,
      iconSize: [38, 95],
    });
    // Tworzy znaczniki
    const marker = L.marker(latlng, {
      icon: myIcon,
      className: `map-popup-${el["pk"]}`,
    }).addTo(this.map);

    // Tworzenie popupów
    if (el) {
      const popUpContent = safeCreate("div", { class: "map-popup-content" });
      safeCreate("h4", {}, popUpContent, el["fields"]["party_title"]);
      // dodać description
      const desc = safeCreate("div", { class: "desc" }, popUpContent);

      const el1 = safeCreate("div", { class: "el" }, desc);
      safeCreate("i", { class: "fas fa-wine-glass-alt" }, el1);
      safeCreate("p", {}, el1, el["fields"]["alco"]);

      const el2 = safeCreate("div", { class: "el" }, desc);
      safeCreate("i", { class: "far fa-id-card" }, el2);
      safeCreate("p", {}, el2, el["fields"]["age"]);

      const el3 = safeCreate("div", { class: "el" }, desc);
      safeCreate("i", { class: "fas fa-users" }, el3);
      safeCreate("p", {}, el3, el["fields"]["people_number"]);

      marker.bindPopup(popUpContent.innerHTML, {
        minWidth: 300,
        maxWidth: 400,
        keepInView: true,
        className: "map-popup",
      });
    }
  }

  // PO KLIKNIĘCIU PRZEKAZUJE DANE DO CREATE POINTER -> NASTEPUJE PRZYPIECIE ZNACZNIKA
  async onMapClick(e) {
    this.formSection.classList.remove("hidden");
    console.log(e);
    const latlng = Object.values(e.latlng);
    // Dodawanie ikony
    this.createPointer(latlng);

    const [lat, lng] = latlng;

    // Pozyskiwanie współżędnych eventu
    let address;
    try {
      address = await this.getAdress(lat, lng);
    } catch (error) {
      console.log(`Error:${error.message}, code:${error.status}`);
      this.openPopUp(
        "😭 We have problems with reverse geolocalization 😭",
        "Try again later ⌛"
      );
    }
    const addressFields = document.querySelectorAll(".address input");
    //Wypełnienie addressForm
    if (address != undefined) this.fillForm(address, lat, lng, addressFields);
  }

  // POZYSKIWANIE  WSPÓŁŻĘDNYCH EVENTU
  async getAdress(lat, lng) {
    let address;
    try {
      // Reverse geocoding
      address = await fetch(`/geocode-reverse?lat=${lat}&lng=${lng}`);
      // Sprawdzanie czy ok
      if (!address.ok) throw new Error(`Data isn't correct!`);

      // json -> obj
      const data = await address.json();

      if (data["type"] == "university")
        throw new Error("This isn't good place to party");

      return data;
    } catch (error) {
      // Dodać return coś - i wyświetlenie jakiegoś popup z odp wiadomością
      throw new Error(`Reverse geocoding failed!`);
    }
  }

  // WYPEŁNIANIE FORMADDRESS
  fillForm(data, lat, lng, form_fields) {
    const latField = document.querySelector(".lat input");
    const lngField = document.querySelector(".lng input");
    const ageField = document.querySelector(".age input");
    const alcoField = document.querySelector(".alco");

    // Wyciąganie adresu
    const { address: clearData } = data;

    // Uzupełnianie pół
    form_fields.forEach((field) => {
      field.value = clearData[`${field.name}`];
      if (field.value == "undefined")
        field.value = `No ${field.name.split("_").join(" ")}`;
    });
    latField.value = String(lat).slice(0, 8);
    lngField.value = String(lng).slice(0, 8);

    let age = "";
    ageField.addEventListener("input", (e) => {
      if (Number(e.data)) {
        age += e.data;
        console.log(e.data);
      } else {
        const num = ageField.value;
        age = num;
      }

      if (Number(age) >= 18) {
        alcoField.style.display = "block";
      }
    });
  }

  openPopUp(header, content) {
    const popHeader = document.querySelector(".pop-header");
    const popContent = document.querySelector(".pop-content");
    popHeader.textContent = header;
    popContent.textContent = content;
    this.popUp.classList.remove("hidden");
    this.overlay.classList.remove("hidden");
  }
}

const map = new Map();
