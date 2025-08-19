// routes/c2m2EvaluationRoutes.js
import express from "express";
import { createC2m2Evaluation, getC2m2QuestionsWithAnswers, getUserC2m2Evaluations, updateC2m2Evaluation } from "../controllers/c2m2Evaluation.controllers.js"
import { authorize } from "../middlewares/authorize.js";

const c2m2EvaluationRoutes = express.Router();

c2m2EvaluationRoutes.post("/", authorize(["admin", "user"]), createC2m2Evaluation);
c2m2EvaluationRoutes.put("/:id", authorize(["admin", "user"]), updateC2m2Evaluation);
c2m2EvaluationRoutes.get("/assessments", authorize(["admin", "user"]), getUserC2m2Evaluations);
c2m2EvaluationRoutes.get("/average/:evaluationId", authorize(["admin", "user"]), getC2m2QuestionsWithAnswers);

export default c2m2EvaluationRoutes;
