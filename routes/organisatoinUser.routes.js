import express from "express";
import {
  registerOrganizationUser,
  signinUser,
  verifyOrganizationOtp,
  updateProfileImage,
  getOrganizationUserProfile,
  createOrganizationUser,
  getAllOrganizationUsers,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPasswordWithOtp,
} from "../controllers/organisationUser.controllers.js";
import { uploadImage } from "../middlewares/upload.js";
import { authorize } from "../middlewares/authorize.js";

const organisationUserRoutes = express.Router();

organisationUserRoutes.post("/register", registerOrganizationUser);
organisationUserRoutes.post("/verify-otp", verifyOrganizationOtp);
organisationUserRoutes.post("/sign-in", signinUser);
organisationUserRoutes.put("/profile-image", authorize(["admin", "editor", "viewer"]), uploadImage, updateProfileImage);
organisationUserRoutes.get("/all-users", authorize(["admin", "editor", "viewer"]), getAllOrganizationUsers);
organisationUserRoutes.post("/create-user", authorize(["admin"]), createOrganizationUser);
organisationUserRoutes.get("/details", authorize(["admin", "editor", "viewer"]), getOrganizationUserProfile);
organisationUserRoutes.put("/forget-password", sendForgotPasswordOtp);
organisationUserRoutes.post("/forget-password-otp", verifyForgotPasswordOtp);
organisationUserRoutes.post("/reset-password", resetPasswordWithOtp);

export default organisationUserRoutes;
