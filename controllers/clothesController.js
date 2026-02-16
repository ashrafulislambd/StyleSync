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
          const { name, category, color, season, occasion, wearCount, status, user } = req.body;
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
               status: status || 'active',
               user
          });

          await clothes.save();
          res.status(201).json(clothes);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

exports.getAllClothes = async (req, res) => {
     try {
          const { userId } = req.query;
          const filter = userId ? { user: userId } : {};
          const clothes = await Clothes.find(filter).populate('user', 'name location');
          res.json(clothes);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

exports.getClothesById = async (req, res) => {
     try {
          const clothes = await Clothes.findById(req.params.id).populate('user', 'name location');
          if (!clothes) return res.status(404).json({ error: 'Clothes not found' });
          res.json(clothes);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

exports.updateClothes = async (req, res) => {
     try {
          const { name, category, color, season, occasion, wearCount, status } = req.body;
          const updateData = {};

          if (name) updateData.name = name;
          if (category) updateData.category = category;
          if (color) updateData.color = color;
          if (wearCount !== undefined) updateData.wearCount = wearCount;
          if (status) updateData.status = status;

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

          if (season) updateData.season = parseArray(season);
          if (occasion) updateData.occasion = parseArray(occasion);

          // Handle image updates
          if (req.files && req.files.length > 0) {
               // Delete old images from cloudinary
               const clothes = await Clothes.findById(req.params.id);
               if (clothes && clothes.images && clothes.images.length > 0) {
                    for (const img of clothes.images) {
                         if (img.public_id) {
                              await cloudinary.uploader.destroy(img.public_id);
                         }
                    }
               }
               updateData.images = await uploadImages(req.files);
          }

          const clothes = await Clothes.findByIdAndUpdate(req.params.id, updateData, { new: true });
          if (!clothes) return res.status(404).json({ error: 'Clothes not found' });
          res.json(clothes);
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};

exports.deleteClothes = async (req, res) => {
     try {
          const clothes = await Clothes.findById(req.params.id);
          if (!clothes) return res.status(404).json({ error: 'Clothes not found' });

          // Delete images from cloudinary
          if (clothes.images && clothes.images.length > 0) {
               for (const img of clothes.images) {
                    if (img.public_id) {
                         await cloudinary.uploader.destroy(img.public_id);
                    }
               }
          }

          await Clothes.findByIdAndDelete(req.params.id);
          res.json({ message: 'Clothes deleted successfully' });
     } catch (error) {
          res.status(500).json({ error: error.message });
     }
};
