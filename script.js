const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherResult = document.getElementById("weatherResult");

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

function getWeatherCondition(code) {
    return weatherCodeMap[code] || { label: "Unknown", emoji: "🌥️" };
}

async function getWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        alert("Enter a city name.");
        return;
    }

    try {
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            weatherResult.innerHTML = "<h2>City not found.</h2>";
            return;
        }

        const latitude = geoData.results[0].latitude;
        const longitude = geoData.results[0].longitude;
        const cityName = geoData.results[0].name;
        const country = geoData.results[0].country;

        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode`
        );

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;
        const condition = getWeatherCondition(current.weathercode);
        const today = formatDate(new Date());

        weatherResult.innerHTML = `
            <div class="weather-header">
                <h2>${condition.emoji} ${condition.label}</h2>
                <p>${today}</p>
            </div>
            <h3>${cityName}, ${country}</h3>
            <p>🌡 Temperature: ${current.temperature_2m} °C</p>
            <p>💧 Humidity: ${current.relative_humidity_2m}%</p>
            <p>🌬 Wind: ${current.wind_speed_10m} km/h</p>
        `;
    } catch (error) {
        weatherResult.innerHTML = "<h2>Something went wrong.</h2>";
    }
}

searchBtn.addEventListener("click", getWeather);

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        getWeather();
    }
});
