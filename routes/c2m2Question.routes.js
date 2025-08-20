import express from "express";
import { uploadPdfOrExcel } from "../middlewares/upload.js";
import { getC2m2QuestionsByDomain, getDistinctC2m2Domains, uploadc2m2Questions } from "../controllers/c2m2Question.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const c2m2QuestionRoutes = express.Router();

c2m2QuestionRoutes.post("/upload",authorize(["sysadmin"]), uploadPdfOrExcel, uploadc2m2Questions);
c2m2QuestionRoutes.get("/:domain", authorize(["admin", "editor", "viewer"]),getC2m2QuestionsByDomain);
c2m2QuestionRoutes.get("/questions/domains", authorize(["admin", "editor", "viewer"]), getDistinctC2m2Domains);

export default c2m2QuestionRoutes;