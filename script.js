let reop = {
    method: 'GET'
};

/////////////////////               Dark mode light mode            //////////////////////////


const darkModeSwitch = document.getElementById('darkModeSwitch');
const bodyElement = document.body;


// Initial check for checkbox state and set background color accordingly
// let isDarkMode = darkModeSwitch.checked; // Get initial checkbox state
// bodyElement.classList.toggle('dark-mode', isDarkMode); // Apply dark mode class if checked initially

// darkModeSwitch.addEventListener('change', function () {
//     bodyElement.classList.toggle('dark-mode');
// });



////////////////////////             Search function                  ///////////////////



// Get references to form elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('search');
const searchButton = document.getElementById('btn');
const locationElement = document.querySelector('.Location'); 


const handleSearch = () => {

    
    const searchQuery = searchInput.value; 
    fetchFutureForecast(searchQuery);
    fetchFutureForecastDays(searchQuery);
    fetchPastForecastDays(searchQuery);

    
    const apiKey = "8a17df1676e44c77afe25134240703";

    
    let apiUrl;
    if (searchQuery) {
        apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${searchQuery}&days=1&aqi=no&alerts=no`, reop;
    } else {
        
        apiUrl = null; 
    }

    
    const displayWeatherInfo = (data) => {
        const location = data.location.name;
        const temp = data.current.temp_c;
        const feelsLike = data.current.feelslike_c;
        const Forecast = data.forecast.forecastday[0].day.maxtemp_c;
        const windSpeed = data.current.wind_kph;
        const windDir = data.current.wind_dir; 
        const weatherIcon = data.current.condition.icon; 

        locationElement.textContent = `Weather in ${location}`;
        currentMap(location);

        const currentTempElement = document.getElementById('nowWeather');
        currentTempElement.textContent = `${temp} °C`;

        const feelsLikeElement = document.querySelector('.feellike'); 
        feelsLikeElement.textContent = `Feels Like: ${feelsLike} °C`;

        const forecastElement = document.getElementById('forcastS');
        forecastElement.textContent = `Forecast: ${Forecast} °C`; 

        const windElement = document.querySelector('.wind'); 

        if (windElement) { 
            windElement.textContent = `Wind: ${windSpeed} km/h From ${windDir}`; 
        } else {
            console.error("Wind element with class 'wind' not found!"); 
        }

        const iconUrl = `https:${weatherIcon}`;
        const tempIconElement = document.getElementById('tempIcon');
        tempIconElement.src = iconUrl;
        tempIconElement.alt = `Weather icon for ${location}`;

    };


    if (apiUrl) {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => displayWeatherInfo(data))
            .catch(error => console.error(error));
    } else {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`, reop;

                fetch(apiUrl)
                    .then(response => response.json())
                    .then(data => displayWeatherInfo(data))
                    .catch(error => console.error(error));
            }, error => console.error(error));
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }
};

searchButton.addEventListener('click', handleSearch);


handleSearch();




/////////////////////              current date             ////////////////////////////



const currentDateElement = document.querySelector('.currentDate');

const today = new Date();
const day = today.getDate();
const month = today.getMonth(); 
const year = today.getFullYear();

const formattedDate = `${day}${getOrdinalSuffix(day)} of ${getMonthName(month)} ${year}`; 
currentDateElement.textContent = formattedDate;

function getOrdinalSuffix(day) {
    const suffixes = ["st", "nd", "rd", "th"];
    const remainder = day % 100;
    return (day <= 20 && day >= 10) ? "th" : suffixes[remainder % 10];
}

function getMonthName(month) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    return monthNames[month];
}


///////////////////     Clock               ////////////////


const hourEl = document.getElementById("hour");
const minutesEl = document.getElementById("minutes");
const secondEl = document.getElementById("seconds");
const ampmEl = document.getElementById("ampm");

function updateClock() {
    let h = new Date().getHours()
    let m = new Date().getMinutes()
    let s = new Date().getSeconds()
    let ampm = "AM"

    if (h > 12) {
        h = h - 12
        ampm = "PM"
    }
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    hourEl.innerHTML = h;
    minutesEl.innerText = m;
    secondEl.innerText = s;
    ampmEl.innerText = ampm;
    setTimeout(() => {
        updateClock()
    }, 1000)
}

updateClock();




//////////////////////////            Upcoming 5 hours and temp               ////////////////////////


fetchFutureForecast("Galle");
function fetchFutureForecast(location) {
    const startDate = new Date();
    let currentDay = new Date(startDate);
    const timeIncrement = 1.5; // Adjust time increment (in hours)

    for (let i = 0; i < 6; i++) {
        const formattedDate = currentDay.toISOString().split('T')[0];

        // Increment time for each API call
        currentDay.setHours(currentDay.getHours() + timeIncrement);
        const formattedTime = currentDay.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Format the time (e.g., "15:35")


        fetch(`https://api.weatherapi.com/v1/forecast.json?key=8a17df1676e44c77afe25134240703&q=${location}&days=1&aqi=no&alerts=no&dt=${formattedDate}&time=${formattedTime}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById(`d${i + 1}`).innerHTML = formattedTime;
                document.getElementById(`img${i + 1}`).src = `https:${data.forecast.forecastday[0].hour[0].condition.icon}`;
                document.getElementById(`tem${i + 1}`).innerHTML = `${data.forecast.forecastday[0].hour[0].temp_c} °C`;

            })
            .catch(error => console.error('Error fetching future forecast:', error));

        currentDay.setDate(currentDay.getDate() + 1);
    }
}



//////////////////////           Future Forecast for 7 week           ////////////////////////////////////


fetchFutureForecastDays("Galle");
function fetchFutureForecastDays(location) {
    const startDate = new Date();

    for (let i = 0; i < 7; i++) { 
        const currentDay = new Date(startDate);
        currentDay.setDate(currentDay.getDate() + i);

        const formattedDate = currentDay.toLocaleDateString(); 

        fetch(`https://api.weatherapi.com/v1/forecast.json?key=8a17df1676e44c77afe25134240703&q=${location}&days=1&aqi=no&alerts=no&dt=${formattedDate}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById(`d1${i + 1}`).innerHTML = formattedDate; 
                document.getElementById(`img1${i + 1}`).src = `https:${data.forecast.forecastday[0].day.condition.icon}`;
                document.getElementById(`con1${i + 1}`).innerHTML = `${data.forecast.forecastday[0].day.condition.text}`;
                document.getElementById(`tem1${i + 1}`).innerHTML = `${data.forecast.forecastday[0].day.avgtemp_c} °C`;
                document.getElementById(`hum1${i + 1}`).innerHTML = `${data.forecast.forecastday[0].day.avghumidity} %`;
            })
            .catch(error => console.error('Error fetching future forecast:', error));
    }
}



//////////////////////           Past Forecast for 3 days           ////////////////////////////////////


fetchPastForecastDays("Galle");
function fetchPastForecastDays(location) {
    const startDate = new Date();

    for (let i = 3; i > 0; i--) { 
        const currentDay = new Date(startDate);
        currentDay.setDate(currentDay.getDate() - i);

        const formattedDate = currentDay.toLocaleDateString(); 

        fetch(`https://api.weatherapi.com/v1/history.json?key=8a17df1676e44c77afe25134240703&q=${location}&dt=${formattedDate}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById(`d2${i}`).innerHTML = formattedDate;
                document.getElementById(`img2${i}`).src = `https:${data.forecast.forecastday[0].day.condition.icon}`;
                document.getElementById(`con2${i}`).innerHTML = `${data.forecast.forecastday[0].day.condition.text}`;
                document.getElementById(`tem2${i}`).innerHTML = `${data.forecast.forecastday[0].day.avgtemp_c} °C`;
                document.getElementById(`hum2${i}`).innerHTML = `${data.forecast.forecastday[0].day.avghumidity} %`;
            })
            .catch(error => console.error('Error fetching future forecast:', error));
    }
}





//////////////////////                    Map                      ////////////////////////////////////


let map; // Declare a variable to hold the map instance

function initializeMap(latitude, longitude, pin) {
    if (!map) {
        map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else {
        map.setView([latitude, longitude], 13);
    }

    // Add a marker to the map
    L.marker([latitude, longitude]).addTo(map)
        .bindPopup(`Location: ${pin}`)
        .openPopup();
}

// Event listener for search button
document.getElementById("btn").addEventListener("click", async () => {
    try {
        const searchVal = document.getElementById("search").value;
        const { latitude, longitude } = await fetchLocationData(searchVal);
        initializeMap(latitude, longitude, searchVal);
    } catch (error) {
        console.error('Error during fetch:', error);
        // Handle errors
    }
});

async function currentMap(currentLocation) {
    try {
        const { latitude, longitude } = await fetchLocationData(currentLocation);
        initializeMap(latitude, longitude, currentLocation);
    } catch (error) {
        console.error('Error during fetch:', error);
        // Handle errors
    }
}

async function fetchLocationData(location) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=8a17df1676e44c77afe25134240703&q=${location}&days=1&aqi=no&alerts=no&}`);
        const data = await response.json();
        return { latitude: data.location.lat, longitude: data.location.lon };
    } catch (error) {
        console.error('Error fetching location data:', error);
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
}


function toggleTheme() {
    const theme = document.getElementById('darkmode-toggle').checked ? 'light' : 'dark';
    document.body.setAttribute("data-bs-theme", theme);
}
document.getElementById('theme').addEventListener('click', toggleTheme);