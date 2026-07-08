const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");
const loader = document.getElementById("loader");
const recentSearchesList = document.getElementById("recentSearchesList");
const favoriteCitiesList = document.getElementById("favoriteCitiesList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const compareCityOne = document.getElementById("compareCityOne");
const compareCityTwo = document.getElementById("compareCityTwo");
const compareBtn = document.getElementById("compareBtn");
const compareResults = document.getElementById("compareResults");
const liveClock = document.getElementById("liveClock");
let isLoading = false;
const STORAGE_KEY = "weatherAppRecentSearches";
const FAVORITES_KEY = "weatherAppFavoriteCities";
const LAST_CITY_KEY = "weatherAppLastCity";

function loadRecentSearches() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

let recentSearches = loadRecentSearches();

function loadFavorites() {
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

let favorites = loadFavorites();

function saveRecentSearches() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function loadLastCity() {
    try {
        const stored = localStorage.getItem(LAST_CITY_KEY);
        return stored ? stored : "";
    } catch (error) {
        return "";
    }
}

function saveLastCity(cityName) {
    const cleanedName = cityName.trim();
    if (!cleanedName) return;
    localStorage.setItem(LAST_CITY_KEY, cleanedName);
}

function renderRecentSearches() {
    if (!recentSearchesList) return;

    if (recentSearches.length === 0) {
        recentSearchesList.innerHTML = '<li class="empty-history">Your successful searches will appear here.</li>';
        return;
    }

    recentSearchesList.innerHTML = recentSearches
        .map((city) => `
            <li>
                <button class="recent-search-chip" type="button" data-city="${city}">${city}</button>
            </li>
        `)
        .join("");
}

function addRecentSearch(cityName) {
    const cleanedName = cityName.trim();
    if (!cleanedName) return;

    const normalizedName = cleanedName.toLowerCase();
    recentSearches = recentSearches.filter((item) => item.toLowerCase() !== normalizedName);
    recentSearches.unshift(cleanedName);
    recentSearches = recentSearches.slice(0, 8);
    saveRecentSearches();
    renderRecentSearches();
}

function clearRecentSearches() {
    recentSearches = [];
    saveRecentSearches();
    renderRecentSearches();
}

function renderFavoriteCities() {
    if (!favoriteCitiesList) return;

    if (favorites.length === 0) {
        favoriteCitiesList.innerHTML = '<li class="empty-history">Save your favorite cities here.</li>';
        return;
    }

    favoriteCitiesList.innerHTML = favorites
        .map((city) => `
            <li>
                <button class="recent-search-chip" type="button" data-city="${city}">${city}</button>
            </li>
        `)
        .join("");
}

function isCityFavorite(cityName) {
    return favorites.some((city) => city.toLowerCase() === cityName.trim().toLowerCase());
}

function toggleFavorite(cityName) {
    const cleanedName = cityName.trim();
    if (!cleanedName) return;

    if (isCityFavorite(cleanedName)) {
        favorites = favorites.filter((city) => city.toLowerCase() !== cleanedName.toLowerCase());
    } else {
        favorites = favorites.filter((city) => city.toLowerCase() !== cleanedName.toLowerCase());
        favorites.unshift(cleanedName);
        favorites = favorites.slice(0, 10);
    }

    saveFavorites();
    renderFavoriteCities();
}

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

async function getWeather(cityNameOverride = "") {
    if (isLoading) return;

    const city = (cityNameOverride || cityInput.value).trim();
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

        addRecentSearch(cityName);
        saveLastCity(cityName);

        const weatherCardProps = {
            cityName,
            country,
            condition,
            today,
            feelsLike,
            sunrise,
            sunset,
            timezone,
            temperature,
            humidity,
            wind
        };

        renderWeatherCard(weatherCardProps);
    } catch (error) {
        renderErrorCard("Something went wrong", "Please try again or check your connection.");
    } finally {
        hideLoader();
        // focus input after results/error shown
        try { cityInput.focus({ preventScroll: true }); } catch (e) { cityInput.focus(); }
    }
}

function renderWeatherCard(props) {
    const isFavorite = isCityFavorite(props.cityName);
    weatherResult.innerHTML = `
        <div class="weather-actions">
            <button id="favoriteBtn" class="favorite-btn ${isFavorite ? "active" : ""}" type="button" aria-pressed="${isFavorite}">
                <span class="favorite-icon">${isFavorite ? "★" : "☆"}</span>
                ${isFavorite ? "Favorited" : "Favorite"}
            </button>
        </div>
        <div class="weather-header">
            <h2>${props.condition.emoji} ${props.condition.label}</h2>
            <p>${props.today}</p>
        </div>
        <h3>${props.cityName}, ${props.country}</h3>

        <div class="info-cards">
            <div class="info-card">
                <div class="card-title">Feels Like</div>
                <div class="card-value">${props.feelsLike}</div>
                <div class="card-sub">apparent temperature</div>
            </div>
            <div class="info-card">
                <div class="card-title">Sunrise</div>
                <div class="card-value">${props.sunrise}</div>
                <div class="card-sub">local time</div>
            </div>
            <div class="info-card">
                <div class="card-title">Sunset</div>
                <div class="card-value">${props.sunset}</div>
                <div class="card-sub">local time</div>
            </div>
            <div class="info-card">
                <div class="card-title">Timezone</div>
                <div class="card-value">${props.timezone}</div>
                <div class="card-sub">data source</div>
            </div>
        </div>

        <div style="margin-top:16px">
            <p>🌡 Temperature: ${props.temperature} °C</p>
            <p>💧 Humidity: ${props.humidity}%</p>
            <p>🌬 Wind: ${props.wind} km/h</p>
        </div>
    `;

    const favoriteBtn = document.getElementById("favoriteBtn");
    if (favoriteBtn) {
        favoriteBtn.addEventListener("click", () => {
            toggleFavorite(props.cityName);
            renderWeatherCard(props);
        });
    }
}

async function fetchWeatherData(city) {
    const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
    );

    const geoData = await geoResponse.json();
    if (!geoData.results) {
        throw new Error("City not found");
    }

    const latitude = geoData.results[0].latitude;
    const longitude = geoData.results[0].longitude;
    const cityName = geoData.results[0].name;
    const country = geoData.results[0].country;

    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=apparent_temperature,relativehumidity_2m&daily=sunrise,sunset&timezone=auto`
    );

    const weatherData = await weatherResponse.json();
    const current = weatherData.current_weather || {};
    const condition = getWeatherCondition(current.weathercode);

    let feelsLike = "N/A";
    if (weatherData.hourly && weatherData.hourly.time) {
        const times = weatherData.hourly.time;
        const idx = times.indexOf(current.time);
        if (idx !== -1 && weatherData.hourly.apparent_temperature) {
            const val = weatherData.hourly.apparent_temperature[idx];
            feelsLike = `${Math.round(val)} °C`;
        }
    }

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

    let temperature = 'N/A';
    if (current.temperature !== undefined) {
        temperature = current.temperature;
    } else if (weatherData.hourly && weatherData.hourly.apparent_temperature) {
        const times = weatherData.hourly.time;
        const idx = times.indexOf(current.time);
        if (idx !== -1) temperature = weatherData.hourly.apparent_temperature[idx];
    }

    return {
        cityName,
        country,
        condition,
        temperature,
        feelsLike,
        humidity,
        wind,
        sunrise,
        sunset,
        timezone: weatherData.timezone || "UTC"
    };
}

async function compareCities() {
    const cityOne = compareCityOne.value.trim();
    const cityTwo = compareCityTwo.value.trim();

    if (!cityOne || !cityTwo) {
        if (compareResults) {
            compareResults.innerHTML = '<p class="empty-history">Please enter two cities to compare.</p>';
        }
        return;
    }

    showLoader();

    try {
        const [firstCity, secondCity] = await Promise.all([
            fetchWeatherData(cityOne),
            fetchWeatherData(cityTwo)
        ]);

        renderCompareResults([firstCity, secondCity]);
    } catch (error) {
        if (compareResults) {
            compareResults.innerHTML = '<p class="empty-history">Unable to compare those cities right now.</p>';
        }
    } finally {
        hideLoader();
    }
}

function renderCompareResults(cities) {
    if (!compareResults) return;

    compareResults.innerHTML = cities.map((city) => `
        <div class="compare-card">
            <h4>${city.cityName}, ${city.country}</h4>
            <p><strong>${city.condition.emoji}</strong> ${city.condition.label}</p>
            <p>🌡 Temperature: ${city.temperature} °C</p>
            <p>🌡 Feels Like: ${city.feelsLike}</p>
            <p>💧 Humidity: ${city.humidity}%</p>
            <p>🌬 Wind: ${city.wind} km/h</p>
            <p>🌅 Sunrise: ${city.sunrise}</p>
            <p>🌇 Sunset: ${city.sunset}</p>
            <p>🕒 Timezone: ${city.timezone}</p>
        </div>
    `).join("");
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

const historyClickHandler = (event) => {
    const button = event.target.closest("button[data-city]");
    if (!button) return;

    const city = button.getAttribute("data-city");
    if (!city) return;

    cityInput.value = city;
    getWeather(city);
};

if (recentSearchesList) {
    recentSearchesList.addEventListener("click", historyClickHandler);
}

if (favoriteCitiesList) {
    favoriteCitiesList.addEventListener("click", historyClickHandler);
}

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", clearRecentSearches);
}

if (compareBtn) {
    compareBtn.addEventListener("click", compareCities);
}

renderFavoriteCities();
renderRecentSearches();
updateClock();

const savedCity = loadLastCity();
if (savedCity) {
    cityInput.value = savedCity;
    getWeather(savedCity);
}

setInterval(updateClock, 1000);
