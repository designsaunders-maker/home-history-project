import mongoose from 'mongoose';

export interface IPropertyClaim extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  verificationStatus: 'basic' | 'enhanced';
  claimedAt: Date;
  residencyDates?: {
    startDate: Date;
    endDate?: Date;
    current: boolean;
  };
  verificationDocuments?: {
    documentType: 'utility_bill' | 'tax_document' | 'lease' | 'deed' | 'other';
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    url: string;
  }[];
}

const propertyClaimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
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

export default mongoose.model<IPropertyClaim>('PropertyClaim', propertyClaimSchema);