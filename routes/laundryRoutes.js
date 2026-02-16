const express = require('express');
const router = express.Router();
const {
    addLaundry,
    updateLaundry,
    getAllLaundry
} = require('../controllers/laundryController');

router.post('/', addLaundry);
router.get('/', getAllLaundry);
router.put('/:id', updateLaundry);

module.exports = router;
