import { OrganizationUser } from "../models/organisationUser.model.js";
import { sendOtpMail } from "../lib/mail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

     const hashedPassword = await bcrypt.hash(password, 10);

    // --- Create and Save New User ---
    const newUser = new OrganizationUser({
      organisationName,
      businessEmail,
      phoneNumber,
      username,
      defaultPassword: hashedPassword,
      role: "admin",
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
        role: "admin"
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error.' });
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
      return res.status(400).json({ message: 'Invalid OTP' });
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



export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await OrganizationUser.findOne({ businessEmail: email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }


    const isPasswordValid = await bcrypt.compare(password, user.defaultPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

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
      message: 'Sign in successful.',
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
    console.error('Sign in error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    if (!req.imageUrl) {
      return res.status(400).json({ error: 'No image uploaded or processing failed' });
    }

    const updatedUser = await OrganizationUser.findByIdAndUpdate(
      req.user._id,
      { profileImageUrl: req.imageUrl },
      { new: true }
    );

    res.json({
      message: 'Profile image updated successfully',
      profileImageUrl: updatedUser.profileImageUrl,
    });
  } catch (error) {
    console.log('Error updating profile image:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getOrganizationUserProfile = async (req, res) => {
  try {
    const user = await OrganizationUser.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user details", error: error.message });
  }
};

export const createOrganizationUser = async (req, res) => {
  try {
    const {
      businessEmail,
      phoneNumber,
      username,
      defaultPassword,
      role,
    } = req.body;

    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orgData = await OrganizationUser.findById(userId);
    if (!orgData) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const existingUser = await OrganizationUser.findOne({ businessEmail });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newUser = new OrganizationUser({
      organisationName: orgData.organisationName,
      businessEmail,
      phoneNumber,
      username,
      defaultPassword: hashedPassword,
      role: role || "admin",
    });

    await newUser.save();

    const createdUser = await OrganizationUser.findById(newUser._id).select("-defaultPassword");

    res.status(201).json({
      message: "User created successfully",
      user: createdUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};

export const getAllOrganizationUsers = async (req, res) => {
  try {
    const userData = await OrganizationUser.findById(req.user._id);
    const organisationName = userData.organisationName;

    const users = await OrganizationUser.find({ organisationName }).select("-defaultPassword");

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



