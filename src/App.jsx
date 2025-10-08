import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("Colombo");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("weatherFavorites")) || []
  );

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async (searchCity = city) => {
    setLoading(true);
    setError(null);
    const apiKey = "90840a9c8c1c58f97e278b5308e268b5";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${apiKey}&units=metric`;
    
    try {
      const res = await fetch(url);
      const weatherData = await res.json();
      
      if (weatherData.cod === 200) {
        setData(weatherData);
        setError(null);
      } else {
        setError("City not found. Please check the spelling and try again.");
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError("Failed to fetch weather data. Please check your internet connection.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (city.trim()) {
      fetchWeather(city.trim());
    }
  };

  const addToFavorites = () => {
    if (data && !favorites.includes(data.name)) {
      const newFavorites = [...favorites, data.name];
      setFavorites(newFavorites);
      localStorage.setItem("weatherFavorites", JSON.stringify(newFavorites));
    }
  };

  const removeFromFavorites = (cityName) => {
    const newFavorites = favorites.filter(fav => fav !== cityName);
    setFavorites(newFavorites);
    localStorage.setItem("weatherFavorites", JSON.stringify(newFavorites));
  };

  const loadFavoriteCity = (cityName) => {
    setCity(cityName);
    fetchWeather(cityName);
  };

  const getWeatherIcon = (weatherCode, description) => {
    const iconMap = {
      "clear sky": "☀️",
      "few clouds": "🌤️",
      "scattered clouds": "⛅",
      "broken clouds": "☁️",
      "overcast clouds": "☁️",
      "shower rain": "🌦️",
      "rain": "🌧️",
      "thunderstorm": "⛈️",
      "snow": "❄️",
      "mist": "🌫️",
      "fog": "🌫️"
    };
    
    return iconMap[description.toLowerCase()] || "🌤️";
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🌤️ Weather App</h1>
          <p className="subtitle">Get current weather information for any city</p>
        </header>

        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
              disabled={loading}
            />
            <button 
              onClick={handleSearch} 
              className="search-btn"
              disabled={loading || !city.trim()}
            >
              {loading ? "🔄" : "🔍"}
            </button>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="favorites-section">
            <h3>📌 Favorite Cities</h3>
            <div className="favorites-list">
              {favorites.map((favCity, index) => (
                <div key={index} className="favorite-item">
                  <button 
                    onClick={() => loadFavoriteCity(favCity)}
                    className="favorite-btn"
                  >
                    {favCity}
                  </button>
                  <button 
                    onClick={() => removeFromFavorites(favCity)}
                    className="remove-btn"
                    title="Remove from favorites"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="content">
          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading weather data...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>❌ {error}</p>
            </div>
          )}

          {data && data.main && !loading && (
            <div className="weather-card">
              <div className="weather-header">
                <div className="city-info">
                  <h2>{data.name}, {data.sys.country}</h2>
                  <p className="time">Updated at {getCurrentTime()}</p>
                </div>
                <button 
                  onClick={addToFavorites}
                  className="favorite-add-btn"
                  disabled={favorites.includes(data.name)}
                  title={favorites.includes(data.name) ? "Already in favorites" : "Add to favorites"}
                >
                  {favorites.includes(data.name) ? "⭐" : "☆"}
                </button>
              </div>

              <div className="weather-main">
                <div className="temperature-section">
                  <div className="weather-icon">
                    {getWeatherIcon(data.weather[0].id, data.weather[0].description)}
                  </div>
                  <div className="temperature">
                    <span className="temp-main">{Math.round(data.main.temp)}°</span>
                    <span className="temp-unit">C</span>
                  </div>
                </div>
                
                <div className="weather-description">
                  <p className="condition">{data.weather[0].description}</p>
                  <p className="feels-like">Feels like {Math.round(data.main.feels_like)}°C</p>
                </div>
              </div>

              <div className="weather-details">
                <div className="detail-item">
                  <span className="detail-icon">💧</span>
                  <span className="detail-label">Humidity</span>
                  <span className="detail-value">{data.main.humidity}%</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">💨</span>
                  <span className="detail-label">Wind Speed</span>
                  <span className="detail-value">{data.wind.speed} m/s</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">👁️</span>
                  <span className="detail-label">Visibility</span>
                  <span className="detail-value">{(data.visibility / 1000).toFixed(1)} km</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">🌡️</span>
                  <span className="detail-label">Pressure</span>
                  <span className="detail-value">{data.main.pressure} hPa</span>
                </div>

                <div className="detail-item">
                  <span className="detail-icon">🌅</span>
                  <span className="detail-label">Sunrise</span>
                  <span className="detail-value">
                    {new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">🌇</span>
                  <span className="detail-label">Sunset</span>
                  <span className="detail-value">
                    {new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="temperature-range">
                <div className="temp-range-item">
                  <span className="temp-label">Min</span>
                  <span className="temp-value">{Math.round(data.main.temp_min)}°C</span>
                </div>
                <div className="temp-range-item">
                  <span className="temp-label">Max</span>
                  <span className="temp-value">{Math.round(data.main.temp_max)}°C</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
