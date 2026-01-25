const User = require('../models/userModel');
const cloudinary = require('../config/cloudinary');

const uploadImage = async (file) => {
       if (!file) return null;
       const result = await cloudinary.uploader.upload(file.path);
       return { url: result.secure_url, public_id: result.public_id };
};

exports.createUser = async (req, res) => {
       try {
              const { name, location, stylePreferences } = req.body;

              // Handle stylePreferences: it might be a string (from form-data) or array
              let styles = [];
              if (stylePreferences) {
                     styles = Array.isArray(stylePreferences)
                            ? stylePreferences
                            : stylePreferences.split(',').map(s => s.trim());
              }

              // Handle single image upload. User routes typically use upload.single('profilePicture') or similar.
              // If it's an array from multer (files), we take the first one.
              const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
              const profilePicture = await uploadImage(file);

              const user = new User({
                     name,
                     location,
                     stylePreferences: styles,
                     profilePicture
              });

              await user.save();
              res.status(201).json(user);
       } catch (error) {
              res.status(500).json({ error: error.message });
       }
};

