// routes/c2m2EvaluationRoutes.js
import express from "express";
import { createC2m2Evaluation, getC2m2QuestionsWithAnswers, getUserC2m2Evaluations, hasDraftAssessment, updateC2m2Evaluation } from "../controllers/c2m2Evaluation.controllers.js"
import { authorize } from "../middlewares/authorize.js";

const c2m2EvaluationRoutes = express.Router();

c2m2EvaluationRoutes.post("/", authorize(["admin"]), createC2m2Evaluation);
c2m2EvaluationRoutes.put("/:id", authorize(["admin"]), updateC2m2Evaluation);
c2m2EvaluationRoutes.get("/assessments", authorize(["admin", "editor", "viewer"]), getUserC2m2Evaluations);
c2m2EvaluationRoutes.get("/average/:evaluationId", authorize(["admin", "editor", "viewer"]), getC2m2QuestionsWithAnswers);
c2m2EvaluationRoutes.get("/assessments/draft-exists", authorize(["admin"]), hasDraftAssessment);

export default c2m2EvaluationRoutes;
