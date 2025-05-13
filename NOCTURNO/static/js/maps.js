"use strict";

import { menuFunction } from "./_menuScroll.js";
class Map {
  spinColor = "#9b30ff";
  iconMarkerUrl = "static/imgs/marker.svg";

  constructor() {
    menuFunction();
    this.map = L.map("map");
    this.map.spin(true, { color: this.spinColor });

    // POBRANIE GEOLOKACJI
    this.getLatLng();

    // Tworzenie znacznikow
    this.map.on("click", this.onMapClick.bind(this));
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

  createMap(lat, lng) {
    // USTAWIENIE KOORDYNATOW
    this.map.setView([lat, lng], 15);

    // DODANIE WARSTWY
    const tile = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    tile.on("load", () => this.map.spin(false));
    tile.addTo(this.map);
  }
  // Tworzenie znaczników
  // createPointer()
  // Podpinanie znacznikow
  onMapClick(e) {
    const latlng = Object.values(e.latlng);
    // Dodawanie ikony
    const myIcon = L.icon({
      iconUrl: this.iconMarkerUrl,
      iconSize: [38, 95],
    });

    L.marker(latlng, { icon: myIcon }).addTo(this.map);
    const [lat, lng] = latlng;
    this.getAdress(lat, lng);
  }

  async getAdress(lat, lng) {
    try {
      // Recerse geocoding
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
      if (data["type"] == "university") {
        throw new Error("This isn't good place to party");
      }
      const cityField = document.getElementById("id_city");
      const streetField = document.getElementById("id_street");
      const houseField = document.getElementById("id_house_number");
      console.log(data["type"]);
      // Wyciąganie adresu
      const { address: clearData } = data;

      console.log(clearData);
      cityField.value = clearData["city"];
      streetField.value = clearData["road"];
      houseField.value = clearData["house_number"];
    } catch (error) {
      console.log(error);
    }
  }
}

const map = new Map();
