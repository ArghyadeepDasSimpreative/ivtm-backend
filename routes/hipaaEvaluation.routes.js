import express from "express"
import { authorize } from "../middlewares/authorize.js";
import { getEvaluationDetails, getUserHipaaEvaluations, recordHipaaEvaluation } from "../controllers/hipaaEvaluation.controllers.js";

const hipaaEvaluationRoutes = express.Router();

hipaaEvaluationRoutes.post("/", authorize(["user"]), recordHipaaEvaluation);
hipaaEvaluationRoutes.get("/assessments", authorize(["user"]), getUserHipaaEvaluations);
hipaaEvaluationRoutes.get("/details/:evaluationId", authorize(["user"]), getEvaluationDetails);

export default hipaaEvaluationRoutes;