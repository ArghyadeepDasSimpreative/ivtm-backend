import express from "express";
import { uploadExcel } from "../middlewares/upload.js";
import { getAllHipaaQuestions, getHipaaCategories, uploadHipaaQuestions } from "../controllers/hipaaQuestion.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const hipaaQuestionRoutes = express.Router();

hipaaQuestionRoutes.post("/upload", uploadExcel, uploadHipaaQuestions);
hipaaQuestionRoutes.get("/", authorize(["user"]), getAllHipaaQuestions );
hipaaQuestionRoutes.get("/categories", authorize(["user"]), getHipaaCategories);

export default hipaaQuestionRoutes;