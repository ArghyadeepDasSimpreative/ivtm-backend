import HipaaEvaluation from "../models/hipaaEvaluation.model.js";
import HipaaQuestion from "../models/hipaaQuestions.model.js";
import mongoose from 'mongoose';

export const recordHipaaEvaluation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const answers = req.body.answers;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers array is required and cannot be empty.' });
    }

    const evaluation = new HipaaEvaluation({
      userId,
      timeTaken: new Date(),
      answers,
    });

    await evaluation.save();

    res.status(201).json({
      message: 'HIPAA evaluation recorded successfully.',
      evaluationId: evaluation._id,
    });
  } catch (error) {
    console.error('Error recording HIPAA evaluation:', error);
    res.status(500).json({
      message: 'Failed to record evaluation.',
      error: error.message,
    });
  }
};

export const getUserHipaaEvaluations = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const evaluations = await HipaaEvaluation.find({ userId }).select('_id timeTaken').sort({ timeTaken: -1 });

    return res.status(200).json(evaluations);
  } catch (error) {
    console.error('Error fetching user evaluations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getEvaluationDetails = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await HipaaEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    const answersWithQuestions = await Promise.all(
      evaluation.answers.map(async (answer) => {
        const question = await HipaaQuestion.findById(answer.questionId);
        if (!question) return null;

        return {
          questionId: question._id,
          questionText: question.question,
          description: question.description,
          selectedAnswer: answer.questionAnswer,
          marks: answer.marks,
          category: question.category,
          options: question.score,
        };
      })
    );

    const filteredAnswers = answersWithQuestions.filter(Boolean); // Remove nulls

    const categoryWise = {};
    let totalMarks = 0;

    filteredAnswers.forEach((ans) => {
      totalMarks += ans.marks;
      if (!categoryWise[ans.category]) {
        categoryWise[ans.category] = {
          total: 0,
          count: 0,
        };
      }
      categoryWise[ans.category].total += ans.marks;
      categoryWise[ans.category].count += 1;
    });

    const categoryAverages = Object.entries(categoryWise).map(([category, { total, count }]) => ({
      category,
      average: (total / count).toFixed(2),
    }));

    const totalAverage = (totalMarks / filteredAnswers.length).toFixed(2);

    return res.status(200).json({
      evaluationId: evaluation._id,
      userId: evaluation.userId,
      timeTaken: evaluation.timeTaken,
      answers: filteredAnswers,
      categoryAverages,
      totalAverage,
    });
  } catch (error) {
    console.error('Error fetching evaluation details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
