import xlsx from 'xlsx';
import C2m2QuestionModel from '../models/c2m2Question.model.js';

export const uploadc2m2Questions = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: 'Excel file is required and must be sent as a buffer.' });
        }

        // Read Excel
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

        // Map & rename fields
        const formattedRows = rows.map(row => ({
            domain: row.Domain,
            practice: row.Practice,
            practiceText: row['Practice Text'],
            question: row.Question,
            answer: row.Answer,
            markOne: row.MIL,
            markTwo: row.__EMPTY
        }));

        const inserted = await C2m2QuestionModel.insertMany(formattedRows);

        res.status(201).json({
            message: `${inserted.length} questions inserted successfully`,
            data: inserted
        });

    } catch (err) {
        res.status(500).json({ message: err?.message || "Some error happened while uploading the questions" });
    }
};

export const getDistinctC2m2Domains = async (req, res) => {
    try {
        const domains = await C2m2QuestionModel.distinct("domain");
        res.status(200).json({ domains });
    } catch (err) {
        res.status(500).json({ message: err?.message || "Error fetching distinct domains" });
    }
};

export const getC2m2QuestionsByDomain = async (req, res) => {
    try {
        const { domain } = req.params;

        if (!domain) {
            return res.status(400).json({ message: "Domain parameter is required" });
        }

        const questions = await C2m2QuestionModel.find({ domain: domain });
        res.status(200).json({ questions });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err?.message || "Error fetching questions by domain" });
    }
};