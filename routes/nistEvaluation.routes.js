import express from "express";
import { createNistEvaluation, getAssessmentsByUser, getFunctionWiseAnswers, getFunctionWiseAverage, getNistEvaluationStats, getNistQuestionsWithAnswers, hasDraftNistEvaluation, updateEvaluation } from "../controllers/nistEvaluation.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const nistEvaluationRoutes = express.Router();

nistEvaluationRoutes.post("/", authorize(["admin"]), createNistEvaluation);
nistEvaluationRoutes.put("/:evaluationId", authorize(["admin"]), updateEvaluation);
nistEvaluationRoutes.get("/stats/:evaluationId", authorize(["admin", "editor", "viewer"]), getNistEvaluationStats);
nistEvaluationRoutes.get("/stats/:evaluationId/function/:functionName", authorize(["admin", "editor", "viewer"]), getFunctionWiseAnswers);
nistEvaluationRoutes.get("/assessments", authorize(["admin", "editor", "viewer"]), getAssessmentsByUser);
nistEvaluationRoutes.get("/marks/function/:evaluationId", authorize(["admin", "editor", "viewer"]), getFunctionWiseAverage);
nistEvaluationRoutes.get("/answers/:evaluationId", authorize(["admin", "editor", "viewer"]), getNistQuestionsWithAnswers);
nistEvaluationRoutes.get("/assessments/draft-exists", authorize(["admin"]), hasDraftNistEvaluation);

export default nistEvaluationRoutes;