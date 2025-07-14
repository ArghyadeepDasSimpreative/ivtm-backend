import mongoose from 'mongoose';

const organizationUserSchema = new mongoose.Schema({
  organisationName: {
    type: String,
    required: true,
    minlength: [4, 'Organisation name must be at least 4 characters long'],
  },
  businessEmail: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please enter a valid business email address'
    ]
  },
  phoneNumber: {
    type: String,
    required: true,
    minlength: [10, 'Phone number must be at least 10 digits'],
    match: [/^\d+$/, 'Phone number must contain only digits'],
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [4, 'Username must be at least 4 characters long']
  },
  defaultPassword: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

export const OrganizationUser = mongoose.model('OrganizationUser', organizationUserSchema);
