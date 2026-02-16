const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const {
    createUser,
    getUser,
    getAllUsers,
    updateUser
} = require('../controllers/userController');

router.post('/', upload.single('profilePicture'), createUser);
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', upload.single('profilePicture'), updateUser);

module.exports = router;
