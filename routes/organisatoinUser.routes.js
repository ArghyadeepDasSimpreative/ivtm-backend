import express from "express";
import { registerOrganizationUser, signinUser, verifyOrganizationOtp } from "../controllers/organisationUser.controllers.js";

const organisationUserRoutes = express.Router();

organisationUserRoutes.post("/register", registerOrganizationUser);
organisationUserRoutes.post("/verify-otp", verifyOrganizationOtp);
organisationUserRoutes.post("/sign-in", signinUser);

export default organisationUserRoutes;