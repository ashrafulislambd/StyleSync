const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    addAccessory,
    getAllAccessories,
    getAccessoryById,
    updateAccessory,
    deleteAccessory
} = require('../controllers/accessoriesController');

router.post('/', upload.single('image'), addAccessory);
router.get('/', getAllAccessories);
router.get('/:id', getAccessoryById);
router.put('/:id', upload.single('image'), updateAccessory);
router.delete('/:id', deleteAccessory);

module.exports = router;
