import { NistQuestion } from "../models/nistQuestions.model.js";
import xlsx from 'xlsx';
import pkg from 'mongoose';

const { connection } = pkg;

export const createNistQuestion = async (req, res) => {
    try {
        const { function: fn, category, subcategory, questionText, options } = req.body;

        // const existingSubcategory = await NistQuestion.findOne({ subcategory });
        // if (existingSubcategory) {
        //     return res.status(400).json({ message: 'A question with this subcategory already exists. Subcategory must be unique.' });
        // }



        if (!fn || !category || !subcategory || !questionText || !options) {
            return res.status(400).json({ message: 'All fields are required.' });
        }


        const validFunctions = ['Identify', 'Protect', 'Detect', 'Respond', 'Recover', 'Govern'];
        if (!validFunctions.includes(fn)) {
            return res.status(400).json({ message: `Function must be one of: ${validFunctions.join(', ')}` });
        }

        // if (!Array.isArray(options) || options.length === 0 || options.some(opt => typeof opt !== 'string')) {
        //     return res.status(400).json({ message: 'Options must be a non-empty array of strings.' });
        // }


        const newQuestion = new NistQuestion({
            function: fn,
            category,
            subcategory,
            questionText,
            options
        });

        await newQuestion.save();

        return res.status(201).json({
            message: 'NIST question created successfully.',
            question: newQuestion
        });

    } catch (error) {
        console.error('Error creating NIST question:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

export const uploadNistQuestions = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Excel file is required and must be sent as a buffer.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: 'Excel sheet is empty or has invalid format.' });
    }

    let prevFunction = '';
    let prevCategory = '';
    let prevSubcategory = '';
    let prevSubDesc = '';

    const formatted = rows.map(row => {
      const currentFunction = row['Function']?.trim() || prevFunction;
      const currentCategory = row['Category']?.trim() || prevCategory;
      const currentSubcategory = row['Subcategory']?.trim() || prevSubcategory;
      const currentSubDesc = row['Subcategory description']?.trim() || prevSubDesc;

      prevFunction = currentFunction;
      prevCategory = currentCategory;
      prevSubcategory = currentSubcategory;
      prevSubDesc = currentSubDesc;

      const answers = [
        row['Scoring with Answer'],
        row['__EMPTY'],
        row['__EMPTY_1'],
        row['__EMPTY_2'],
        row['__EMPTY_3']
      ].filter(ans => ans && ans.toString().trim() !== '');

      return {
        function: currentFunction.split(' ')[0].trim(),
        category: currentCategory,
        subcategory: currentSubcategory,
        subcategoryDescription: currentSubDesc,
        questionText: row['Question']?.trim() || '',
        answers
      };
    });

    await connection.collection('nistquestions').insertMany(formatted);

    return res.status(200).json({
      message: 'NIST questions uploaded successfully.',
      insertedCount: formatted.length
    });

  } catch (error) {
    console.error('❌ Upload error:', error.message);
    return res.status(500).json({ message: 'Error uploading NIST questions.' });
  }
};


export const getNistQuestionsByFunction = async (req, res) => {
  try {
    const fn = req.query.function;

    if (!fn) {
      return res.status(400).json({ message: 'Function query parameter is required.' });
    }

    const validFunctions = ['IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER', 'GOVERN'];

    if (!validFunctions.includes(fn)) {
      return res.status(400).json({ message: `Function must be one of: ${validFunctions.join(', ')}` });
    }

    const questions = await NistQuestion.find({ function: fn });

    return res.status(200).json({
      count: questions.length,
      questions
    });

  } catch (error) {
    console.error('Error fetching NIST questions:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getQuestionCountByFunction = async (req, res) => {
  try {
    const result = await NistQuestion.aggregate([
      {
        $group: {
          _id: "$function",        // Group by function name
          count: { $sum: 1 }       // Count questions in each group
        }
      },
      {
        $project: {
          function: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    return res.status(200).json({
      message: 'Question counts by function retrieved successfully.',
      data: result
    });

  } catch (error) {
    console.error('❌ Error fetching question counts:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};



