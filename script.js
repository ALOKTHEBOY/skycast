const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const loader = document.getElementById("loader");
let isLoading = false;

const weatherCodeMap = {
    0: { label: "Sunny", emoji: "☀️" },
    1: { label: "Mainly Clear", emoji: "🌤️" },
    2: { label: "Partly Cloudy", emoji: "⛅" },
    3: { label: "Cloudy", emoji: "☁️" },
    45: { label: "Fog", emoji: "🌫️" },
    48: { label: "Fog", emoji: "🌫️" },
    51: { label: "Drizzle", emoji: "🌦️" },
    53: { label: "Drizzle", emoji: "🌦️" },
    55: { label: "Drizzle", emoji: "🌦️" },
    56: { label: "Freezing Drizzle", emoji: "🌧️" },
    57: { label: "Freezing Drizzle", emoji: "🌧️" },
    61: { label: "Rainy", emoji: "🌧️" },
    63: { label: "Rainy", emoji: "🌧️" },
    65: { label: "Rainy", emoji: "🌧️" },
    66: { label: "Freezing Rain", emoji: "🌧️" },
    67: { label: "Freezing Rain", emoji: "🌧️" },
    71: { label: "Snow", emoji: "❄️" },
    73: { label: "Snow", emoji: "❄️" },
    75: { label: "Snow", emoji: "❄️" },
    77: { label: "Snow", emoji: "❄️" },
    80: { label: "Rain Showers", emoji: "🌦️" },
    81: { label: "Rain Showers", emoji: "🌦️" },
    82: { label: "Rain Showers", emoji: "🌧️" },
    85: { label: "Snow Showers", emoji: "🌨️" },
    86: { label: "Snow Showers", emoji: "🌨️" },
    95: { label: "Thunderstorm", emoji: "⛈️" },
    96: { label: "Thunderstorm", emoji: "⛈️" },
    99: { label: "Thunderstorm", emoji: "⛈️" }
};

function formatDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

const liveClock = document.getElementById("liveClock");

function formatTime(date) {
    return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

function updateClock() {
    const now = new Date();
    const timeString = formatTime(now);
    const weekday = now.toLocaleDateString(undefined, { weekday: "long" });
    const dateString = now.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
    liveClock.textContent = `${weekday}, ${dateString} · ${timeString}`;
}

function showLoader() {
    loader.classList.remove("hidden");
    searchBtn.disabled = true;
    searchBtn.setAttribute('aria-disabled', 'true');
    isLoading = true;
}

function hideLoader() {
    loader.classList.add("hidden");
    searchBtn.disabled = false;
    searchBtn.removeAttribute('aria-disabled');
    isLoading = false;
}

function getWeatherCondition(code) {
    return weatherCodeMap[code] || { label: "Unknown", emoji: "🌥️" };
}

async function getWeather() {
    if (isLoading) return;

    const city = cityInput.value.trim();
    // reflect trimmed value back into the input to remove extra spaces
    cityInput.value = city;

    if (city === "") {
        alert("Enter a city name.");
        return;
    }

    showLoader();

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            renderErrorCard("City not found", "Please check the spelling or try another nearby city.");
            return;
        }

        const latitude = geoData.results[0].latitude;
        const longitude = geoData.results[0].longitude;
        const cityName = geoData.results[0].name;
        const country = geoData.results[0].country;

        // Request more fields: current_weather, hourly apparent temp & humidity, daily sunrise/sunset, and timezone
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=apparent_temperature,relativehumidity_2m&daily=sunrise,sunset&timezone=auto`
        );

        const weatherData = await weatherResponse.json();

        // current weather (from current_weather)
        const current = weatherData.current_weather || {};
        const condition = getWeatherCondition(current.weathercode);
        const today = formatDate(new Date());

        // timezone
        const timezone = weatherData.timezone || "UTC";

        // find index in hourly to match current time (if available)
        let feelsLike = "N/A";
        if (weatherData.hourly && weatherData.hourly.time) {
            const times = weatherData.hourly.time;
            const idx = times.indexOf(current.time);
            if (idx !== -1 && weatherData.hourly.apparent_temperature) {
                const val = weatherData.hourly.apparent_temperature[idx];
                feelsLike = `${Math.round(val)} °C`;
            }
        }

        // sunrise & sunset (daily arrays)
        let sunrise = "N/A";
        let sunset = "N/A";
        if (weatherData.daily) {
            if (weatherData.daily.sunrise && weatherData.daily.sunrise.length > 0) {
                const sr = new Date(weatherData.daily.sunrise[0]);
                sunrise = sr.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
            }
            if (weatherData.daily.sunset && weatherData.daily.sunset.length > 0) {
                const ss = new Date(weatherData.daily.sunset[0]);
                sunset = ss.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
            }
        }

        // humidity and wind: try to get from hourly if available
        let humidity = 'N/A';
        let wind = 'N/A';
        if (weatherData.hourly && weatherData.hourly.relativehumidity_2m) {
            const times = weatherData.hourly.time;
            const idx = times.indexOf(current.time);
            if (idx !== -1) humidity = weatherData.hourly.relativehumidity_2m[idx];
        }
        if (current.windspeed !== undefined) {
            wind = current.windspeed;
        }

        // temperature: current.temperature if present, otherwise try hourly
        let temperature = 'N/A';
        if (current.temperature !== undefined) {
            temperature = current.temperature;
        } else if (weatherData.hourly && weatherData.hourly.apparent_temperature) {
            // fallback: use apparent temp as proxy
            const times = weatherData.hourly.time;
            const idx = times.indexOf(current.time);
            if (idx !== -1) temperature = weatherData.hourly.apparent_temperature[idx];
        }

        weatherResult.innerHTML = `
            <div class="weather-header">
                <h2>${condition.emoji} ${condition.label}</h2>
                <p>${today}</p>
            </div>
            <h3>${cityName}, ${country}</h3>

            <div class="info-cards">
                <div class="info-card">
                    <div class="card-title">Feels Like</div>
                    <div class="card-value">${feelsLike}</div>
                    <div class="card-sub">apparent temperature</div>
                </div>
                <div class="info-card">
                    <div class="card-title">Sunrise</div>
                    <div class="card-value">${sunrise}</div>
                    <div class="card-sub">local time</div>
                </div>
                <div class="info-card">
                    <div class="card-title">Sunset</div>
                    <div class="card-value">${sunset}</div>
                    <div class="card-sub">local time</div>
                </div>
                <div class="info-card">
                    <div class="card-title">Timezone</div>
                    <div class="card-value">${timezone}</div>
                    <div class="card-sub">data source</div>
                </div>
            </div>

            <div style="margin-top:16px">
                <p>🌡 Temperature: ${temperature} °C</p>
                <p>💧 Humidity: ${humidity}%</p>
                <p>🌬 Wind: ${wind} km/h</p>
            </div>
        `;
    } catch (error) {
        renderErrorCard("Something went wrong", "Please try again or check your connection.");
    } finally {
        hideLoader();
        // focus input after results/error shown
        try { cityInput.focus({ preventScroll: true }); } catch (e) { cityInput.focus(); }
    }
}

function renderErrorCard(title, message) {
    weatherResult.innerHTML = `
        <div class="error-card">
            <div class="emoji">❌</div>
            <h2>${title}</h2>
            <p>${message}</p>
            <button id="retryBtn" class="retry-btn">Retry</button>
        </div>
    `;

    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            // Re-run the search with current input
            getWeather();
        });
    }
}

searchBtn.addEventListener("click", getWeather);

// Use keydown for reliable Enter handling and trim before searching
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        getWeather();
    }
});

updateClock();
setInterval(updateClock, 1000);
