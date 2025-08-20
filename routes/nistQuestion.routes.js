import express from "express";
import { createNistQuestion, getNistQuestionsByFunction, getQuestionCountByFunction, uploadNistQuestions,getUniqueSubcategoriesByFunction } from "../controllers/nistQuestion.controllers.js";
import { authorize } from "../middlewares/authorize.js";
import { uploadExcel } from "../middlewares/upload.js";


const nistQuestionRoutes = express.Router();

// nistQuestionRoutes.post("/", createNistQuestion);
nistQuestionRoutes.get("/", authorize(["admin", "editor", "viewer"]), getNistQuestionsByFunction);
nistQuestionRoutes.post("/upload", authorize(["sysadmin"]), uploadExcel, uploadNistQuestions);
nistQuestionRoutes.get("/subcategories", authorize(["admin", "editor", "viewer"]), getUniqueSubcategoriesByFunction);
nistQuestionRoutes.get("/questions-length", authorize(["admin", "editor", "viewer"]), getQuestionCountByFunction);

export default nistQuestionRoutes;