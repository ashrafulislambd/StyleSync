const Accessories = require('../models/accessoriesModel');
const cloudinary = require('../config/cloudinary');

const uploadImage = async (file) => {
   if (!file) return null;
   const result = await cloudinary.uploader.upload(file.path);
   return { url: result.secure_url, public_id: result.public_id };
};

exports.addAccessory = async (req, res) => {
   try {
      const { name, type, color, compatibleWith, wearCount, status } = req.body;

      let compatibility = [];
      if (compatibleWith) {
         compatibility = Array.isArray(compatibleWith)
            ? compatibleWith
            : compatibleWith.split(',').map(s => s.trim());
      }

      const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
      const image = await uploadImage(file);

      const accessory = new Accessories({
         name,
         type,
         color,
         compatibleWith: compatibility,
         image,
         wearCount: wearCount || 0,
         status: status || 'active'
      });

      await accessory.save();
      res.status(201).json(accessory);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};
