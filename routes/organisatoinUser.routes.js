import express from "express";
import { registerOrganizationUser, verifyOrganizationOtp } from "../controllers/organisationUser.controllers.js";

const organisationUserRoutes = express.Router();

organisationUserRoutes.post("/register", registerOrganizationUser);
organisationUserRoutes.post("/verify-otp", verifyOrganizationOtp);

export default organisationUserRoutes;