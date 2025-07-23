import express from "express";
import { uploadExcel } from "../middlewares/upload.js";
import { uploadHipaaQuestions } from "../controllers/hipaaQuestion.controllers.js";

const hipaaQuestionRoutes = express.Router();

hipaaQuestionRoutes.post("/upload", uploadExcel, uploadHipaaQuestions);

export default hipaaQuestionRoutes;