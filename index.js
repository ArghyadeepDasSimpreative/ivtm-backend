import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import maturityQuestionRoutes from "./routes/maturityQuestion.routes.js";
import maturityResultRoutes from "./routes/maturityresult.routes.js";
import organisationUserRoutes from "./routes/organisatoinUser.routes.js";

dotenv.config();
connectDB();

const app = express();


app.use(cors()); 
app.use(express.json()); 


app.use("/maturity-questions", maturityQuestionRoutes);
app.use("/maturity-results", maturityResultRoutes);
app.use("/organisation-user", organisationUserRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
