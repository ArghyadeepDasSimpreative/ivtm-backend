import { NistEvaluation } from '../models/nistEvaluation.model.js';
import { NistQuestion } from '../models/nistQuestions.model.js';
import mongoose from 'mongoose';

export const createNistEvaluation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { marks, answers } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID missing.' });
    }

    if (typeof marks !== 'number' || isNaN(marks)) {
      return res.status(400).json({ message: 'Marks must be a valid number.' });
    }

    const newEvaluation = await NistEvaluation.create({
      userId,
      marks,
      answersGiven: answers,
      evaluationTime: new Date()
    });

    return res.status(201).json({
      message: 'NIST evaluation saved successfully.',
      data: newEvaluation
    });

  } catch (error) {
    console.error('❌ Error saving NIST evaluation:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};



export const getNistEvaluationStats = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
      return res.status(400).json({ message: 'Invalid evaluation ID' });
    }

    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    const marks = evaluation.marks || {}; // fallback if null/undefined

    // Get the number of questions per function
    const questionCounts = await NistQuestion.aggregate([
      {
        $group: {
          _id: '$function',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalQuestionsPerFunction = {};
    let totalQuestions = 0;
    questionCounts.forEach(q => {
      const key = q._id.toLowerCase();
      totalQuestionsPerFunction[key] = q.count;
      totalQuestions += q.count;
    });

    console.log("marks are ", marks)

    // Calculate total marks
    let totalMarks = 0;

    const attendedMarks = evaluation.answersGiven.reduce((sum, answer) => sum + answer.marks, 0);

    totalMarks = attendedMarks + (totalQuestions - evaluation.answersGiven.length)
    
    console.log("final total marks is ", totalMarks)

    const average = totalQuestions > 0 ? totalMarks / totalQuestions : 0;

    res.status(200).json({
      evaluationId,
      userId: evaluation.userId,
      answersGiven: evaluation.answersGiven,
      totalQuestions,
      totalMarks,
      average: Number(average.toFixed(2)),
    });
  } catch (error) {
    console.error('Error calculating evaluation stats:', error);
    res.status(500).json({ message: 'Server error while calculating stats' });
  }
};

export const getFunctionWiseAnswers = async (req, res) => {
  try {
    const { evaluationId, functionName } = req.params;
    

    if (!functionName) {
      return res.status(400).json({ error: 'functionName is required as a query param' });
    }

    // Get all questions of that function
    const questions = await NistQuestion.find({ function: functionName });

    console.log("questions are ", questions)

    // Fetch the evaluation by ID
    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    // Map answers for quick lookup by questionId
    const answerMap = {};
    for (const ans of evaluation.answersGiven) {
      answerMap[ans.questionId.toString()] = ans;
    }

    // Prepare result with filled + default answers
    const result = questions.map((q) => {
      const existing = answerMap[q._id.toString()];
      return {
        questionId: q._id,
        question: q.questionText,
        marks: existing ? existing.marks : 1,
        answer: existing ? questions.find(question => question.questionText == q.questionText).toObject().answers[existing.marks -1] : 'No',
      };
    });

    res.json({ functionName, totalQuestions: result.length, answers: result });
  } catch (err) {
    console.error('Error fetching function-wise answers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssessmentsByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Extracted from middleware

    const evaluations = await NistEvaluation.find(
      { userId },
      '_id evaluationTime'
    ).sort({ dateTaken: -1 });

    res.json({ assessments: evaluations });
  } catch (err) {
    console.error('Error fetching user assessments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFunctionWiseAverage = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) return res.status(404).json({ error: "Evaluation not found" });

    const answersMap = {};
    for (const ans of evaluation.answersGiven) {
      answersMap[ans.questionId] = ans;
    }

    const allQuestions = await NistQuestion.find({});
    const functionGroups = {};

    for (const question of allQuestions) {
      const func = question.function;
      if (!functionGroups[func]) functionGroups[func] = [];
      functionGroups[func].push(question);
    }

    const result = [];

    for (const [functionName, questions] of Object.entries(functionGroups)) {
      let totalScore = 0;

      for (const q of questions) {
        if (answersMap[q._id]) {
          totalScore += answersMap[q._id].marks || 1;
        } else {
          totalScore += 1;
        }
      }

      const average = totalScore / questions.length;
      result.push({ functionName, averageScore: average.toFixed(2) });
    }

    res.json({ result });
  } catch (err) {
    console.error("Error calculating function-wise averages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNistQuestionsWithAnswers = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    const allQuestions = await NistQuestion.find({});

    const result = allQuestions.map((question) => {
      const matchingAnswer = evaluation.answersGiven.find((ans) =>
        ans.questionId.toString() === question._id.toString()
      );

      console.log("questin is ", question.toObject().subcategoryDescription)

      return {
        questionId: question._id,
        question_text: question.questionText,
        function: question.function,
        subcategory: question.subcategory,
        subcategoryDescription: question.toObject().subcategoryDescription,
        answer: matchingAnswer ? question.toObject().answers[matchingAnswer.marks -1] : "No",
        marks: matchingAnswer ? matchingAnswer.marks : 1,
      };
    });

    res.json({ questions: result });
  } catch (err) {
    console.error("Error fetching questions with answers:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};






