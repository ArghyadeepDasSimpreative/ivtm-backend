import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false, // false for Gmail port 587
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

/**
 * Sends an OTP to the specified email address.
 * @param {string} email - The recipient's email address.
 * @param {string} otp - The OTP code to be sent.
 * @returns {Promise<void>}
 */


export const sendOtpMail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"CyberSec App" <${process.env.MAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `
        <p>Dear user,</p>
        <p>Your One-Time Password (OTP) is: <strong>${otp}</strong></p>
        <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
        <p>Thanks,<br/>CyberSec Team</p>
      `,
    });

    // console.log('OTP email sent:', info.messageId);
  } catch (error) {
    // console.log("error happend in sending mail", error);
    console.error('Error sending OTP email:', error);
    throw new Error({ message: error.message });
  }
};
