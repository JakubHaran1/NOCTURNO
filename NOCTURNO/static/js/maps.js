"use strict";
import { menuFunction, safeCreate } from "./base.js";
class Map {
  spinColor = "#9b30ff";
  iconMarkerUrl = "static/imgs/marker.svg";
  NewIconMarkerUrl = "static/imgs/new_marker.svg";
  overlay = document.querySelector(".overlay");
  formSection = document.querySelector(".party-creator");
  btnClosePopUp = document.querySelector(".pop-up button");
  popUp = document.querySelector(".pop-up");
  parties = document.querySelector(".parties");
  last_party = "";
  parties_bgc = document.querySelector(".parties_bgc");
  currentParties = [];
  activeMarker = false;

  constructor() {
    menuFunction();

    // Wyświetlanie formularza gdy nie uda się zapis
    if (!this.formSection.classList.contains("attempt"))
      this.formSection.classList.add("hidden");

    // Czyszczenie pól w formularzu

    // INICJACJA MAPY
    this.map = L.map("map", {});
    this.map.spin(true, { color: this.spinColor });

    // POBRANIE GEOLOKACJI
    this.getLatLng();

    // DRAG/ZOOM EVENT na mapie
    this.map.on("moveend", (e) => {
      // Pobieranie map range
      const range = this.map.getBounds();
      this.sendMapRange(range);
    });

    // CLICK MAP EVENT
    this.map.on("click", this.onMapClick.bind(this));

    // Click event na partybox
    this.parties_bgc.addEventListener("click", async (e) => {
      if (!e.target.closest(".party")) return;
      if (e.target.closest(".signup-btn")) {
        const response = await fetch(
          `map/sign-up/${
            e.target.closest(".party").getAttribute("id").split("-")[1]
          }`
        );
        if (!response.ok) throw Error("We cant add your relations");
        
        console.log(response);
      }

      this.formSection.classList.add("hidden");

      // Zoom na mapie po kliknięciu w party box
      const id = e.target.closest(".party").id;
      const marker = this.currentParties.find(
        (el) => el.options.className.split("-")[2] == id.split("-")[1]
      );
      this.map.setView(marker._latlng);
      marker.openPopup();
      this.last_party = e.target.closest(".party");
    });
  }

  // POBRANIE GEOLOKACJI
  getLatLng = () => {
    try {
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
    } catch {
      this.openPopUp(
        "😭 Something goes wrong 😭",
        "We haven't acces to your geolocation ⌛"
      );
    }
  };

  openPopUp(header, content) {
    const popHeader = document.querySelector(".pop-header");
    const popContent = document.querySelector(".pop-content");
    popHeader.textContent = header;
    popContent.textContent = content;
    this.popUp.classList.remove("hidden");
    this.overlay.classList.remove("hidden");
  }

  // Pobiera (po zoomie, przesunięciu) skrajne pozycje widocznej mapy
  async sendMapRange(data) {
    const [_southWest, _northEast] = Object.values(data);

    try {
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
          { id: `party-${el["pk"]}`, class: "party" },
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
        this.createDesc(el, party_box);

        safeCreate("button", { class: "signup-btn" }, party_box, "Sign up");

        const latlng = [el["fields"]["lat"], el["fields"]["lng"]];

        // Ustawianie active partybox gdy resize
        if (this.last_party.id == `party-${el["pk"]}`) {
          party_box.classList.add("active");
          this.last_party = party_box;
          this.scrollMapPartybox(this.last_party);
        }

        this.createPointer(latlng, el);
      });
    } catch {
      this.openPopUp(
        "😭 We have problems with our database 😭",
        "Try again later ⌛"
      );
    }
  }

  createPointer(latlng, el = false) {
    const myIcon = L.icon({
      iconUrl: el != false ? this.iconMarkerUrl : this.NewIconMarkerUrl,
      iconSize: [38, 95],
    });

    // Tworzy znaczniki
    let marker;
    if (el != false) {
      // dla generownych
      marker = L.marker(latlng, {
        icon: myIcon,
        className: `map-popup-${el["pk"]}`,
        bubblingMouseEvents: true,
      });
    } else {
      // dla nowego - po kliknięciu użytkownika na mape
      marker = L.marker(latlng, {
        icon: myIcon,
        className: `map-popup-${el["pk"]}`,
        bubblingMouseEvents: true,
      });
      if (this.activeMarker) this.activeMarker.remove();
      this.activeMarker = marker;
    }

    marker.addTo(this.map);
    this.currentParties.push(marker);

    // TWWORZENIE POP UP + SCROLL DO PARTYBOX
    marker.on("click", (e) => {
      this.formSection.classList.add("hidden");
      this.map.setView([
        parseFloat(el["fields"]["lat"]),
        parseFloat(el["fields"]["lng"]),
      ]);
      // znajdywanie party box na podstawie id znacznika
      const target = this.parties_bgc.querySelector(
        `#${e.target._icon.getAttribute("id")}`
      );

      if (this.last_party.id != target.id) {
        target.classList.add("active");
        this.last_party = target;
        // Podpięcie w wrapper party scrolla do partyBox
        this.scrollMapPartybox(target);
      }
    });

    // Tworzenie popupów
    if (el) {
      marker._icon.setAttribute("id", `party-${el["pk"]}`);
      const popUpContent = safeCreate("div", { class: "map-popup-content" });
      safeCreate("h4", {}, popUpContent, el["fields"]["party_title"]);
      // dodać description
      safeCreate(
        "p",
        { class: "description" },
        popUpContent,
        el["fields"]["description"]
      );
      this.createDesc(el, popUpContent);

      safeCreate("button", { class: "signup-btn" }, popUpContent, "Sign up");
      const mapPopup = L.popup(
        [parseFloat(el["fields"]["lat"]), parseFloat(el["fields"]["lng"])],
        {
          content: popUpContent.innerHTML,
          keepInView: true,
          minWidth: 310,
          maxWidth: 320,
          className: `map-popup `,
          autoPan: false,
        }
      );

      marker.bindPopup(mapPopup).on("popupclose", () => {
        this.last_party.classList.remove("active");
        this.last_party = "";
      });
    }
  }

  createDesc(el, wrapper) {
    const desc = safeCreate("div", { class: "desc" }, wrapper);

    const el1 = safeCreate("div", { class: "el" }, desc);
    safeCreate("i", { class: "fas fa-wine-glass-alt" }, el1);
    safeCreate("p", {}, el1, el["fields"]["alco"]);

    const el2 = safeCreate("div", { class: "el" }, desc);
    safeCreate("i", { class: "far fa-id-card" }, el2);
    safeCreate("p", {}, el2, el["fields"]["age"]);

    const el3 = safeCreate("div", { class: "el" }, desc);
    safeCreate("i", { class: "fas fa-users" }, el3);
    safeCreate("p", {}, el3, el["fields"]["people_number"]);
  }
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

  // PO KLIKNIĘCIU PRZEKAZUJE DANE DO CREATE POINTER -> NASTEPUJE PRZYPIECIE ZNACZNIKA
  async onMapClick(e) {
    // Zamknięcie party creator
    const closeBtn = this.formSection.querySelector(".close-creator");
    closeBtn.addEventListener("click", () =>
      this.formSection.classList.add("hidden")
    );
    // Otwarcie
    this.formSection.classList.remove("hidden");
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

  // Scroll do konkretnego partybox
  scrollMapPartybox(scrollToEl) {
    if (window.matchMedia("(min-width: 1250px)").matches) {
      const parties = document.querySelector(".parties");
      parties.scrollTop = scrollToEl.offsetTop;
    } else {
      this.parties_bgc.scrollLeft = scrollToEl.offsetLeft - 16;
    }
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
      this.popUp;
      this.openPopUp("😭 Reverse geocoding failed! 😭", "Try again later ⌛");
    }
  }
}

const map = new Map();
