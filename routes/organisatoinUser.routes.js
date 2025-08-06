import express from "express";
import {
  registerOrganizationUser,
  signinUser,
  verifyOrganizationOtp,
  updateProfileImage,
  getOrganizationUserProfile,
  createOrganizationUser,
  getAllOrganizationUsers,
} from "../controllers/organisationUser.controllers.js";
import { uploadImage } from "../middlewares/upload.js";
import { authorize } from "../middlewares/authorize.js";

const organisationUserRoutes = express.Router();

organisationUserRoutes.post("/register", registerOrganizationUser);
organisationUserRoutes.post("/verify-otp", verifyOrganizationOtp);
organisationUserRoutes.post("/sign-in", signinUser);
organisationUserRoutes.put("/profile-image", authorize(["admin"]), uploadImage, updateProfileImage);
organisationUserRoutes.get("/all-users", authorize(["admin"]), getAllOrganizationUsers);
organisationUserRoutes.post("/create-user", authorize(["admin"]), createOrganizationUser);
organisationUserRoutes.get("/details", authorize(["admin"]), getOrganizationUserProfile);

export default organisationUserRoutes;
