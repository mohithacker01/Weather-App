const apiKey = "de846b0858ddcfaa2c8c0db760eade14";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const apiUrlByCoords = "https://api.openweathermap.org/data/2.5/weather?units=metric&lat=";
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";
const forecastUrlByCoords = "https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const locationBtn = document.querySelector(".location-btn");
const weatherIcon = document.querySelector(".weather-icon");
const progressBar = document.getElementsByClassName('progress-bar')[0];

let progressInterval;
let weatherData = null;
let forecastData = null;
let hasError = false;

async function checkWeather(city) {
    try {
        const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

        if (!response.ok) {
            hasError = true;
        } else {
            weatherData = await response.json();
            hasError = false;
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
        hasError = true;
    }
}

async function checkWeatherByCoords(lat, lon) {
    try {
        const response = await fetch(apiUrlByCoords + lat + `&lon=${lon}&appid=${apiKey}`);

        if (!response.ok) {
            hasError = true;
        } else {
            weatherData = await response.json();
            hasError = false;
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
        hasError = true;
    }
}

async function checkForecast(city) {
    try {
        const response = await fetch(forecastUrl + city + `&appid=${apiKey}`);

        if (!response.ok) {
            forecastData = null;
        } else {
            forecastData = await response.json();
        }
    } catch (error) {
        console.error("Error fetching forecast:", error);
        forecastData = null;
    }
}

async function checkForecastByCoords(lat, lon) {
    try {
        const response = await fetch(forecastUrlByCoords + lat + `&lon=${lon}&appid=${apiKey}`);

        if (!response.ok) {
            forecastData = null;
        } else {
            forecastData = await response.json();
        }
    } catch (error) {
        
        // Display forecast
        displayForecast();
        console.error("Error fetching forecast:", error);
        forecastData = null;
    }
}

function displayWeather() {
    if (hasError) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        const data = weatherData;
        document.querySelector(".city").innerHTML = data.name;
        document.querySelector(".temp").innerHTML = Math.round(data.main.temp) + "°c";
        document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
        document.querySelector(".wind").innerHTML = data.wind.speed + " km/h";

        if (data.weather[0].main == "Clouds") {
            weatherIcon.src = "images/clouds.png";
        } else if (data.weather[0].main == "Clear") {
            weatherIcon.src = "images/clear.png";
        } else if (data.weather[0].main == "Rain") {
            weatherIcon.src = "images/rain.png";
        } else if (data.weather[0].main == "Drizzle") {
            weatherIcon.src = "images/drizzle.png";
        } else if (data.weather[0].main == "Mist") {
            weatherIcon.src = "images/mist.png";
        }

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
        
        // Display forecast
        displayForecast();
    }
}

function displayForecast() {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = "";

    if (!forecastData || !forecastData.list) return;

    // Get forecast for next 5 days (every 24 hours)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        
        // Keep only one forecast per day (the first one we encounter)
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = item;
        }
    });

    // Display up to 5 days
    Object.keys(dailyForecasts).slice(0, 5).forEach(day => {
        const forecast = dailyForecasts[day];
        const temp = Math.round(forecast.main.temp);
        const weather = forecast.weather[0].main;
        
        let iconSrc = "images/clouds.png";
        if (weather == "Clouds") iconSrc = "images/clouds.png";
        else if (weather == "Clear") iconSrc = "images/clear.png";
        else if (weather == "Rain") iconSrc = "images/rain.png";
        else if (weather == "Drizzle") iconSrc = "images/drizzle.png";
        else if (weather == "Mist") iconSrc = "images/mist.png";

        const forecastHTML = `
            <div class="forecast-item">
                <p class="forecast-day">${day}</p>
                <img src="${iconSrc}" alt="${weather}">
                <p class="forecast-temp">${temp}°c</p>
                <p>${weather}</p>
            </div>
        `;
        
        forecastContainer.innerHTML += forecastHTML;
    });
}

function resetProgressBar() {
  clearInterval(progressInterval); // stop old animation
  progressBar.style.setProperty('--width', 0); // reset to 0
  progressBar.style.display = 'flex'; // show bar
  progressBar.setAttribute('data-label', 'Loading...');
}

function startProgressBar() {
  resetProgressBar();
  progressInterval = setInterval(() => {
    const computedStyle = getComputedStyle(progressBar);
    const width = parseFloat(computedStyle.getPropertyValue('--width')) || 0;
    if (width < 100) {
      progressBar.style.setProperty('--width', width + 0.5);
    } else {
      clearInterval(progressInterval);
      progressBar.style.display = 'none';
    }
  }, 5);
}

async function performSearch() {
    progressBar.style.display = "flex";
    progressBar.style.setProperty('--width', 0);
    clearInterval(progressInterval);
    weatherData = null;
    hasError = false;
    document.querySelector(".error").style.display = "none";
    document.querySelector(".weather").style.display = "none";
    startProgressBar();
    await checkWeather(searchBox.value);
    await checkForecast(searchBox.value);
    // Wait for progress bar to complete (500ms for full bar)
    await new Promise(resolve => setTimeout(resolve, 500));
    displayWeather();
}

searchBtn.addEventListener("click", () => {
    performSearch();
});

searchBox.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        performSearch();
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        progressBar.style.display = "flex";
        progressBar.style.setProperty('--width', 0);
        clearInterval(progressInterval);
        weatherData = null;
        hasError = false;
        document.querySelector(".error").style.display = "none";
        document.querySelector(".weather").style.display = "none";
        startProgressBar();
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await checkWeatherByCoords(lat, lon);
            await checkForecastByCoords(lat, lon);
            // Wait for progress bar to complete (500ms for full bar)
            await new Promise(resolve => setTimeout(resolve, 500));
            displayWeather();
        }, (error) => {
            console.error("Error getting location:", error);
            hasError = false;
            progressBar.style.display = "none";
            document.querySelector(".error").style.display = "block";
            document.querySelector(".error p").innerHTML = "Unable to access your location. Please enable location services.";
            document.querySelector(".weather").style.display = "none";
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
});
   