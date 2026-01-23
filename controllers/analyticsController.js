const Clothes = require('../models/clothesModel');

exports.wardrobeAnalytics = async (req, res) => {
       try {
              const clothes = await Clothes.find();

              const mostUsed = clothes.filter(c => c.wearCount >= 7);

              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

              const leastUsed = clothes.filter(c =>
                     c.wearCount <= 2 || (c.lastWorn && c.lastWorn <= oneYearAgo)
              );

              res.json({
                     mostUsed,
                     leastUsed,
                     donationSuggestions: leastUsed
              });
       } catch (error) {
              res.status(500).json({ error: error.message });
       }
};
