import express from "express";
import { registerOrganizationUser } from "../controllers/organisationUser.controllers.js";

const organisationUserRoutes = express.Router();

organisationUserRoutes.post("/register", registerOrganizationUser);

export default organisationUserRoutes;