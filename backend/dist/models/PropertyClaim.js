"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const propertyClaimSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        lat: Number,
        lng: Number,
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ['basic', 'enhanced'],
        default: 'basic'
    },
    claimedAt: {
        type: Date,
        default: Date.now
    },
    residencyDates: {
        startDate: Date,
        endDate: Date,
        current: Boolean
    },
    verificationDocuments: [{
            documentType: {
                type: String,
                enum: ['utility_bill', 'tax_document', 'lease', 'deed', 'other']
            },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending'
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            url: String
        }]
});
exports.default = mongoose_1.default.model('PropertyClaim', propertyClaimSchema);
