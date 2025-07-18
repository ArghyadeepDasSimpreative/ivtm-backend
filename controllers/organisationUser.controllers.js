import { OrganizationUser } from "../models/organisationUser.model.js";
import { sendOtpMail } from "../lib/mail.js";
import jwt from "jsonwebtoken";
import { NistQuestion } from "../models/nistQuestions.model.js";

export const registerOrganizationUser = async (req, res) => {
  try {
    const { organisationName, businessEmail, phoneNumber, username, password } = req.body;

    // --- Field Validations ---
    if (!organisationName || organisationName.length < 4) {
      return res.status(400).json({ message: 'Organisation name must be at least 4 characters long.' });
    }

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!businessEmail || !emailRegex.test(businessEmail)) {
      return res.status(400).json({ message: 'A valid business email is required.' });
    }

    if (!phoneNumber || phoneNumber.length < 10 || !/^\d+$/.test(phoneNumber)) {
      return res.status(400).json({ message: 'Phone number must be at least 10 digits and numeric only.' });
    }

    if (!username || username.length < 4) {
      return res.status(400).json({ message: 'Username must be at least 4 characters long.' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required.' });
    }

    // --- Uniqueness Checks ---
    const existingEmail = await OrganizationUser.findOne({ businessEmail });
    if (existingEmail) {
      return res.status(400).json({ message: 'Business email is already registered.' });
    }

    const existingUsername = await OrganizationUser.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    // --- OTP Generation ---
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

    // --- Create and Save New User ---
    const newUser = new OrganizationUser({
      organisationName,
      businessEmail,
      phoneNumber,
      username,
      defaultPassword: password,
      otp,
      otpExpiresAt
    });

    await newUser.save();

    // --- Send OTP via Mail ---
    await sendOtpMail(businessEmail, otp);

    return res.status(201).json({
      message: 'Organization user registered successfully. OTP sent to email.',
      user: {
        organisationName,
        businessEmail,
        phoneNumber,
        username,
        role: "user"
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


export const verifyOrganizationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await OrganizationUser.findOne({ businessEmail: email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP not generated for this user.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired.' });
    }

    // Clear OTP after verification
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.businessEmail,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(200).json({
      message: 'OTP verified successfully.',
      token,
      user: {
        id: user._id,
        organisationName: user.organisationName,
        businessEmail: user.businessEmail,
        phoneNumber: user.phoneNumber,
        username: user.username
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getUniqueSubcategoriesByFunction = async (req, res) => {
  try {
    const fn = req.query.function;
    const validFunctions = ['IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER', 'GOVERN'];

    if (!fn || !validFunctions.includes(fn.toUpperCase())) {
      return res.status(400).json({ message: `Valid function required. Must be one of: ${validFunctions.join(', ')}` });
    }

    const questions = await NistQuestion.find({ function: fn.toUpperCase() }).select("subcategory");

    // Extract base subcategories (e.g., "RS.MI" from "RS.MI-02")
    const baseSubcategories = questions
      .map(q => q.subcategory?.split("-")[0])
      .filter(Boolean);

    // Deduplicate
    const unique = [...new Set(baseSubcategories)];

    return res.status(200).json({
      function: fn.toUpperCase(),
      subcategories: unique
    });

  } catch (err) {
    console.error("❌ Error fetching subcategories:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


