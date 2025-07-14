import express from "express";
import { createMaturityQuestion } from "../controllers/maturityQuestion.controllers.js";

const maturityQuestionRoutes = express.Router();

maturityQuestionRoutes.post("/", createMaturityQuestion);

export default maturityQuestionRoutes;