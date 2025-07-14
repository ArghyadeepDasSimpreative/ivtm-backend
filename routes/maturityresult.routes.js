import express from "express";
import { upsertMaturityResult } from "../controllers/maturityresult.controllers.js";

const maturityResultRoutes = express.Router();

maturityResultRoutes.post("/", upsertMaturityResult);

export default maturityResultRoutes;