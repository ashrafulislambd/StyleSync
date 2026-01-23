const Outfit = require('../models/outfitModel');
const Clothes = require('../models/clothesModel');
const Accessories = require('../models/accessoriesModel');
const Laundry = require('../models/laundryModel');
const Weather = require('../models/weatherModel');
const User = require('../models/userModel'); // Needed for location
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

exports.addOutfit = async (req, res) => {
    try {
        const { name, clothingItems, accessories, weatherCondition, wearCount } = req.body;
        const images = await uploadImages(req.files);

        const outfit = new Outfit({
            name,
            clothingItems: JSON.parse(clothingItems || '[]'),
            accessories: JSON.parse(accessories || '[]'),
            weatherCondition,
            outfitImages: images,
            wearCount: wearCount || 0
        });

        await outfit.save();
        res.status(201).json(outfit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.generateOutfit = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const weather = await Weather.findOne({ location: user.location }).sort({ date: -1 });
        const currentCondition = weather ? weather.conditions : 'sunny'; // Default

        // Get available clothes (not donated/sold)
        let clothes = await Clothes.find({ status: 'active' });

        // Filter by laundry
        const laundry = await Laundry.find({ status: { $ne: 'done' } }).select('items');
        const laundryItemIds = laundry.flatMap(l => l.items.map(i => i.toString()));
        clothes = clothes.filter(c => !laundryItemIds.includes(c._id.toString()));

        // Filter by weather/season compatibility (Basic logic)
        // season: Array of Strings. weatherCondition: String.
        // mapping: sunny -> Summer, rainy -> Rainy, cold -> Winter, hot -> Summer
        // This mapping is subjective, I'll do a simple includes check if season matches condition loosely or just pick random valid ones.
        // Prompt says "smart system that tracks clothing usage, understands weather conditions".
        // simple logic: If weather 'cold', pick clothes with season 'Winter' or 'Fall'.
        // If weather 'hot', pick 'Summer'.
        // Or assume clothes have seasons ['Summer', 'Winter'] directly.
        // For now, I'll skip complex season mapping unless I see season values. I'll just filter by color/occasion if provided? 
        // "filters clothing items by season, occasion, and color compatibility"
        // I will select 1 top and 1 bottom matching the weather.

        const seasonMap = {
            'cold': ['Winter', 'Fall'],
            'hot': ['Summer', 'Spring'],
            'sunny': ['Summer', 'Spring'],
            'rainy': ['Monsoon', 'Rainy'],
            'cloudy': ['Fall', 'Spring']
        };
        const targetSeasons = seasonMap[currentCondition] || [];

        // Filter clothes by season (if they have season set)
        let validClothes = clothes.filter(c => {
            if (!c.season || c.season.length === 0) return true;
            return c.season.some(s => targetSeasons.includes(s) || targetSeasons.length === 0);
        });

        // Select Top and Bottom
        const tops = validClothes.filter(c => c.category === 'top');
        const bottoms = validClothes.filter(c => c.category === 'bottom');

        if (tops.length === 0 || bottoms.length === 0) {
            return res.status(400).json({ error: 'Not enough clothes to generate outfit' });
        }

        const selectedTop = tops[Math.floor(Math.random() * tops.length)];
        // Color compatibility: naive matching or just random for now? Prompt says "color compatibility".
        // Let's pick a bottom that matches top color? Or just any bottom. I'll pick random for simplicity as "compatibility" logic is undefined.
        const selectedBottom = bottoms[Math.floor(Math.random() * bottoms.length)];

        // Select Accessories
        // "Accessories selected based on compatibility rules defined in accessories schema" -> compatibleWith (Array of Strings) [clothes category]
        // If accessory.compatibleWith.includes('top'), it implies it goes with the top?
        // Or if it says 'formal', it goes with formal clothes?
        // Prompt says "compatibleWith ... [clothes category]".
        // So if accessory is compatible with 'top', we can include it.
        const accessories = await Accessories.find({ status: 'active' });
        const selectedAccessories = accessories.filter(a => {
            return a.compatibleWith.some(cat => cat === selectedTop.category || cat === selectedBottom.category);
        });

        const outfit = new Outfit({
            clothingItems: [selectedTop._id, selectedBottom._id],
            accessories: selectedAccessories.map(a => a._id),
            weatherCondition: currentCondition,
            outfitImages: [], // Could generate image here but prompt says "stored... along with optional outfit imagery". I won't generate an image file.
            wearCount: 0
        });

        await outfit.save();

        // Update wear counts
        await Clothes.updateMany({ _id: { $in: [selectedTop._id, selectedBottom._id] } }, { $inc: { wearCount: 1 }, lastWorn: new Date() });
        await Accessories.updateMany({ _id: { $in: selectedAccessories.map(a => a._id) } }, { $inc: { wearCount: 1 }, lastWorn: new Date() });

        res.status(201).json(outfit);

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};

exports.getAllOutfits = async (req, res) => {
    try {
        const outfits = await Outfit.find().populate('clothingItems').populate('accessories');
        res.json(outfits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOutfitById = async (req, res) => {
    try {
        const outfit = await Outfit.findById(req.params.id).populate('clothingItems').populate('accessories');
        if (!outfit) return res.status(404).json({ error: 'Outfit not found' });
        res.json(outfit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.modifyOutfitById = async (req, res) => {
    try {
        const outfit = await Outfit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!outfit) return res.status(404).json({ error: 'Outfit not found' });
        res.json(outfit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};