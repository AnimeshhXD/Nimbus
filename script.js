

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, geoFallback);
  } else {
    geoFallback();
  }
}

function geoFallback() {
  alert("Geolocation failed. Showing weather for default city.");
  fetchWeatherByCity("Mumbai, India");
}

async function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${lat},${lon}?unitGroup=metric&key=${apiKey}&include=current,days&elements=datetime,temp,conditions,icon&contentType=json`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    showCurrentWeather(data);
    showForecast(data);
  } catch (err) {
    document.getElementById("location").innerText = "Error loading weather.";
    console.error(err);
  }
}

function fetchWeatherByCity(city) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&include=current,days&elements=datetime,temp,conditions,icon&contentType=json`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      showCurrentWeather(data);
      showForecast(data);
    })
    .catch(err => {
      console.error(err);
      alert("Could not fetch weather.");
    });
}

function showCurrentWeather(data) {
  const currentDay = data.days[0];
  document.getElementById("location").innerText = `${data.resolvedAddress}`;
  document.getElementById("weather-description").innerText = currentDay.conditions;
  document.getElementById("temp").innerText = `${currentDay.temp} °C`;
  document.getElementById("icon").src = getIconUrl(currentDay.icon);
  setBackground(currentDay.icon.toLowerCase());
}

function showForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  data.days.slice(1, 6).forEach(day => {
    const card = document.createElement("div");
    card.className = "forecast-card";

    const date = new Date(day.datetime);
    card.innerHTML = `
      <h4>${date.toDateString()}</h4>
      <img src="${getIconUrl(day.icon)}" alt="${day.conditions}" />
      <p>${day.temp} °C</p>
      <p>${day.conditions}</p>
    `;

    forecastContainer.appendChild(card);
  });
}

function getIconUrl(iconName) {
  return `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/1st%20Set%20-%20Color/${iconName}.png`;
}

function setBackground(condition) {
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
  const clock = now.toLocaleTimeString();
  document.getElementById("clock").innerText = clock;
}

setInterval(updateClock, 1000);
updateClock();
getLocation();

