const Weather = require('../models/weatherModel');
const weatherService = require('../utils/weatherService');

exports.addWeather = async (req, res) => {
    try {
        const { location, conditions, date } = req.body;
        const weather = new Weather({
            location, conditions, date
        });

        await weather.save();
        res.status(201).json(weather);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.fetchWeather = async (req, res) => {
    try {
        const { location } = req.params;
        if (!location) {
            return res.status(400).json({ error: 'Location is required' });
        }

        const weather = await weatherService.getWeather(location);
        res.json(weather);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getWeather = async (req, res) => {
    try {
        const { location } = req.query;
        const filter = location ? { location: new RegExp(location, 'i') } : {};
        const weather = await Weather.find(filter).sort({ date: -1 }).limit(10);
        res.json(weather);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
