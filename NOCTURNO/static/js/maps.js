// const [lat = " 21.017532", lng] = navigator.geolocation;
// const showMap=(lat)=>{

// }

const showMap = (lat, lng) => {
  // MAPA
  var map = L.map("map").setView([lat, lng], 15);

  // DODANIE WARSTWY
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
};

// MAP INIT
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log(pos.coords);
    const { latitude: lat, longitude: lng } = pos.coords;
    showMap(lat, lng);
  },
  () => {
    const lat = 52.237049;
    const lng = 21.017532;
    console.log(123);
    showMap(lat, lng);
  }
);
