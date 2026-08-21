const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const API_KEY = process.env.OPENWEATHER_API_KEY || '';

// Keep an in-memory session history of fetched weather data to show trend charts
const sessionWeatherHistory = [];

// Helper to generate dynamic simulated Lagos weather if API fails or demo key is used
function getSimulatedLagosWeather() {
  const hour = new Date().getHours();
  // Lagos is hot and tropical. Temp ranges between 24C (night) and 33C (daytime)
  let baseTemp = 28;
  if (hour >= 11 && hour <= 16) {
    baseTemp = 32 + (Math.random() * 2 - 1); // 31 to 33
  } else if (hour >= 20 || hour <= 5) {
    baseTemp = 25 + (Math.random() * 1.5 - 0.75); // 24.25 to 25.75
  } else {
    baseTemp = 28 + (Math.random() * 2 - 1); // 27 to 29
  }

  // Pick realistic conditions based on hour and season
  const conditions = [
    { main: "Clouds", description: "scattered clouds", icon: "03d", humidity: 78, wind: 4.1 },
    { main: "Rain", description: "light tropical rain", icon: "10d", humidity: 88, wind: 5.5 },
    { main: "Clear", description: "clear sky", icon: "01d", humidity: 65, wind: 3.1 },
    { main: "Haze", description: "dusty harmattan haze", icon: "50d", humidity: 55, wind: 2.8 }
  ];
  
  // Choose one based on minute interval or randomized
  const index = Math.floor(Math.random() * conditions.length);
  const selected = conditions[index];

  return {
    isDemo: true,
    coord: { lon: 3.3947, lat: 6.4550 },
    weather: [
      {
        id: selected.main === 'Rain' ? 500 : (selected.main === 'Clouds' ? 802 : 800),
        main: selected.main,
        description: selected.description,
        icon: selected.icon
      }
    ],
    main: {
      temp: parseFloat(baseTemp.toFixed(1)),
      feels_like: parseFloat((baseTemp + 2).toFixed(1)),
      temp_min: parseFloat((baseTemp - 2).toFixed(1)),
      temp_max: parseFloat((baseTemp + 2).toFixed(1)),
      pressure: 1011 + Math.floor(Math.random() * 4),
      humidity: selected.humidity
    },
    visibility: 8000,
    wind: { speed: parseFloat(selected.wind.toFixed(1)), deg: 210 },
    clouds: { all: 40 },
    dt: Math.floor(Date.now() / 1000),
    sys: {
      country: "NG",
      sunrise: Math.floor(Date.now() / 1000) - 14400, // Roughly 4 hrs ago
      sunset: Math.floor(Date.now() / 1000) + 28800 // Roughly 8 hrs from now
    },
    name: "Lagos"
  };
}

// Helper to generate dynamic 5-day forecast for simulated mode
function getSimulatedLagosForecast() {
  const list = [];
  const startDt = Math.floor(Date.now() / 1000);
  const conditions = [
    { main: "Rain", description: "moderate rain", icon: "10d" },
    { main: "Clouds", description: "broken clouds", icon: "04d" },
    { main: "Clear", description: "sunny sky", icon: "01d" },
    { main: "Clouds", description: "few clouds", icon: "02d" }
  ];

  for (let i = 0; i < 5; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + i);
    
    list.push({
      dt: startDt + (i * 86400),
      main: {
        temp: parseFloat((27 + Math.sin(i) * 3 + Math.random()).toFixed(1)),
        feels_like: parseFloat((29 + Math.sin(i) * 3).toFixed(1)),
        temp_min: 24,
        temp_max: 33,
        pressure: 1012,
        humidity: 75 + Math.floor(Math.random() * 15)
      },
      weather: [
        conditions[i % conditions.length]
      ],
      wind: { speed: 3.5 },
      dt_txt: targetDate.toISOString().split('T')[0] + " 12:00:00"
    });
  }

  return { isDemo: true, list };
}

// 1. Live Weather endpoint (Lagos, Nigeria)
app.get('/api/weather', async (req, res) => {
  try {
    if (!API_KEY || API_KEY === 'fakekeyjustfordemo' || API_KEY.startsWith('your_')) {
      // Return simulated data if key is fake/missing
      const demoData = getSimulatedLagosWeather();
      // Track this reading in session history
      saveToHistory(demoData);
      return res.json(demoData);
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: 'Lagos,NG',
        units: 'metric',
        appid: API_KEY
      }
    });

    const realData = { ...response.data, isDemo: false };
    saveToHistory(realData);
    res.json(realData);
  } catch (error) {
    console.error('Error fetching weather:', error.message);
    // Fallback to beautiful simulated data so the app doesn't break
    const demoData = getSimulatedLagosWeather();
    demoData.errorText = `Using simulated mode because: ${error.response?.data?.message || error.message}`;
    saveToHistory(demoData);
    res.json(demoData);
  }
});

// 2. 5-day Forecast endpoint
app.get('/api/forecast', async (req, res) => {
  try {
    if (!API_KEY || API_KEY === 'fakekeyjustfordemo' || API_KEY.startsWith('your_')) {
      return res.json(getSimulatedLagosForecast());
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        q: 'Lagos,NG',
        units: 'metric',
        appid: API_KEY
      }
    });

    // Extract one forecast per day (typically 12:00:00 forecasts)
    const filteredList = response.data.list.filter(item => item.dt_txt.includes('12:00:00'));
    // If empty, just grab every 8th slot (approx daily)
    const listToReturn = filteredList.length > 0 ? filteredList : response.data.list.filter((_, idx) => idx % 8 === 0);

    res.json({
      isDemo: false,
      list: listToReturn
    });
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    res.json(getSimulatedLagosForecast());
  }
});

// 3. Endpoint for session logs (keeps track of dynamic adjustments during runtime)
app.get('/api/session-history', (req, res) => {
  res.json(sessionWeatherHistory);
});

// 4. Manual update tracker clear
app.post('/api/session-history/reset', (req, res) => {
  sessionWeatherHistory.length = 0;
  res.json({ message: "History cleared successfully", history: [] });
});

function saveToHistory(data) {
  const record = {
    timestamp: new Date().toLocaleTimeString(),
    temp: data.main.temp,
    humidity: data.main.humidity,
    condition: data.weather[0].main,
    isDemo: data.isDemo
  };
  // Store up to last 10 entries
  sessionWeatherHistory.push(record);
  if (sessionWeatherHistory.length > 10) {
    sessionWeatherHistory.shift();
  }
}

app.listen(PORT, () => {
  console.log(`Lagos Weather Server running on http://localhost:${PORT}`);
});
