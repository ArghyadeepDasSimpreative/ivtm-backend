import { NistEvaluation } from '../models/nistEvaluation.model.js';
import { NistQuestion } from '../models/nistQuestions.model.js';
import { NistAnswer } from '../models/nistAnswer.model.js';
import mongoose from 'mongoose';

export const createNistEvaluation = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { evaluationId, answers, status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID missing.' });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    let evaluation;

    if (evaluationId) {
      // Update existing evaluation
      evaluation = await NistEvaluation.findById(evaluationId);

      if (!evaluation) {
        return res.status(404).json({ message: 'Evaluation not found.' });
      }

      evaluation.evaluationTime = new Date();
      evaluation.status = status == true ? "submitted" : "draft"
      await evaluation.save();

      // // Remove previous answers for this evaluation
      // await NistAnswer.deleteMany({ evaluationId });
    } else {
      // Create new evaluation
      evaluation = await NistEvaluation.create({
        userId,
        evaluationTime: new Date(),
        status: status || 'draft'
      });
    }

    // Insert new answers
    const formattedAnswers = answers.map((a) => ({
      evaluationId: evaluation._id,
      questionId: a.questionId,
      marks: a.marks,
      functionName: a.functionName
    }));

    await NistAnswer.insertMany(formattedAnswers);

    return res.status(200).json({
      message: evaluationId
        ? 'NIST evaluation updated successfully.'
        : 'NIST evaluation created successfully.',
      data: {
        evaluationId: evaluation._id,
        status: evaluation.status
      }
    });
  } catch (error) {
    console.error('❌ Error saving/updating NIST evaluation:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const updateEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const { status, answers } = req.body;

    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: 'Evaluation not found' });
    }

    // Update evaluation status
    evaluation.status = status == true ? "submitted": "draft";
    await evaluation.save();

    const bulkOperations = answers.map((ans) => ({
      updateOne: {
        filter: {
          evaluationId,
          questionId: ans.questionId,
        },
        update: {
          $set: {
            ...ans,
            evaluationId,
          },
        },
        upsert: true, // if not found, insert it
      },
    }));

    await NistAnswer.bulkWrite(bulkOperations);

    res.status(200).json({ message: 'Evaluation updated successfully', 
      data: {
        evaluationId: evaluation._id
      }
     });
  } catch (error) {
    console.error('Error updating evaluation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNistEvaluationStats = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
      return res.status(400).json({ success: false, message: 'Invalid evaluation ID' });
    }

    // Fetch evaluation
    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    // Get all answers for this evaluation
    const answersGiven = await NistAnswer.find({ evaluationId: evaluation._id });

    // Fetch question counts per function
    const questionCounts = await NistQuestion.aggregate([
      {
        $group: {
          _id: '$function',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalQuestionsPerFunction = {};
    let totalQuestions = 0;

    questionCounts.forEach(q => {
      const key = q._id?.toLowerCase?.() || 'unknown';
      totalQuestionsPerFunction[key] = q.count;
      totalQuestions += q.count;
    });

    // Calculate marks
    const attendedMarks = answersGiven.reduce((sum, ans) => sum + (ans?.marks || 0), 0);
    const unansweredCount = totalQuestions - answersGiven.length;
    const defaultMarksForUnanswered = unansweredCount > 0 ? unansweredCount * 1 : 0;

    const totalMarks = attendedMarks + defaultMarksForUnanswered;
    const average = totalQuestions > 0 ? totalMarks / totalQuestions : 0;

    // Final response
    return res.status(200).json({
      success: true,
      data: {
        evaluationId,
        userId: evaluation.userId,
        totalQuestions,
        totalMarks,
        average: Number(average.toFixed(2)),
        totalQuestionsPerFunction,
        answersGiven,
      },
    });
  } catch (error) {
    console.error('❌ Error calculating evaluation stats:', error);
    return res.status(500).json({ success: false, message: 'Server error while calculating stats' });
  }
};


export const getFunctionWiseAnswers = async (req, res) => {
  try {
    const { evaluationId, functionName } = req.params;

    if (!functionName) {
      return res.status(400).json({ success: false, message: 'functionName is required in params' });
    }

    const [questions, evaluation] = await Promise.all([
      NistQuestion.find({ function: functionName }),
      NistEvaluation.findById(evaluationId),
    ]);

    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    const answerMap = {};
    evaluation.answersGiven.forEach(ans => {
      answerMap[ans.questionId.toString()] = ans;
    });

    const result = questions.map(q => {
      const existing = answerMap[q._id.toString()];
      const selectedAnswer = existing ? q.answers?.[existing.marks - 1] : 'No';
      return {
        questionId: q._id,
        question: q.questionText,
        marks: existing ? existing.marks : 1,
        answer: selectedAnswer,
        options: q.answers,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        functionName,
        totalQuestions: result.length,
        answers: result,
      },
    });
  } catch (err) {
    console.error('❌ Error fetching function-wise answers:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAssessmentsByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const evaluations = await NistEvaluation.find(
      { userId },
      { answersGiven: 0 }
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: evaluations,
    });
  } catch (err) {
    console.error('❌ Error fetching user assessments:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getFunctionWiseAverage = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    const answersMap = {};
    evaluation.answersGiven.forEach(ans => {
      answersMap[ans.questionId.toString()] = ans;
    });

    const allQuestions = await NistQuestion.find({});
    const grouped = {};

    allQuestions.forEach(q => {
      if (!grouped[q.function]) grouped[q.function] = [];
      grouped[q.function].push(q);
    });

    const result = Object.entries(grouped).map(([func, questions]) => {
      const totalScore = questions.reduce((sum, q) => {
        const ans = answersMap[q._id.toString()];
        return sum + (ans ? ans.marks : 1);
      }, 0);
      return {
        functionName: func,
        averageScore: (totalScore / questions.length).toFixed(2),
      };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error calculating function-wise averages:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getNistQuestionsWithAnswers = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    const evaluation = await NistEvaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: 'Evaluation not found' });
    }

    const allQuestions = await NistQuestion.find({});
    const answerMap = {};
    evaluation.answersGiven.forEach(ans => {
      answerMap[ans.questionId.toString()] = ans;
    });

    const result = allQuestions.map(q => {
      const ans = answerMap[q._id.toString()];
      return {
        questionId: q._id,
        question_text: q.questionText,
        function: q.function,
        subcategory: q.subcategory,
        subcategoryDescription: q.subcategoryDescription,
        answer: ans ? q.answers?.[ans.marks - 1] : 'No',
        marks: ans ? ans.marks : 1,
        options: q.answers,
      };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error fetching questions with answers:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
