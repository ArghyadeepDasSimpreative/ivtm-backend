import { OrganizationUser } from "../models/organisationUser.model.js"
import crypto from 'crypto';

export const registerOrganizationUser = async (req, res) => {
  try {
    const { organisationName, businessEmail, phoneNumber, username } = req.body;

    // --- Validate fields manually ---

    if (!organisationName || organisationName.length < 4) {
      return res.status(400).json({ error: 'Organisation name must be at least 4 characters long.' });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!businessEmail || !emailRegex.test(businessEmail)) {
      return res.status(400).json({ error: 'A valid business email is required.' });
    }

    if (!phoneNumber || phoneNumber.length < 10 || !/^\d+$/.test(phoneNumber)) {
      return res.status(400).json({ error: 'Phone number must be at least 10 digits and numeric only.' });
    }

    if (!username || username.length < 4) {
      return res.status(400).json({ error: 'Username must be at least 4 characters long.' });
    }

    // --- Check for uniqueness ---
    const existingEmail = await OrganizationUser.findOne({ businessEmail });
    if (existingEmail) {
      return res.status(400).json({ error: 'Business email is already registered.' });
    }

    const existingUsername = await OrganizationUser.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    // --- Generate secure default password ---
    const defaultPassword = crypto.randomBytes(8).toString('hex'); // 16-character hex password

    // --- Create new user ---
    const newUser = new OrganizationUser({
      organisationName,
      businessEmail,
      phoneNumber,
      username,
      defaultPassword
    });

    await newUser.save();

    return res.status(201).json({
      message: 'Organization user registered successfully.',
      user: {
        organisationName,
        businessEmail,
        phoneNumber,
        username,
        defaultPassword
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
