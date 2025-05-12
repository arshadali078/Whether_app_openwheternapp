var cityInputMobile = document.getElementById("mobileSearchCity");

cityInputMobile.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    loader();

    function loader() {
      const clearElement = (id) => {
        const el = document.getElementById(id);
        el.innerHTML = '';
        const img = document.createElement("img");
        img.src = "icons/loader.gif";
        img.className = "loader-gif";
        el.appendChild(img);
      };

      clearElement("locationName");
      clearElement("temperatureValue");
      clearElement("weatherType");
    }

    var cityInputValue = cityInputMobile.value.trim();

    if (cityInputValue === "") {
      document.getElementById("locationName").innerHTML = "Enter a city name...";
      return;
    }

    var apiKey = "b1fd6e14799699504191b6bdbcadfc35";
    var unit = "metric";
    var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInputValue}&appid=${apiKey}&units=${unit}`;

    async function getWeather() {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.message !== "city not found" && data.cod !== "404") {
          const {
            name: location,
            main: { temp, feels_like, pressure, temp_max, temp_min, humidity },
            weather,
            wind: { speed, deg },
            visibility,
            sys: { sunrise, sunset },
          } = data;

          const weatherType = weather[0].description;
          const mainWeather = weather[0].main.toLowerCase();

          // Set weather image
          const weatherImage = document.getElementById("weatherImage");
          if (mainWeather.includes("rain")) {
            weatherImage.src = "icons/rain.png";
          } else if (mainWeather.includes("cloud")) {
            weatherImage.src = "icons/cloud.png";
          } else if (mainWeather.includes("clear")) {
            weatherImage.src = "icons/clear.png";
          } else if (mainWeather.includes("snow")) {
            weatherImage.src = "icons/snow.png";
          } else if (mainWeather.includes("thunderstorm")) {
            weatherImage.src = "icons/thunderstorm.png";
          } else {
            weatherImage.src = "icons/default.png";
          }

          document.getElementById("locationName").innerHTML = location;
          document.getElementById("temperatureValue").innerHTML = `${temp}<sup>o</sup>C`;
          document.getElementById("weatherType").innerHTML = weatherType;
          document.getElementById("realFeelAdditionalValue").innerHTML = `${feels_like}<sup>o</sup>C`;
          document.getElementById("windSpeedAdditionalValue").innerHTML = `${speed} km/h`;
          document.getElementById("windDirectionAdditionalValue").innerHTML = deg;
          document.getElementById("visibilityAdditionalValue").innerHTML = `${(visibility / 1000).toFixed(1)} km`;
          document.getElementById("pressureAdditionalValue").innerHTML = pressure;
          document.getElementById("maxTemperatureAdditionalValue").innerHTML = `${temp_max}<sup>o</sup>C`;
          document.getElementById("minTemperatureAdditionalValue").innerHTML = `${temp_min}<sup>o</sup>C`;
          document.getElementById("humidityAdditionalValue").innerHTML = humidity;
          document.getElementById("sunriseAdditionalValue").innerHTML = new Date(sunrise * 1000).toLocaleTimeString();
          document.getElementById("sunsetAdditionalValue").innerHTML = new Date(sunset * 1000).toLocaleTimeString();

          // Forecast
          const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityInputValue}&appid=${apiKey}`);
          const forecastData = await forecastRes.json();
          const forecastContainer = document.getElementById('forecast-container');
          forecastContainer.innerHTML = '';

          const dailyForecasts = {};
          forecastData.list.forEach(entry => {
            const dateTime = new Date(entry.dt * 1000);
            const date = dateTime.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
            if (!dailyForecasts[date]) {
              dailyForecasts[date] = {
                date: date,
                icon: `https://openweathermap.org/img/w/${entry.weather[0].icon}.png`,
                maxTemp: -Infinity,
                minTemp: Infinity,
                weatherType: entry.weather[0].main
              };
            }
            if (entry.main.temp_max > dailyForecasts[date].maxTemp) {
              dailyForecasts[date].maxTemp = entry.main.temp_max;
            }
            if (entry.main.temp_min < dailyForecasts[date].minTemp) {
              dailyForecasts[date].minTemp = entry.main.temp_min;
            }
          });

          Object.values(dailyForecasts).forEach(day => {
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('daily-forecast-card');
            forecastCard.innerHTML = `
              <p class="daily-forecast-date">${day.date}</p>
              <div class="daily-forecast-logo"><img class="imgs-as-icons" src="${day.icon}"></div>
              <div class="max-min-temperature-daily-forecast">
                <span class="max-daily-forecast">${Math.round(day.maxTemp - 273.15)}<sup>o</sup>C</span>
                <span class="min-daily-forecast">${Math.round(day.minTemp - 273.15)}<sup>o</sup>C</span>
              </div>
              <p class="weather-type-daily-forecast">${day.weatherType}</p>
            `;
            forecastContainer.appendChild(forecastCard);
          });

        } else {
          document.getElementById("locationName").innerHTML = "City Not Found";
          document.getElementById("temperatureValue").innerHTML = "";
          document.getElementById("weatherType").innerHTML = "";
        }
      } catch (err) {
        console.error("Fetch error:", err);
        document.getElementById("locationName").innerHTML = "Error fetching weather data.";
      }
    }

    getWeather();
  }
});
