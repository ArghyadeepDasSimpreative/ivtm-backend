import express from "express";
import { uploadExcel } from "../middlewares/upload.js";
import { getAllHipaaQuestions, getHipaaCategories, uploadHipaaQuestions } from "../controllers/hipaaQuestion.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const hipaaQuestionRoutes = express.Router();

hipaaQuestionRoutes.post("/upload",authorize(["sysadmin"]), uploadExcel, uploadHipaaQuestions);
hipaaQuestionRoutes.get("/", authorize(["admin", "editor", "viewer"]), getAllHipaaQuestions );
hipaaQuestionRoutes.get("/categories", authorize(["admin", "editor", "viewer"]), getHipaaCategories);

export default hipaaQuestionRoutes;