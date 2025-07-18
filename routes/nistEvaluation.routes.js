import express from "express";
import { createNistEvaluation, getAssessmentsByUser, getFunctionWiseAnswers, getFunctionWiseAverage, getNistEvaluationStats, getNistQuestionsWithAnswers } from "../controllers/nistEvaluation.controllers.js";
import { authorize } from "../middlewares/authorize.js";

const nistEvaluationRoutes = express.Router();

nistEvaluationRoutes.post("/marks", authorize(["user"]), createNistEvaluation);
nistEvaluationRoutes.get("/stats/:evaluationId", authorize(["user"]), getNistEvaluationStats);
nistEvaluationRoutes.get("/stats/:evaluationId/function/:functionName", authorize(["user"]), getFunctionWiseAnswers);
nistEvaluationRoutes.get("/assessments", authorize(["user"]), getAssessmentsByUser);
nistEvaluationRoutes.get("/marks/function/:evaluationId", authorize(["user"]), getFunctionWiseAverage);
nistEvaluationRoutes.get("/answers/:evaluationId", authorize(["user"]), getNistQuestionsWithAnswers);

export default nistEvaluationRoutes;