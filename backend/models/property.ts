import mongoose, { Document, Schema } from 'mongoose';

export interface IMemory {
  _id?: string;
  photo?: string;
  memory: string;
  submitterName: string;
  contact?: string;
  residency?: {
    yearMovedIn?: number;
    yearMovedOut?: number;
    current: boolean;
  };
  submittedAt: Date;
}

export interface IProperty extends Document {
  address: string;
  yearBuilt?: number;
  lat: number;
  lng: number;
  memories: IMemory[];
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema: Schema = new Schema({
  photo: { type: String },
  memory: { type: String, required: true },
  submitterName: { type: String, required: true },
  contact: { type: String },
  residency: {
    yearMovedIn: { type: Number },
    yearMovedOut: { type: Number },
    current: { type: Boolean, default: false }
  },
  submittedAt: { type: Date, default: Date.now }
});

const PropertySchema: Schema = new Schema({
  address: { type: String, required: true },
  yearBuilt: { type: Number },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  memories: [MemorySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IProperty>('Property', PropertySchema);