// === API KEYS ===
const API_KEY = "eafccd29e21d291eb7861e66a85d07f3"; // OpenWeather
const GEMINI_API_KEY = "AIzaSyDUlVxxqFTeWru1awdBA-V8u4pLjwJEKQI"; // Gemini
const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";

// === DOM ELEMENTS ===
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const weatherResults = document.getElementById("weather-results");
const weatherIconEl = document.getElementById("weather-icon");
const temperatureEl = document.getElementById("temperature");
const descriptionEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const cityNameEl = document.getElementById("city-name");

const loader = document.getElementById("loader");
const welcomeMessage = document.getElementById("welcome-message");
const errorMessage = document.getElementById("error-message");
const errorText = document.getElementById("error-text");
const geminiBtn = document.getElementById("gemini-btn");
const geminiAdviceBox = document.getElementById("gemini-advice-box");
const geminiKeyMessage = document.getElementById("gemini-key-message");

let currentWeatherData = null;

// === EVENT HANDLERS ===
searchBtn.addEventListener("click", fetchWeather);
cityInput.addEventListener("keyup", (e) => e.key === "Enter" && fetchWeather());
geminiBtn.addEventListener("click", fetchGeminiAdvice);

// === WEATHER FETCH ===
async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  showState("loading");
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if (!res.ok) throw new Error(res.status === 404 ? "City not found" : "Error fetching weather");
    const data = await res.json();
    currentWeatherData = data;
    displayWeather(data);
  } catch (err) {
    showState("error", err.message);
  }
}

function displayWeather(data) {
  const { name, main, weather, wind } = data;
  const temp = Math.round(main.temp);
  const desc = weather[0].description;
  const humidity = main.humidity;
  const windSpeed = Math.round(wind.speed * 3.6);
  const icon = weather[0].icon.substring(0, 2);

  cityNameEl.textContent = name;
  temperatureEl.textContent = `${temp}°C`;
  descriptionEl.textContent = desc;
  humidityEl.textContent = `${humidity}%`;
  windEl.textContent = `${windSpeed} km/h`;
  weatherIconEl.innerHTML = getWeatherIcon(icon);

  showState("results");
}

// === STATE HANDLER ===
function showState(state, msg = "") {
  welcomeMessage.classList.add("hidden");
  loader.classList.add("hidden");
  errorMessage.classList.add("hidden");
  weatherResults.classList.add("hidden");
  geminiBtn.classList.add("hidden");
  geminiAdviceBox.classList.add("hidden");
  geminiKeyMessage.classList.add("hidden");

  if (state === "loading") loader.classList.remove("hidden");
  else if (state === "error") {
    errorMessage.classList.remove("hidden");
    errorText.textContent = msg;
  } else if (state === "results") {
    weatherResults.classList.remove("hidden");
    geminiBtn.classList.remove("hidden");
  } else welcomeMessage.classList.remove("hidden");
}

// === GEMINI FEATURE ===
async function fetchGeminiAdvice() {
  if (!currentWeatherData) return;

  if (!GEMINI_API_KEY) {
    geminiKeyMessage.classList.remove("hidden");
    return;
  }

  geminiBtn.classList.add("hidden");
  geminiAdviceBox.classList.remove("hidden");
  geminiAdviceBox.innerHTML = `<div class="gemini-loader">✨ Generating smart advice...</div>`;

  const { name, main, weather } = currentWeatherData;
  const prompt = `
You are a friendly weather assistant. Based on this data, write a short 2-3 sentence recommendation on what to wear or do.

City: ${name}
Temp: ${main.temp}°C
Condition: ${weather[0].description}
Humidity: ${main.humidity}%
  `;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const result = await res.json();
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "No advice available.";
    geminiAdviceBox.innerHTML = text.replace(/\n/g, "<br>");
  } catch {
    geminiAdviceBox.textContent = "⚠️ Unable to get AI advice. Try again later.";
  }
}

// === WEATHER ICONS ===
function getWeatherIcon(code) {
  const icons = {
    "01": "☀️", "02": "🌤️", "03": "☁️", "04": "🌥️", 
    "09": "🌧️", "10": "🌦️", "11": "🌩️", "13": "❄️", "50": "🌫️"
  };
  return `<div class="text-6xl">${icons[code] || "☁️"}</div>`;
}


