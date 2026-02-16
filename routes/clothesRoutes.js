const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    addClothes,
    getAllClothes,
    getClothesById,
    updateClothes,
    deleteClothes
} = require('../controllers/clothesController');

router.post('/', upload.array('images', 5), addClothes);
router.get('/', getAllClothes);
router.get('/:id', getClothesById);
router.put('/:id', upload.array('images', 5), updateClothes);
router.delete('/:id', deleteClothes);

module.exports = router;
