"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const property_1 = __importDefault(require("../models/property"));
const router = express_1.default.Router();
// Create a new property with initial memory
router.post('/', async (req, res) => {
    try {
        const { address, lat, lng, yearBuilt, memory, submitterName, contact, residency, photo } = req.body;
        // Debug logging to verify data is being received
        console.log('Received property data:', {
            address,
            lat,
            lng,
            yearBuilt,
            memory,
            submitterName,
            contact,
            residency,
            photo
        });
        const newMemory = {
            photo,
            memory,
            submitterName,
            contact,
            residency: {
                yearMovedIn: residency?.yearMovedIn,
                yearMovedOut: residency?.yearMovedOut,
                current: residency?.current || false
            },
            submittedAt: new Date()
        };
        const newProperty = new property_1.default({
            address,
            lat,
            lng,
            yearBuilt,
            memories: [newMemory]
        });
        const savedProperty = await newProperty.save();
        console.log('Saved property:', savedProperty);
        res.status(201).json(savedProperty);
    }
    catch (error) {
        console.error('Error creating property:', error);
        res.status(400).json({ message: 'Error creating property', error });
    }
});
// Add a memory to an existing property
router.post('/:id/memories', async (req, res) => {
    try {
        const { memory, submitterName, contact, residency, photo } = req.body;
        const newMemory = {
            photo,
            memory,
            submitterName,
            contact,
            residency: {
                yearMovedIn: residency?.yearMovedIn,
                yearMovedOut: residency?.yearMovedOut,
                current: residency?.current || false
            },
            submittedAt: new Date()
        };
        const property = await property_1.default.findByIdAndUpdate(req.params.id, { $push: { memories: newMemory } }, { new: true });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.status(201).json(property);
    }
    catch (error) {
        console.error('Error adding memory:', error);
        res.status(400).json({ message: 'Error adding memory', error });
    }
});
// Find or create property by location and add memory
router.post('/memories', async (req, res) => {
    try {
        const { address, lat, lng, yearBuilt, memory, submitterName, contact, residency, photo } = req.body;
        const newMemory = {
            photo,
            memory,
            submitterName,
            contact,
            residency: {
                yearMovedIn: residency?.yearMovedIn,
                yearMovedOut: residency?.yearMovedOut,
                current: residency?.current || false
            },
            submittedAt: new Date()
        };
        // Try to find existing property at this location (within ~100m radius)
        const existingProperty = await property_1.default.findOne({
            lat: { $gte: lat - 0.001, $lte: lat + 0.001 },
            lng: { $gte: lng - 0.001, $lte: lng + 0.001 }
        });
        if (existingProperty) {
            // Add memory to existing property
            existingProperty.memories.push(newMemory);
            const savedProperty = await existingProperty.save();
            res.status(201).json(savedProperty);
        }
        else {
            // Create new property with this memory
            const newProperty = new property_1.default({
                address,
                lat,
                lng,
                yearBuilt,
                memories: [newMemory]
            });
            const savedProperty = await newProperty.save();
            res.status(201).json(savedProperty);
        }
    }
    catch (error) {
        console.error('Error adding memory to property:', error);
        res.status(400).json({ message: 'Error adding memory to property', error });
    }
});
// Get all properties
router.get('/', async (req, res) => {
    try {
        const properties = await property_1.default.find();
        res.json(properties);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching properties', error });
    }
});
// Get a specific property
router.get('/:id', async (req, res) => {
    try {
        const property = await property_1.default.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching property', error });
    }
});
// Update a property
router.put('/:id', async (req, res) => {
    try {
        const { address, lat, lng, yearBuilt } = req.body;
        const updatedProperty = await property_1.default.findByIdAndUpdate(req.params.id, { address, lat, lng, yearBuilt }, { new: true });
        if (!updatedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(updatedProperty);
    }
    catch (error) {
        res.status(400).json({ message: 'Error updating property', error });
    }
});
// Delete a property
router.delete('/:id', async (req, res) => {
    try {
        const deletedProperty = await property_1.default.findByIdAndDelete(req.params.id);
        if (!deletedProperty) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting property', error });
    }
});
// Find properties near a location
router.post('/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 1 } = req.body; // radius in miles
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Latitude and longitude are required' });
        }
        // Simple client-side filtering for now
        // In production, you'd use MongoDB's geo-spatial queries with $geoNear
        const allProperties = await property_1.default.find();
        const nearbyProperties = allProperties.filter(property => {
            if (!property.lat || !property.lng)
                return false;
            const distance = calculateDistance(lat, lng, property.lat, property.lng);
            return distance <= radius;
        });
        res.json(nearbyProperties);
    }
    catch (error) {
        res.status(500).json({ message: 'Error finding nearby properties', error });
    }
});
// Helper function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in years
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
exports.default = router;
