// Function to fetch prayer times data from Aladhan API
function fetchPrayerTimes(city, countryCode) {
  const apiKey = "YOUR_ALADHAN_API_KEY";
  const apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${countryCode}&method=8&school=1&apikey=${apiKey}`;

  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const keysToRemove = ["Midnight", "Firstthird"];
      const prayerTimes = data.data.timings;
      const filteredPrayerTimes = Object.keys(prayerTimes).reduce((acc, key) => {
        if (!keysToRemove.includes(key)) {
          acc[key] = prayerTimes[key];
        }
        return acc;
      }, {});

      const prayerTimesString = JSON.stringify(filteredPrayerTimes);
      localStorage.setItem("prayerTimes", prayerTimesString);

      displayPrayerTimes(filteredPrayerTimes);
      console.log("all data", data.data);
    })
    .catch((error) => {
      console.error("Error fetching prayer times:", error);
      alert("Error fetching prayer times: " + error.message);
    });
}

function getStoredPrayerTimes() {
  const storedPrayerTimesString = localStorage.getItem("prayerTimes");
  if (storedPrayerTimesString) {
    return JSON.parse(storedPrayerTimesString);
  }
  return null;
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function findClosestFuturePrayerTime(prayerTimes) {
  const currentTime = getCurrentTime();
  const times = Object.entries(prayerTimes);
  const futureTimes = times.filter(([_, time]) => time > currentTime);
  const currentPrayerTime = times.filter(([_, time]) => time < currentTime);

  if (currentPrayerTime.length > 0) {
    currentPrayerTime.sort((a, b) => a[1].localeCompare(b[1]));
    return currentPrayerTime[0];
  }
  if (futureTimes.length > 0) {
    futureTimes.sort((a, b) => a[1].localeCompare(b[1]));
    return futureTimes[0];
  }
  return null;
}

function findCurrentPrayerTime(prayerTimes) {
  const currentTime = getCurrentTime();
  const times = Object.entries(prayerTimes);
  const currentPrayerTime = times.filter(([_, time]) => time < currentTime);

  if (currentPrayerTime.length > 0) {
    currentPrayerTime.sort((a, b) => a[1].localeCompare(b[1]));
    return currentPrayerTime[0];
  }
  return null;
}

const prayerTimes = getStoredPrayerTimes();
if (prayerTimes) {
  const currentPrayerTimes = findCurrentPrayerTime(prayerTimes);
  if (currentPrayerTimes) {
    displayCurrentPrayerTime(currentPrayerTimes[0], currentPrayerTimes[1]);
  }
  const closestFuturePrayerTime = findClosestFuturePrayerTime(prayerTimes);
  if (closestFuturePrayerTime) {
    displayClosetsPrayerTime(closestFuturePrayerTime[0], closestFuturePrayerTime[1]);
  }
}

function displayCurrentPrayerTime(title, time) {
  const currentTimesWrap = document.getElementById("currentPrayer");
  currentTimesWrap.innerHTML = title;
}

function displayClosetsPrayerTime(title, time) {
  const closetTimesWrap = document.getElementById("closestPrayer");
  closetTimesWrap.innerHTML = `${title} at ${time}`;
}

function displayPrayerTimes(prayerTimings) {
  const prayerTimesDiv = document.getElementById("prayer-times");
  prayerTimesDiv.innerHTML = "";
  const prayerTimesList = document.createElement("ul");
  for (const [key, value] of Object.entries(prayerTimings)) {
    const listItem = document.createElement("li");
    listItem.textContent = `${key}: ${value}`;
    prayerTimesList.appendChild(listItem);
  }
  prayerTimesDiv.appendChild(prayerTimesList);
}

fetchPrayerTimes("Dhaka", "Bangladesh");

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        var map = new google.maps.Map(document.getElementById("map"), {
          zoom: 15,
          center: pos,
        });
        var marker = new google.maps.Marker({ position: pos, map: map });
      },
      function (error) {
        console.error("Error getting geolocation:", error);
        alert("Error getting geolocation: " + error.message);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
    alert("Geolocation is not supported by this browser.");
  }
}

let time = document.getElementById("current-time");
setInterval(() => {
  let d = new Date();
  time.innerHTML = d.toLocaleTimeString();
}, 1000);

function checkProximityToReminderLocations(userLocation) {
  var toiletLocation = { latitude: 23.873887, longitude: 90.2573191 };
  var prayerRoomLocation = { latitude: 51.509865, longitude: -0.118092 };

  var distanceToToilet = geolib.getDistance(userLocation, toiletLocation);
  var distanceToPrayerRoom = geolib.getDistance(userLocation, prayerRoomLocation);

  if (distanceToToilet < 100) {
    sendNotification("There's a public toilet nearby.");
  }
  if (distanceToPrayerRoom < 100) {
    sendNotification("There's a prayer room nearby.");
  }
}

function sendNotification(message) {
  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }
}

function handleGeolocationSuccess(position) {
  var userLocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
  checkProximityToReminderLocations(userLocation);
}

function handleGeolocationError(error) {
  console.error("Error getting user's location:", error);
}

navigator.geolocation.getCurrentPosition(handleGeolocationSuccess, handleGeolocationError);

const locationForm = document.getElementById("locationForm");

if (locationForm) {
  locationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const googleMapLink = document.getElementById("googleMapLink").value;
    const capacity = document.getElementById("capacity").value;

    fetch("http://localhost:3000/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, address, googleMapLink, capacity })
    })
      .then((res) => res.text())
      .then((msg) => {
        alert(msg);

        const locationItem = document.createElement("div");
        locationItem.classList.add("location-item");
        locationItem.innerHTML = `
          <div>
            <strong>${name}</strong><br>
            ${address} <br>
            Capacity: ${capacity} people
          </div>
          <a href="${googleMapLink}" target="_blank" class="view-map-btn">View Location on Map</a>
        `;

        document.getElementById("locationsList").appendChild(locationItem);

        locationForm.reset();
        document.getElementById("formContainer").style.display = "none";
      })
      .catch((err) => {
        console.error("Error saving data:", err);
        alert("Failed to save location.");
      });
  });
}

