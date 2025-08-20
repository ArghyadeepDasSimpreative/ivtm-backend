import express from "express"
import { authorize } from "../middlewares/authorize.js";
import { getEvaluationDetails, getUserHipaaEvaluations, recordHipaaEvaluation } from "../controllers/hipaaEvaluation.controllers.js";

const hipaaEvaluationRoutes = express.Router();

hipaaEvaluationRoutes.post("/", authorize(["admin"]), recordHipaaEvaluation);
hipaaEvaluationRoutes.get("/assessments", authorize(["admin", "editor", "viewer"]), getUserHipaaEvaluations);
hipaaEvaluationRoutes.get("/details/:evaluationId", authorize(["admin", "editor", "viewer"]), getEvaluationDetails);

export default hipaaEvaluationRoutes;