import HipaaEvaluation from "../models/hipaaEvaluation.model.js";
import HipaaQuestion from "../models/hipaaQuestions.model.js";
import { OrganizationUser } from "../models/organisationUser.model.js";

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

    // Find the requesting user to get organisationName
    const requestingUser = await OrganizationUser.findById(userId);

    if (!requestingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orgName = requestingUser.organisationName;

    if (!orgName) {
      return res.status(400).json({ message: 'User does not belong to any organization' });
    }

    // Find all users in the same organization
    const orgUsers = await OrganizationUser.find({ organisationName: orgName }, '_id');

    const orgUserIds = orgUsers.map(u => u._id);

    // Fetch HIPAA evaluations for all users in the organization
    const evaluations = await HipaaEvaluation.find({ userId: { $in: orgUserIds } })
      .select('_id timeTaken status')  // include status here explicitly
      .sort({ timeTaken: -1 })
      .lean();

    const evaluationsData = evaluations.map(evaluation => ({
      ...evaluation,
      status: evaluation.status || "submitted"
    }));

    return res.status(200).json({ data: evaluationsData, success: true });
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
