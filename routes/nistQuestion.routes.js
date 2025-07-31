import express from "express";
import { createNistQuestion, getNistQuestionsByFunction, getQuestionCountByFunction, uploadNistQuestions,getUniqueSubcategoriesByFunction } from "../controllers/nistQuestion.controllers.js";
import { authorize } from "../middlewares/authorize.js";
import { uploadExcel } from "../middlewares/upload.js";


const nistQuestionRoutes = express.Router();

nistQuestionRoutes.post("/", createNistQuestion);
nistQuestionRoutes.get("/", authorize(["user"]), getNistQuestionsByFunction);
nistQuestionRoutes.post("/upload", uploadExcel, uploadNistQuestions);
nistQuestionRoutes.get("/subcategories", getUniqueSubcategoriesByFunction);
nistQuestionRoutes.get("/questions-length", authorize("user"), getQuestionCountByFunction);

export default nistQuestionRoutes;