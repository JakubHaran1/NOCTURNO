"use strict";

import { menuFunction } from "./_menuScroll.js";
class Map {
  spinColor = "#9b30ff";
  iconMarkerUrl = "static/imgs/marker.svg";
  formSection = document.querySelector(".party-creator");

  constructor() {
    menuFunction();
    // Chowanie party_creator
    this.formSection.classList.add("hidden");

    // INICJACJA MAPY
    this.map = L.map("map");
    this.map.spin(true, { color: this.spinColor });

    // POBRANIE GEOLOKACJI
    this.getLatLng();

    // CLICK MAP EVENT
    this.map.on("click", this.onMapClick.bind(this));
  }

  // POBRANIE GEOLOKACJI
  getLatLng = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log([lat, lng]);
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

  // TWORZENIE ZNACZNIKÓW
  createPointer(latlng) {
    const myIcon = L.icon({
      iconUrl: this.iconMarkerUrl,
      iconSize: [38, 95],
    });

    L.marker(latlng, { icon: myIcon }).addTo(this.map);
  }

  // PODPINANIE ZNACZNIKÓW
  async onMapClick(e) {
    this.formSection.classList.remove("hidden");
    const latlng = Object.values(e.latlng);
    // Dodawanie ikony
    this.createPointer(latlng);

    const [lat, lng] = latlng;

    // Pozyskiwanie współżędnych eventu
    const address = await this.getAdress(lat, lng);

    //Wypełnienie addressForm
    this.fillForm(address, lat, lng);
  }

  // POZYSKIWANIE  WSPÓŁŻĘDNYCH EVENTU
  async getAdress(lat, lng) {
    try {
      // Reverse geocoding
      const adress = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18`
      );

      // Sprawdzanie czy ok
      if (!adress.ok)
        throw new Error(
          `We have problems with ours satelite. Error code:${adress.status}!`
        );

      // json -> obj
      const data = await adress.json();

      if (data["type"] == "university")
        throw new Error("This isn't good place to party");

      return data;
    } catch (error) {
      // Dodać return coś - i wyświetlenie jakiegoś popup z odp wiadomością
      console.log(error);
    }
  }

  // WYPEŁNIANIE FORMADDRESS
  fillForm(data, lat, lng) {
    const addressFields = document.querySelectorAll(".address input");
    const latField = document.querySelector(".lat input");
    const lngField = document.querySelector(".lng input");

    // Wyciąganie adresu
    const { address: clearData } = data;

    // Uzupełnianie pół
    addressFields.forEach((field) => {
      field.value = clearData[`${field.name}`];
      if (field.value == "undefined")
        field.value = `No ${field.name.split("_").join(" ")}`;
    });
    latField.value = String(lat).slice(0, 8);
    lngField.value = String(lng).slice(0, 8);
  }
}

const map = new Map();
