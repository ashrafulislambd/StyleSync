const express = require('express');
const router = express.Router();
const {
    addWeather,
    fetchWeather,
    getWeather
} = require('../controllers/weatherController');

router.post('/', addWeather);
router.get('/fetch/:location', fetchWeather);
router.get('/', getWeather);

module.exports = router;
