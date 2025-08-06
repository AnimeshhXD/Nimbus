const apiKey = "AJTWBE6ACRJWX8CHACXTWDPVB";

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoFallback, {
      timeout: 10000,
      maximumAge: 60000,
      enableHighAccuracy: true,
    });
  } else {
    geoFallback();
  }
}

function geoFallback() {
  alert("Geolocation failed or not supported. Showing weather for default city.");
  fetchWeatherByCity("Mumbai, India");
}

async function success(position) {
  try {
    if (!position || !position.coords) throw new Error("Invalid position object");

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    if (typeof lat !== "number" || typeof lon !== "number") {
      throw new Error("Latitude or longitude is not a number");
    }

    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=current,days&elements=datetime,temp,conditions,icon&contentType=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);

    const data = await res.json();

    if (!data || !data.days || !data.days.length) throw new Error("Incomplete weather data");

    showCurrentWeather(data);
    showForecast(data);
  } catch (err) {
    document.getElementById("location").innerText = "Error loading weather.";
    console.error(err);
    geoFallback(); // fallback if location weather fails
  }
}

function fetchWeatherByCity(city) {
  if (!city || typeof city !== "string") {
    alert("Invalid city name");
    return;
  }

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&include=current,days&elements=datetime,temp,conditions,icon&contentType=json`;

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!data || !data.days || !data.days.length) throw new Error("Incomplete weather data");

      showCurrentWeather(data);
      showForecast(data);
    })
    .catch(err => {
      console.error(err);
      alert("Could not fetch weather data. Please try again later.");
    });
}

function showCurrentWeather(data) {
  try {
    if (!data || !data.days || !data.days[0]) throw new Error("Invalid data for current weather");

    const currentDay = data.days[0];

    const locationElem = document.getElementById("location");
    const descElem = document.getElementById("weather-description");
    const tempElem = document.getElementById("temp");
    const iconElem = document.getElementById("icon");

    if (!locationElem || !descElem || !tempElem || !iconElem) throw new Error("Missing required DOM elements");

    locationElem.innerText = data.resolvedAddress || "Unknown location";
    descElem.innerText = currentDay.conditions || "N/A";
    tempElem.innerText = `${currentDay.temp ?? "N/A"} °C`;
    iconElem.src = getIconUrl(currentDay.icon || "unknown");
    iconElem.alt = currentDay.conditions || "weather icon";

    setBackground((currentDay.icon || "").toLowerCase());
  } catch (err) {
    console.error("showCurrentWeather error:", err);
  }
}

function showForecast(data) {
  try {
    if (!data || !data.days || data.days.length < 2) return;

    const forecastContainer = document.getElementById("forecast");
    if (!forecastContainer) throw new Error("Forecast container element not found");

    forecastContainer.innerHTML = "";

    data.days.slice(1, 6).forEach(day => {
      const card = document.createElement("div");
      card.className = "forecast-card";

      const date = new Date(day.datetime);

      card.innerHTML = `
        <h4>${date.toDateString()}</h4>
        <img src="${getIconUrl(day.icon || "unknown")}" alt="${day.conditions || ""}" />
        <p>${day.temp ?? "N/A"} °C</p>
        <p>${day.conditions || ""}</p>
      `;

      forecastContainer.appendChild(card);
    });
  } catch (err) {
    console.error("showForecast error:", err);
  }
}

function getIconUrl(iconName) {
  if (!iconName) return "";
  return `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/1st%20Set%20-%20Color/${iconName}.png`;
}

function setBackground(condition) {
  if (!condition || typeof condition !== "string") {
    document.body.style.background = "linear-gradient(to top, #a8edea, #fed6e3)";
    return;
  }

  let background;

  if (condition.includes("clear")) {
    background = "linear-gradient(to top, #fceabb, #f8b500)";
  } else if (condition.includes("cloud")) {
    background = "linear-gradient(to top, #d7d2cc, #304352)";
  } else if (condition.includes("rain")) {
    background = "linear-gradient(to top, #bdc3c7, #2c3e50)";
  } else if (condition.includes("snow")) {
    background = "linear-gradient(to top, #e6dada, #274046)";
  } else if (condition.includes("fog") || condition.includes("haze") || condition.includes("mist")) {
    background = "linear-gradient(to top, #757f9a, #d7dde8)";
  } else {
    background = "linear-gradient(to top, #a8edea, #fed6e3)";
  }

  document.body.style.background = background;
}

function updateClock() {
  const now = new Date();
  const clockElem = document.getElementById("clock");
  if (!clockElem) return;
  const clock = now.toLocaleTimeString();
  clockElem.innerText = clock;
}

setInterval(updateClock, 1000);
updateClock();
getLocation();
