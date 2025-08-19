import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import maturityQuestionRoutes from "./routes/maturityQuestion.routes.js";
import maturityResultRoutes from "./routes/maturityresult.routes.js";
import organisationUserRoutes from "./routes/organisatoinUser.routes.js";
import nistQuestionRoutes from "./routes/nistQuestion.routes.js";
import nistEvaluationRoutes from "./routes/nistEvaluation.routes.js";
import hipaaQuestionRoutes from "./routes/hipaaQuestion.routes.js";
import hipaaEvaluationRoutes from "./routes/hipaaEvaluation.routes.js";
import vulnerabilityReportRoutes from "./routes/vulnerabilityReport.routes.js";
import c2m2QuestionRoutes from "./routes/c2m2Question.routes.js";
import c2m2EvaluationRoutes from "./routes/c2m2Evaluation.routes.js";

dotenv.config();
connectDB();

const app = express();


app.use(cors()); 
app.use(express.json()); 


app.use("/maturity-questions", maturityQuestionRoutes);
app.use("/maturity-results", maturityResultRoutes);
app.use("/organisation-user", organisationUserRoutes);
app.use("/nist-questions", nistQuestionRoutes);
app.use("/nist-evaluation", nistEvaluationRoutes);
app.use("/hipaa-questions", hipaaQuestionRoutes);
app.use("/hipaa-evaluations", hipaaEvaluationRoutes);
app.use("/vulnerability-reports", vulnerabilityReportRoutes);
app.use("/c2m2-questions", c2m2QuestionRoutes);
app.use("/c2m2-evaluations", c2m2EvaluationRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server4 listening on port ${PORT}`));
