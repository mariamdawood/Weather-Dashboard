const apiKey = '910cdcb0016aef6dbea4901757de5da6';

//Retrieve all classes and ids needed from html
const searchBar = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');

const daysForecast = document.querySelector('.days-forecast');
const details = document.querySelector('.details');
const weatherCards = document.querySelector('#weather-cards');
const citiesButtons = document.querySelector('#cities-buttons');

// Converting latitude and longitude to user input value which is the city name to retrieve the API data by the city name
function convertCity(event) {
  event.preventDefault();
  // Fetch API
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${searchBar.value}&appid=${apiKey}`)
    // Retrieve response.json
    .then(response => {
      return response.json();
    })
    // Retrieve data
    .then(data => {
      console.log(data);
      // Convert
      getWeather(data[0].lat, data[0].lon);
    })
    // Console.log errors
    .catch(error => {
      console.error('Fetch error:', error);
    })
}

// Retrieve weather data based on latitude and longitude
function getWeather(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(response => {
      if (!response.ok) {
        console.log(response);
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      // Pass data to functions
      createCurrent(data);
      createCards(data);
      createSearchHistoryButtons(data);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    })
}

// Make the search button fetch the response of the converCity function
searchButton.addEventListener('click', convertCity);

// Dynamically create the current weather base with passed data
function createCurrent(data) {
  // Remove previous content before displaying new content
  details.innerHTML = "";

  // Create a div element to append current weather info to
  const currentWeather = document.createElement('div');
  // Retrieve class to append weather info
  currentWeather.classList = 'details';

  const currentCityAndDate = `${data.city.name} ( ${data.list[0].dt_txt.split(' ')[0]} )`;
  
  const current = document.createElement('h2');
  // Display current city and date weather info
  current.textContent = currentCityAndDate;
  currentWeather.appendChild(current);

  // Create an img to display weather icon
  const currentIcon = document.createElement('img');
  // Retrieve weather icon
  currentIcon.src = `https://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png`;
  currentWeather.appendChild(currentIcon);

  const kelvinTemperature = data.list[0].main.temp;
  // Convert kelvin to fahrenheit
  const fahrenheitTemperature = kelvinToFahrenheit(kelvinTemperature);

  const currentTemperature = document.createElement('h6');
  // Display temperature in fahrenheit
  currentTemperature.textContent = `Temperature: ${fahrenheitTemperature.toFixed(2)} °F`;
  currentWeather.appendChild(currentTemperature);

  const windSpeedMS = data.list[0].wind.speed;
  // Convert wind speed to mph
  const windSpeedMPH = convertWindSpeed(windSpeedMS);

  const currentWind = document.createElement('h6');
  // Display wind speed it mph
  currentWind.textContent = `Wind Speed: ${windSpeedMPH.toFixed(2)} MPH`;
  currentWeather.appendChild(currentWind);

  const currentHumidity = document.createElement('h6');
  // Display humidity
  currentHumidity.textContent = `Humidity: ${data.list[0].main.humidity}%`;
  currentWeather.appendChild(currentHumidity);

  // Display current weather after details div
  details.appendChild(currentWeather);
}

function createCards(data) {
  daysForecast.innerHTML = '';
  weatherCards.innerHTML = '';

  // Create a header
  const header = document.createElement('h2');
  header.textContent = '5-Day Forecast';
  daysForecast.appendChild(header);

  const repeatedDates = [];
  const currentlyDisplayedDate = data.list[0].dt_txt.split(' ')[0]; // Split date from hour

  // Filter out items with the same date
  const filteredData = data.list.filter(item => {
    const date = item.dt_txt.split(' ')[0];
    // current date is NOT displayed or if the array didn't display a date THEN display it which prevents from displaying info of the same date
    if (date !== currentlyDisplayedDate && !repeatedDates.includes(date)) {
      repeatedDates.push(date);
      return true;
    }
    return false;
  })

  // Display cards with dates, icon, temperature, wind speed and humidity
  for (let index = 0; index < filteredData.length; index++) {
    const listItem = document.createElement('li');
    listItem.classList = 'card';
    
    const date = filteredData[index].dt_txt.split(' ')[0];

    const fiveDaysDates = `${date}`;

    const fiveDays = document.createElement('h3');
    fiveDays.textContent = fiveDaysDates;
    listItem.appendChild(fiveDays);

    const icon = document.createElement('img');
    icon.src = `https://openweathermap.org/img/w/${data.list[index].weather[0].icon}.png`;
    listItem.appendChild(icon);

    const kelvinTemperature = data.list[index].main.temp;
    const fahrenheitTemperature = kelvinToFahrenheit(kelvinTemperature);

    const temperature = document.createElement('h6');
    temperature.textContent = `Temperature: ${fahrenheitTemperature.toFixed(2)} °F`;
    listItem.appendChild(temperature);

    const windSpeedMS = data.list[index].wind.speed;
    const windSpeedMPH = convertWindSpeed(windSpeedMS);

    const wind = document.createElement('h6');
    wind.textContent = `Wind Speed: ${windSpeedMPH.toFixed(2)} MPH`;
    listItem.appendChild(wind);

    const humidity = document.createElement('h6');
    humidity.textContent = `Humidity: ${data.list[index].main.humidity}%`;
    listItem.appendChild(humidity);

    weatherCards.appendChild(listItem)
  }
}

// Convert kelvin to fahrenheit
function kelvinToFahrenheit(kelvin) {
  return (kelvin - 273.15) * (9 / 5) + 32;
}

// Convert ms to mph
function convertWindSpeed(windSpeedMS) {
  return windSpeedMS * 2.23694;
}

function createSeparator() {
  const separator = document.createElement('hr');
  return separator;
}

// Dynamically create a search history button with city name after the user search for a city
function createSearchHistoryButtons(data) {
  const city = `${data.city.name}`;
  const searchHistoryButtons = document.createElement('button');
  searchHistoryButtons.textContent = city;

  // Check if button with same city name is already created
  const existingButton = Array.from(citiesButtons.children).find(button => button.textContent === city);

  // If button existed don't do anything
  if (existingButton) {
    return;
  }

  const separator = createSeparator();

  // Create a separator before each button
  citiesButtons.appendChild(separator);
  citiesButtons.appendChild(searchHistoryButtons);

  // When clicked it displays all info in localStorage 
  searchHistoryButtons.addEventListener('click', function (event) {
    event.preventDefault();
    // Retrieve localStorage data
    const storedDataJSON = localStorage.getItem(city);
    // Convert into object
    const storedData = JSON.parse(storedDataJSON);

    if (storedData) {
      createCurrent(data);
      createCards(data);
    }
  })

  // To use both
  const storedObject = {
    city,
    data
  }

  // Convert into string
  const storedObjectJSON = JSON.stringify(storedObject);
  // Set localStorage to store buttons and its weather info
  localStorage.setItem(city, storedObjectJSON);
}

// Create a for loop to get localStorage for all buttons
function loadSearchHistory() {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const storedDataJSON = localStorage.getItem(key);
    const storedData = JSON.parse(storedDataJSON);

    if (storedData) {
      createSearchHistoryButtons(storedData.data);
    }
  }
}

// Get localStorage on page load
window.addEventListener('load', loadSearchHistory);