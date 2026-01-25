const Laundry = require('../models/laundryModel');

exports.addLaundry = async (req, res) => {
      try {
            const { items, scheduledDate } = req.body;
            // items should be an array of clothes IDs
            const laundry = new Laundry({
                  items,
                  scheduledDate,
                  status: 'pending' // Default status
            });

            await laundry.save();
            res.status(201).json(laundry);
      } catch (error) {
            res.status(500).json({ error: error.message });
      }
};

exports.updateLaundry = async (req, res) => {
      try {
            const { status } = req.body;
            const laundry = await Laundry.findByIdAndUpdate(
                  req.params.id,
                  { status },
                  { new: true }
            );

            if (!laundry) return res.status(404).json({ error: 'Laundry entry not found' });

            res.json(laundry);
      } catch (error) {
            res.status(500).json({ error: error.message });
      }
};
