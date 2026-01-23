const Clothes = require('../models/clothesModel');
const cloudinary = require('../config/cloudinary');

const uploadImages = async (files) => {
     if (!files || files.length === 0) return [];
     const images = [];
     for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path);
          images.push({ url: result.secure_url, public_id: result.public_id });
     }
     return images;
};

exports.addClothes = async (req, res) => {
     try {
          const { name, category, color, season, occasion, wearCount, status } = req.body;
          const images = await uploadImages(req.files);

          // Helper to parse potential JSON string or return as is
          const parseArray = (field) => {
               if (typeof field === 'string') {
                    try {
                         return JSON.parse(field);
                    } catch {
                         return field.split(',').map(s => s.trim());
                    }
               }
               return field;
          };

          const clothes = new Clothes({
               name,
               category,
               color,
               season: parseArray(season),
               occasion: parseArray(occasion),
               images,
               wearCount: wearCount || 0,
               status: status || 'active'
          });

          await clothes.save();
          res.status(201).json(clothes);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

