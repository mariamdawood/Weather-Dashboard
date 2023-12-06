const apiKey = '910cdcb0016aef6dbea4901757de5da6';

const formattedDate = dayjs().format('MMMM D, YYYY');

const searchBar = document.querySelector('#search-input')
const searchButton = document.querySelector('#search-button')

const daysForecast = document.querySelector('.days-forecast')
const details = document.querySelector('.details');
const weatherCards = document.querySelector('#weather-cards')
const citiesButtons = document.querySelector('#cities-buttons')

function convertCity(event) {
  event.preventDefault()

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
      createSearchHistoryButtons(data)
    })
    .catch(error => {
      // Handle errors
      console.error('Fetch error:', error);
    });
}

searchButton.addEventListener('click', convertCity)

function createCurrent(data) {

  details.innerHTML = ""

  const currentWeather = document.createElement('div')
  currentWeather.classList = 'details'

  const currentDate = formattedDate;

  const currentCityAndDate = `${data.city.name} ( ${currentDate} )`;

  const current = document.createElement('h2')
  current.textContent = currentCityAndDate
  currentWeather.appendChild(current)

  const currentIcon = document.createElement('img')
  currentIcon.src = `https://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png`;
  currentWeather.appendChild(currentIcon)

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
  daysForecast.innerHTML = '';
  weatherCards.innerHTML = '';

  const header = document.createElement('h2');
  header.textContent = '5-Day Forecast';
  daysForecast.appendChild(header);

  const cardsNumber = Math.min(data.list.length, 5);

  for (let index = 0; index < cardsNumber; index++) {

    
    const listItem = document.createElement('li')
    listItem.classList = 'card'
    
    const date = formattedDate; 

    const cityAndDateinfo = `${data.city.name} ${date}`

    const cityAndDate = document.createElement('h3')
    cityAndDate.textContent = cityAndDateinfo
    listItem.appendChild(cityAndDate)

    const icon = document.createElement('img')
    icon.src = `https://openweathermap.org/img/w/${data.list[index].weather[0].icon}.png`;
    listItem.appendChild(icon)

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

function createSearchHistoryButtons(data) {

  const city = `${data.city.name}`
  const searchHistoryButtons = document.createElement('button');
  searchHistoryButtons.textContent = city;

  // Check if a button with the same city name already exists
  const existingButton = Array.from(citiesButtons.children).find(button => button.textContent === city);

  if (existingButton) {
    // If button already exists, return or perform any other desired action
    return;
  }

  const separator = createSeparator();

  citiesButtons.appendChild(separator);
  citiesButtons.appendChild(searchHistoryButtons);

  searchHistoryButtons.addEventListener('click', function (event) {
    event.preventDefault()
    const storedDataJSON = localStorage.getItem(city);

    // Parse the JSON string to get the stored data object
    const storedData = JSON.parse(storedDataJSON);

    if (storedData) {
      createCurrent(data);
      createCards(data);
    }
  })

  const storedObject = {
    city,
    data
  };

  const storedObjectJSON = JSON.stringify(storedObject);
  localStorage.setItem(city, storedObjectJSON);


}

// Function to load search history from local storage and create buttons
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

// Call the function when the page loads
window.addEventListener('load', loadSearchHistory);