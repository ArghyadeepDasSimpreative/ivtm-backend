import express from "express";
import { createNistEvaluation, getAssessmentsByUser, getFunctionWiseAnswers, getFunctionWiseAverage, getNistEvaluationStats, getNistQuestionsWithAnswers, updateEvaluation } from "../controllers/nistEvaluation.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const nistEvaluationRoutes = express.Router();

nistEvaluationRoutes.post("/", authorize(["admin"]), createNistEvaluation);
nistEvaluationRoutes.put("/:evaluationId", authorize(["admin"]), updateEvaluation);
nistEvaluationRoutes.get("/stats/:evaluationId", authorize(["admin"]), getNistEvaluationStats);
nistEvaluationRoutes.get("/stats/:evaluationId/function/:functionName", authorize(["admin"]), getFunctionWiseAnswers);
nistEvaluationRoutes.get("/assessments", authorize(["admin"]), getAssessmentsByUser);
nistEvaluationRoutes.get("/marks/function/:evaluationId", authorize(["admin"]), getFunctionWiseAverage);
nistEvaluationRoutes.get("/answers/:evaluationId", authorize(["admin"]), getNistQuestionsWithAnswers);

export default nistEvaluationRoutes;