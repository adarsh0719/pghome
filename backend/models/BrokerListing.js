const mongoose = require('mongoose');

const brokerListingSchema = new mongoose.Schema({
    broker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One active listing per broker for now? Or allow multiple? Assuming one based on "my bookings" context, but user might want multiple. Let's make it unique per user per property or just reference user. Let's stick to one main listing for "profile" display for now as per requirement.
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images: [{
        type: String
    }],
    description: {
        type: String
    },
    facilities: [{
        type: String
    }],
    packages: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        securityDeposit: {
            type: Number,
            default: 0,
            min: 0
        },
        amenities: [{
            type: String,
            trim: true
        }],
        features: [{
            type: String,
            trim: true
        }]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BrokerListing', brokerListingSchema);
