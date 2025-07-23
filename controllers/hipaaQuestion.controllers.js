import xlsx from 'xlsx';
import HipaaQuestion from '../models/hipaaQuestions.model.js';

export const uploadHipaaQuestions = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Excel file is required and must be sent as a buffer.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let validEntries = [];
    let skippedCount = 0;

    rows.forEach((row) => {
      const category = row.Category?.trim();
      const task = row.Task?.trim();
      const description = row.Description?.trim();
      const question = row.Question?.trim();
      const answer = row.Answer?.trim();

      if (!category || !task || !description || !question || !answer) {
        skippedCount += 1;
        return;
      }

      const scoreArray = [];

      Object.keys(row).forEach((key) => {
        if (
          key.toLowerCase() === 'score' ||
          key.startsWith('__EMPTY')
        ) {
          const value = row[key];
          if (value) {
            scoreArray.push(value.toString().trim());
          }
        }
      });

      validEntries.push({
        category,
        task,
        description,
        question,
        answer,
        score: scoreArray,
      });
    });

    if (validEntries.length === 0) {
      return res.status(400).json({ message: 'No valid entries found in the Excel file.' });
    }

    const inserted = await HipaaQuestion.insertMany(validEntries);

    res.status(201).json({
      message: 'Questions uploaded successfully.',
      insertedCount: inserted.length,
      skippedCount,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload questions.', error: error.message });
  }
};
