const axios = require('axios');
const Weather = require('../models/weatherModel');

/**
 * Fetch weather data from OpenWeatherMap API
 * @param {string} location - City name or coordinates
 * @returns {object} Weather data with conditions mapped to internal enum
 */
const fetchWeatherFromAPI = async (location) => {
    try {
        const apiKey = process.env.WEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('Weather API key not configured');
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);

        // Map OpenWeatherMap conditions to our internal enum
        const temp = response.data.main.temp;
        const weatherMain = response.data.weather[0].main.toLowerCase();

        let conditions;
        if (temp < 15) {
            conditions = 'cold';
        } else if (temp > 30) {
            conditions = 'hot';
        } else if (weatherMain.includes('rain')) {
            conditions = 'rainy';
        } else if (weatherMain.includes('cloud')) {
            conditions = 'cloudy';
        } else {
            conditions = 'sunny';
        }

        return {
            location: response.data.name,
            conditions,
            temperature: temp,
            description: response.data.weather[0].description
        };
    } catch (error) {
        throw new Error(`Failed to fetch weather: ${error.message}`);
    }
};

/**
 * Get weather data with caching
 * Checks database first, fetches from API if not cached or outdated
 * @param {string} location - City name
 * @returns {object} Weather data
 */
const getWeather = async (location) => {
    try {
        // Check if we have recent weather data (within last 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        let weather = await Weather.findOne({
            location: new RegExp(location, 'i'),
            date: { $gte: thirtyMinutesAgo }
        }).sort({ date: -1 });

        if (weather) {
            return weather;
        }

        // Fetch fresh data from API
        const weatherData = await fetchWeatherFromAPI(location);

        // Save to database
        weather = new Weather({
            location: weatherData.location,
            conditions: weatherData.conditions,
            date: new Date()
        });

        await weather.save();
        return weather;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    fetchWeatherFromAPI,
    getWeather
};
