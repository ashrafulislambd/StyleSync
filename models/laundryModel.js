const mongoose = require('mongoose');

const laundrySchema = new mongoose.Schema({
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Clothes' }],
    status: { type: String, enum: ['pending', 'washing', 'drying', 'done'], default: 'pending' },
    scheduledDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'StyleSyncUser', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Laundry', laundrySchema);
