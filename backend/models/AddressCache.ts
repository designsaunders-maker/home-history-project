import mongoose, { Document, Schema } from 'mongoose';

export interface IAddressCache extends Document {
  address: string;
  normalizedAddress: string; // lowercase, trimmed for lookup
  censusData: any;
  geocodeData: any;
  createdAt: Date;
  updatedAt: Date;
}

const AddressCacheSchema: Schema = new Schema({
  address: { type: String, required: true },
  normalizedAddress: { type: String, required: true, unique: true },
  censusData: { type: Schema.Types.Mixed },
  geocodeData: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
AddressCacheSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for faster lookups
AddressCacheSchema.index({ normalizedAddress: 1 });

export default mongoose.model<IAddressCache>('AddressCache', AddressCacheSchema);

