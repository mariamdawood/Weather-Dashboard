const apiKey = '910cdcb0016aef6dbea4901757de5da6';

const searchBar = document.querySelector('#search-input')
const searchButton = document.querySelector('#search-button')

const daysForecast = document.querySelector('.days-forecast')
const details = document.querySelector('.details');
const weatherCards = document.querySelector('#weather-cards')
const citiesButtons = document.querySelector('#cities-buttons')

function convertCity(event) {
  event.preventDefault()

  daysForecast.innerHTML = '';
  details.innerHTML = '';
  weatherCards.innerHTML = '';

  fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${searchBar.value}&appid=${apiKey}`)
    .then(response => {
      return response.json()
    })
    .then(data => {
      console.log(data)
      getWeather(data[0].lat, data[0].lon)
    })
    .catch(error => {
      // Handle errors
      console.error('Fetch error:', error);
    });
}

function getWeather(lat, lon) {
  // Make a GET request
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
    .then(response => {
      // Check if the request was successful (status code 200-299)
      if (!response.ok) {
        console.log(response);
      }
      // Parse the JSON in the response
      return response.json();
    })
    .then(data => {
      // Do something with the parsed data
      console.log(data);
      createCurrent(data);
      createCards(data);
    })
    .catch(error => {
      // Handle errors
      console.error('Fetch error:', error);
    });
}

searchButton.addEventListener('click', convertCity)

function createCurrent(data) {

  const currentWeather = document.createElement('div')
  currentWeather.classList = 'details'

  const currentCityAndDate = `${data.city.name} ( ${data.list[0].dt_txt} )`;

  const current = document.createElement('h2')
  current.textContent = currentCityAndDate
  currentWeather.appendChild(current)

  const kelvinTemperature = data.list[0].main.temp;
  const fahrenheitTemperature = kelvinToFahrenheit(kelvinTemperature);

  const currentTemperature = document.createElement('h6')
  currentTemperature.textContent = `Temperature: ${fahrenheitTemperature.toFixed(2)} °F`;
  currentWeather.appendChild(currentTemperature)

  const windSpeedMS = data.list[0].wind.speed;
  const windSpeedMPH = convertWindSpeed(windSpeedMS);

  const currentWind = document.createElement('h6')
  currentWind.textContent = `Wind Speed: ${windSpeedMPH.toFixed(2)} MPH`;
  currentWeather.appendChild(currentWind)

  const currentHumidity = document.createElement('h6')
  currentHumidity.textContent = `Humidity: ${data.list[0].main.humidity}%`;
  currentWeather.appendChild(currentHumidity)

  details.appendChild(currentWeather);
}

function createCards(data) {

  const header = document.createElement('h2');
  header.textContent = '5-Day Forecast';
  daysForecast.appendChild(header);

  const cardsNumber = Math.min(data.list.length, 5);
  for (let index = 0; index < cardsNumber; index++) {

    const listItem = document.createElement('li')
    listItem.classList = 'card'

    const date = document.createElement('h3')
    date.textContent = data.list[index].dt_txt
    listItem.appendChild(date)

    const kelvinTemperature = data.list[index].main.temp;
    const fahrenheitTemperature = kelvinToFahrenheit(kelvinTemperature);

    const temperature = document.createElement('h6')
    temperature.textContent = `Temperature: ${fahrenheitTemperature.toFixed(2)} °F`;
    listItem.appendChild(temperature)

    const windSpeedMS = data.list[index].wind.speed;
    const windSpeedMPH = convertWindSpeed(windSpeedMS);

    const wind = document.createElement('h6')
    wind.textContent = `Wind Speed: ${windSpeedMPH.toFixed(2)} MPH`;
    listItem.appendChild(wind)

    const humidity = document.createElement('h6')
    humidity.textContent = `Humidity: ${data.list[index].main.humidity}%`;
    listItem.appendChild(humidity)

    // has to be on the bottom
    weatherCards.appendChild(listItem)
  }
}

function kelvinToFahrenheit(kelvin) {
  return (kelvin - 273.15) * (9 / 5) + 32;
}

function convertWindSpeed(windSpeedMS) {
  return windSpeedMS * 2.23694;
}

function createSeparator() {
  const separator = document.createElement('hr')
  return separator;
}

let searchedCities = [];

function createSearchHistoryButtons(event) {
  event.preventDefault()
  const city = searchBar.value.trim(); // Trim to remove leading and trailing whitespaces

  if (searchedCities.includes(city)) {
    // City already in the search history, do not repeat
    return;
  }
  searchedCities.push(city);
  localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
  const separator = createSeparator();

  const searchHistoryButtons = document.createElement('button');
  searchHistoryButtons.textContent = searchBar.value;

  searchHistoryButtons.addEventListener('click', convertCity)

  citiesButtons.appendChild(separator);  // Append separator before the button
  citiesButtons.appendChild(searchHistoryButtons);

  searchHistoryButtons.addEventListener('click', function () {
    convertCity()
  });
}

document.addEventListener('DOMContentLoaded', function () {
  let storedCities = localStorage.getItem('searchedCities');
  if (storedCities) {
    searchedCities = JSON.parse(storedCities);
    // Add buttons for each city in the search history
    searchedCities.forEach(function (city) {
      const separator = createSeparator();
      const searchHistoryButtons = document.createElement('button');
      searchHistoryButtons.textContent = city;

      citiesButtons.appendChild(separator);
      citiesButtons.appendChild(searchHistoryButtons);

      searchHistoryButtons.addEventListener('click', function () {
        convertCity()
      });
    });
  }
});

