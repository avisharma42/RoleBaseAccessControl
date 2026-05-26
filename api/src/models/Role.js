import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  permissions: {
    type: Map,
    of: new mongoose.Schema({
      read: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }, { _id: false })
  }
}, { timestamps: true });

export default mongoose.model('Role', RoleSchema);
