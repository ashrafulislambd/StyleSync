const Accessories = require('../models/accessoriesModel');
const cloudinary = require('../config/cloudinary');

const uploadImage = async (file) => {
   if (!file) return null;
   const result = await cloudinary.uploader.upload(file.path);
   return { url: result.secure_url, public_id: result.public_id };
};

exports.addAccessory = async (req, res) => {
   try {
      const { name, type, color, compatibleWith, wearCount, status, user } = req.body;

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
         status: status || 'active',
         user
      });

      await accessory.save();
      res.status(201).json(accessory);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.getAllAccessories = async (req, res) => {
   try {
      const { userId } = req.query;
      const filter = userId ? { user: userId } : {};
      const accessories = await Accessories.find(filter).populate('user', 'name location');
      res.json(accessories);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.getAccessoryById = async (req, res) => {
   try {
      const accessory = await Accessories.findById(req.params.id).populate('user', 'name location');
      if (!accessory) return res.status(404).json({ error: 'Accessory not found' });
      res.json(accessory);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.updateAccessory = async (req, res) => {
   try {
      const { name, type, color, compatibleWith, wearCount, status } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (type) updateData.type = type;
      if (color) updateData.color = color;
      if (wearCount !== undefined) updateData.wearCount = wearCount;
      if (status) updateData.status = status;

      if (compatibleWith) {
         updateData.compatibleWith = Array.isArray(compatibleWith)
            ? compatibleWith
            : compatibleWith.split(',').map(s => s.trim());
      }

      // Handle image update
      const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
      if (file) {
         // Delete old image from cloudinary
         const accessory = await Accessories.findById(req.params.id);
         if (accessory && accessory.image && accessory.image.public_id) {
            await cloudinary.uploader.destroy(accessory.image.public_id);
         }
         updateData.image = await uploadImage(file);
      }

      const accessory = await Accessories.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!accessory) return res.status(404).json({ error: 'Accessory not found' });
      res.json(accessory);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};

exports.deleteAccessory = async (req, res) => {
   try {
      const accessory = await Accessories.findById(req.params.id);
      if (!accessory) return res.status(404).json({ error: 'Accessory not found' });

      // Delete image from cloudinary
      if (accessory.image && accessory.image.public_id) {
         await cloudinary.uploader.destroy(accessory.image.public_id);
      }

      await Accessories.findByIdAndDelete(req.params.id);
      res.json({ message: 'Accessory deleted successfully' });
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
};
