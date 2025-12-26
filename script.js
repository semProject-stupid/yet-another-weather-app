//element selectors
const locationDiv = document.getElementById("location");
const search = document.getElementById("search");
const searchDiv = document.getElementById("search-div");
const resultsDiv = document.getElementById("results-div");
const resultsLink = document.getElementById("results-link");
const allInfo = document.getElementById("all-info");
const temperature = document.getElementById("temperature");
const celsius = document.getElementById("celsius");
const fahren = document.getElementById("fahren");
const precipitation = document.getElementById("precipitation");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const locationName = document.getElementById("location-name");
const dayDiv = document.getElementById("day");
const description = document.getElementById("weather-desc");
const weekInfo = document.getElementById("week-info");
const cancel = document.getElementById("cancel");
const weatherIcon = document.getElementById("weather-icon");
const landingDiv = document.getElementById("landing-div");
const invalidDiv = document.getElementById("invalid-div");
const chartWrapper = document.getElementById("chart-wrapper");

//event listeners
search.addEventListener("click", () => searchFunction());
locationDiv.addEventListener("keydown", (event) => {
    if (event.code == 'Enter') { searchFunction(); }
})
celsius.addEventListener("click", () => convertTemp("c"));
fahren.addEventListener("click", () => convertTemp("f"));
cancel.addEventListener("click", () => cancelFunction());
resultsLink.addEventListener("click", () => {
    locationDiv.focus();
    locationDiv.scrollIntoView();
});
//variables
let defaultTemp;  //default -> fahrenheit
let defaultWind;  //default -> mph
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

//functions
async function getData() {
    let location = locationDiv.value;
    if (location == undefined) {
        return console.log("enter a location!");
    }
    const newUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=2Q9L634H2EN7EKYPLQV8MVZ4U`;
    try {
        const res = await fetch(newUrl);
        if (!res.ok) {
            //here
            console.log("enter a valid location!");
            invalidLocationFunction();
            return console.log("error with response: ", res.status);
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.log("error is: ", err);
    }
}

async function setData() {
    try {
        landingDiv.style.display = 'none';
        const data = await getData();
        setCurrentData(data, 0);
        //setHourlyTemp(data);
        setWeeklyTemp(data);
    } catch (err) {
        console.log("Error in setting data: ", err);
    }
}

async function setCurrentData(data, currentDay) {
    try {
        //const data = await getData();
        invalidDiv.style.display = 'none';
        searchDiv.style.marginTop = '25px';
        resultsDiv.style.display = 'flex';
        allInfo.style.display = 'flex';
        setWeatherIconHelper(data.days[currentDay].conditions, weatherIcon);
        defaultTemp = temperature.innerHTML = (data.days[currentDay].temp).toFixed(2);
        fahren.style.color = "#e8eaed";
        celsius.style.color = "#e8eaed5d";
        setCurrentDataHelper(data.days[currentDay].precip, precipitation, "Precipitation", "%");
        setCurrentDataHelper(data.days[currentDay].humidity, humidity, "Humidity", "%");
        defaultWind = data.days[currentDay].windspeed;
        setCurrentDataHelper(data.days[currentDay].windspeed, wind, "Wind", "mph");
        //locationName.innerHTML = locationDiv.value[0].toUpperCase() + locationDiv.value.substring(1, location.length).toLowerCase();
        locationName.innerHTML = data.resolvedAddress[0].toUpperCase() + data.resolvedAddress.substring(1, location.length).toLowerCase();
        description.innerHTML = data.days[currentDay].conditions;
        const date = new Date(`${data.days[currentDay].datetime}T00:00:00`);
        dayDiv.innerHTML = days[date.getDay()];
        setHourlyTemp(data, currentDay);
    } catch (err) {
        invalidLocationFunction();
        console.log("error setting current data: ", err); //here
    }
}
function setCurrentDataHelper(data, divName, divText, divUnit) {
    if (data == null || data == undefined) { data = "0"; }
    divName.innerHTML = `${divText}: ${data}${divUnit}`;
}

function convertTemp(state) {
    if (state.toLowerCase() == "c") {
        let temp = Number(defaultTemp);
        let convertedTemp = (temp - 32) * 5 / 9;
        celsius.style.color = "#e8eaed";
        fahren.style.color = "#e8eaed5d";
        temperature.innerHTML = convertedTemp.toFixed(2);
        convertWind(state);
    }
    else if (state.toLowerCase() == "f") {
        temperature.innerHTML = defaultTemp;
        fahren.style.color = "#e8eaed";
        celsius.style.color = "#e8eaed5d";
        convertWind(state);
    }
}

function convertWind(state) {
    if (state.toLowerCase() == "c") {
        //change to kmh
        let windVal = Number(defaultWind);
        let convertedWind = windVal * 1.60934;
        wind.innerHTML = `Wind: ${convertedWind.toFixed(1)} kmh`;
    }
    else if (state.toLowerCase() == "f") {
        //change to mph
        wind.innerHTML = `Wind: ${defaultWind} mph`;
    }
}

//chart code and associated functions
let xValues = [];
let yValues = [];
const hourValues = ["12am", "1am", "2am", "3am", "4am", "5am", "6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"];
async function setHourlyTemp(data, currentDay) {
    try {
        //const data = await getData();
        xValues = [];
        yValues = [];
        //change to 23
        for (let i = 0; i <= 23; i++) {
            yValues.push((data.days[currentDay].hours[i].temp));
            xValues.push(hourValues[i]);
        }
        createChart();
        //console.log("Data: ", data); 
    }
    catch (err) {
        console.log("Error: ", err);
    }
}

//---- Chart code from w3 schools, Chart.js, Line Charts + gpt5 assist ---- //
function createChart() {
    new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [{
                data: yValues,
                fill: 'origin',                 // fill to x-axis
                lineTension: 0,
                borderColor: "#f5c60cff",         // line color
                backgroundColor: "#4c4219c4",     // solid fill color
                borderWidth: 4,
                pointRadius: 2,
                pointHoverRadius: 10
            }]
        },
        options: {
            legend: { display: false },
            scales: {
                xAxes: [{
                    display: false,
                    gridLines: { display: false },
                    offset: true
                }],
                yAxes: [{
                    display: false,
                    gridLines: { display: false },
                    ticks: {
                        min: 0,
                        max: 100,
                        stepSize: 0.1
                    }
                }]
            }
        }
    });
}


function searchFunction() {
    if (locationDiv.value != null && locationDiv.value != undefined) {
        setData();
    } else {
        console.log("Enter a valid location!")
    }
}

async function setWeeklyTemp(data) {
    try {
        //const data = await getData();
        weekInfo.innerHTML = '';
        weekInfo.style.display = 'flex';
        chartWrapper.style.display = 'flex';
        for (let i = 0; i <= 7; i++) {
            //creating divs
            const weekDiv = createElHelper("div", "week-div");
            const dayName = createElHelper("div", "day-name");
            const dayImg = createElHelper("img", "weather-icon-img");
            const dayTemp = createElHelper("div", "day-temp");
            //setting divs
            const date = new Date(`${data.days[i].datetime}T00:00:00`);
            dayName.innerHTML = days[date.getDay()].substring(0, 3);
            setWeatherIconHelper(data.days[i].conditions, dayImg);
            dayImg.style.width = '40px';
            dayTemp.innerHTML = `${data.days[i].temp}°`;

            //appending

            weekDiv.appendChild(dayName);
            weekDiv.appendChild(dayImg);
            weekDiv.appendChild(dayTemp);
            weekDiv.addEventListener("click", () => updateCurrentData(data, i));
            weekInfo.appendChild(weekDiv);
        }

    }
    catch (err) {
        invalidLocationFunction();
        console.log("Error setting weekly temp: ", err); //here
    }
}

function createElHelper(type, classVal) {
    const el = document.createElement(type);
    el.className = classVal;
    return el;
}

function updateCurrentData(data, i) {
    const weekInfoChildren = document.getElementById("week-info").children;
    for (let j = 0; j < weekInfoChildren.length; j++) {
        weekInfoChildren[j].style.backgroundColor = "#1f1f1f";
    }
    weekInfoChildren[i].style.backgroundColor = "#303134";
    setCurrentData(data, i);
}

function cancelFunction() {
    locationDiv.value = "";
}

const weatherIconsObject = {
    0: { condition: 'clear day', svg: 'clear-day' },
    1: { condition: 'clear night', svg: 'clear-night' },
    2: { condition: 'mostly clear day', svg: 'clear-day' },
    3: { condition: 'mostly clear night', svg: 'clear-night' },
    4: { condition: 'partly cloudy day', svg: 'partly-cloudy-day' },
    5: { condition: 'partly cloudy night', svg: 'partly-cloudy-night' },
    6: { condition: 'cloudy', svg: 'cloudy' },
    7: { condition: 'overcast', svg: 'overcast' },
    8: { condition: 'drizzle', svg: 'drizzle' },
    9: { condition: 'rain', svg: 'rain' },
    10: { condition: 'sleet', svg: 'sleet' },
    11: { condition: 'snow', svg: 'snow' },
    12: { condition: 'hail', svg: 'hail' },
    13: { condition: 'smoke', svg: 'smoke' },
    14: { condition: 'partly cloudy day with rain', svg: 'partly-cloudy-day-rain' },
    15: { condition: 'Snow, Partially cloudy', svg: 'partly-cloudy-day-snow' },
    16: { condition: 'Snow, Rain, Partially cloudy', svg: 'partly-cloudy-day-sleet' },
    17: { condition: 'partly cloudy day with drizzle', svg: 'partly-cloudy-day-drizzle' },
    18: { condition: 'partly cloudy day with hail', svg: 'partly-cloudy-day-hail' },
    19: { condition: 'partially cloudy', svg: 'cloudy' },
};

function setWeatherIconHelper(desc, divName) {
    const source = setWeatherIcon(desc);
    divName.src = source;
}
function setWeatherIcon(desc) {
    let tempsrc = `https://bmcdn.nl/assets/weather-icons/v2.0/line/clear-day.svg`;
    for (let i = 0; i <= 19; i++) {
        let tempCondition = weatherIconsObject[i].condition;
        if (tempCondition.toLowerCase() == desc.toLowerCase()) {
            return `https://bmcdn.nl/assets/weather-icons/v2.0/line/${weatherIconsObject[i].svg}.svg`;
        }
        else if (tempCondition.toLowerCase().includes(desc.toLowerCase())) {
            tempsrc = `https://bmcdn.nl/assets/weather-icons/v2.0/line/${weatherIconsObject[i].svg}.svg`;
        }
        else if (desc.toLowerCase().includes(tempCondition.toLowerCase())) {
            tempsrc = `https://bmcdn.nl/assets/weather-icons/v2.0/line/${weatherIconsObject[i].svg}.svg`;
        }
    }
    return tempsrc;
}

function invalidLocationFunction() {
    searchDiv.style.marginTop = '10%';
    allInfo.style.display = 'none';
    resultsDiv.style.display = 'none';
    weekInfo.style.display =  'none';
    chartWrapper.style.display = 'none';
    invalidDiv.style.display = 'flex';
}