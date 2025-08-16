"use strict";
import { menuFunction } from "./base.js";
class Map {
  spinColor = "#9b30ff";
  iconMarkerUrl = "static/imgs/marker.svg";
  overlay = document.querySelector(".overlay");
  formSection = document.querySelector(".party-creator");
  btnClosePopUp = document.querySelector(".pop-up button");
  popUp = document.querySelector(".pop-up");

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
  }

  async sendMapRange(data) {
    const parties_bgc = document.querySelector(".parties_bgc");
    const [_southWest, _northEast] = Object.values(data);
    console.log(Object.values(_southWest));

    const response = await fetch(
      `map/generate-parties/${[_southWest["lat"], _northEast["lat"]]},${[
        _southWest["lng"],
        _northEast["lng"],
      ]}`
    );
    const parties = await response.json();
    const parties_data = JSON.parse(parties);

    parties_bgc.textContent = "";
    parties_data.forEach((el) => {
      console.log(el);

      const party_box = document.createElement("div");
      party_box.classList.add("party");

      const img_hero = document.createElement("div");
      img_hero.classList.add("img-hero");
      img_hero.style.backgroundImage = `url(/media/${el["fields"]["file_thumb"]})`;

      const title = document.createElement("h4");
      title.textContent = el["fields"]["party_title"];

      const desc = document.createElement("div");
      desc.classList.add("desc");

      const el1 = document.createElement("div");
      el1.classList.add("el");
      let cls = ["fas", "fa-wine-glass-alt"];
      const icon1 = document.createElement("div");
      icon1.classList.add(...cls);
      const paragraph1 = document.createElement("p");
      paragraph1.textContent = el["fields"]["alco"];
      el1.append(icon1, paragraph1);

      const el2 = document.createElement("div");
      el2.classList.add("el");
      cls = ["far", "fa-id-card"];
      const icon2 = document.createElement("div");
      icon2.classList.add(...cls);
      const paragraph2 = document.createElement("p");
      paragraph2.textContent = el["fields"]["age"];
      el2.append(icon2, paragraph2);

      const el3 = document.createElement("div");
      el3.classList.add("el");
      cls = ["fas", "fa-users"];
      const icon3 = document.createElement("div");
      icon3.classList.add(...cls);
      const paragraph3 = document.createElement("p");
      paragraph3.textContent = el["fields"]["people_number"];
      el3.append(icon3, paragraph3);

      desc.append(el1, el2, el3);
      party_box.append(img_hero, title, desc);
      parties_bgc.append(party_box);

      const latlng = [el["fields"]["lat"], el["fields"]["lng"]];
      this.createPointer(latlng);
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

  // TWORZENIE ZNACZNIKÓW I PODPINANIE ZNACNZIKÓW
  createPointer(latlng) {
    const myIcon = L.icon({
      iconUrl: this.iconMarkerUrl,
      iconSize: [38, 95],
    });

    L.marker(latlng, { icon: myIcon }).addTo(this.map);
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
