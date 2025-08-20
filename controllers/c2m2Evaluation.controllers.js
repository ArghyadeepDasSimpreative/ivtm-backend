import mongoose from "mongoose";
import C2m2Answer from "../models/c2m2Answer.model.js";
import { C2m2Evaluation } from "../models/c2m2Evaluation.model.js";
import C2m2Question from "../models/c2m2Question.model.js";
import { OrganizationUser } from "../models/organisationUser.model.js";

export const createC2m2Evaluation = async (req, res) => {
  try {
    const { answers, status } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    // 1️⃣ Create evaluation entry
    const evaluation = await C2m2Evaluation.create({
      userId: req.user?._id,
      status: status ? "submitted" : "draft"
    });

    // 2️⃣ Save answers linked to this evaluation
    const formattedAnswers = answers.map(a => ({
      evaluationId: evaluation._id,
      questionId: a.questionId,
      primary: a.primary || "No",
      followUp: a.followUp || "",
      marks: a.marks ?? 0,
      domain: a.domain,
      submittedBy: req.user?._id
    }));

    await C2m2Answer.insertMany(formattedAnswers);

    // 3️⃣ Calculate average score
    const totalMarks = formattedAnswers.reduce((sum, a) => sum + (a.marks || 0), 0);
    const averageScore = totalMarks / formattedAnswers.length;

    evaluation.averageScore = averageScore;
    await evaluation.save();

    return res.status(200).json({
      message: "Evaluation created and first answers saved",
      data: evaluation
    });
  } catch (err) {
    console.error("Error creating C2M2 evaluation:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const updateC2m2Evaluation = async (req, res) => {
  try {
    const { id } = req.params; // evaluationId
    const { answers, status } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Answers array is required" });
    }

    const evaluation = await C2m2Evaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluation not found" });
    }

    // Upsert each answer
    for (const ans of answers) {
      await C2m2Answer.findOneAndUpdate(
        { evaluationId: id, questionId: ans.questionId },
        {
          $set: {
            primary: ans.primary || "No",
            followUp: ans.followUp || "",
            marks: ans.marks ?? 0,
            domain: ans.domain,
            submittedBy: req.user?._id
          }
        },
        { upsert: true, new: true }
      );

    }

    // Recalculate average score
    const allAnswers = await C2m2Answer.find({ evaluationId: id });
    const totalMarks = allAnswers.reduce((sum, a) => sum + (a.marks || 0), 0);
    const averageScore = totalMarks / allAnswers.length;

    evaluation.averageScore = averageScore;
    if (status) evaluation.status = status ? "submitted" : "draft";
    console.log("evaluation stats is ", evaluation.status)
    await evaluation.save();

    return res.status(200).json({
      message: "Evaluation updated successfully",
      evaluationId: id,
      averageScore
    });
  } catch (err) {
    console.error("Error updating C2M2 evaluation:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

export const getUserC2m2Evaluations = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find the requesting user to get organisationName
    const requestingUser = await OrganizationUser.findById(userId);

    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const orgName = requestingUser.organisationName;

    if (!orgName) {
      return res.status(400).json({ message: "User does not belong to any organization" });
    }

    // Find all users in the same organization
    const orgUsers = await OrganizationUser.find({ organisationName: orgName }, '_id');

    const orgUserIds = orgUsers.map(u => u._id);

    // Fetch C2M2 evaluations for all users in the organization
    const evaluations = await C2m2Evaluation.find({ userId: { $in: orgUserIds } })
      .select("_id evaluationTime status averageScore")
      .sort({ evaluationTime: -1 })
      .lean();

    return res.status(200).json({
      data: evaluations,
      success: true
    });

  } catch (error) {
    console.error("Error fetching user C2M2 evaluations:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getC2m2QuestionsWithAnswers = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    console.log("evluation id is ", evaluationId)

    if (!mongoose.Types.ObjectId.isValid(evaluationId)) {
      return res.status(400).json({ success: false, message: "Invalid evaluation ID" });
    }

    const evaluation = await C2m2Evaluation.findById(evaluationId);
    console.log("evaluation found is xxx ", evaluation)
    if (!evaluation) {
      console.log("evaluation not found is ", !evaluation)
      return res.status(404).json({ success: false, message: "Evaluation not found" });
    }

    const allQuestions = await C2m2Question.find({}).lean();

    const answers = await C2m2Answer.find({ evaluationId }).lean();

    const answerMap = new Map();
    answers.forEach(ans => {
      answerMap.set(ans.questionId.toString(), ans);
    });

    const result = allQuestions.map(q => {
      const ans = answerMap.get(q._id.toString());

      const answerExists = Boolean(ans)

      return {
        questionId: q._id,
        practice: q.practice,         // from schema
        practiceText: q.practiceText, // from schema
        domain: q.domain,             // domain name
        answer: answerExists ? ans.marks == 0 ? "No" : "Yes" : "No",
        marks: ans?.marks,       // default 0 if unanswered
        options: ["No", "Yes"]
      };
    });

    // 6️⃣ Send response
    return res.status(200).json({ success: true, data: result });

  } catch (err) {
    console.error("❌ Error fetching C2M2 questions with answers:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getDomainWiseAverage = async (req, res) => {
  try {
    const { evaluationId } = req.params;

    // 1️⃣ Validate evaluation exists
    const evaluation = await C2m2Evaluation.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ success: false, message: "Evaluation not found" });
    }

    // 2️⃣ Fetch all answers for the evaluation
    const answers = await C2m2Answer.find({ evaluationId });
    const answersMap = {};
    answers.forEach(ans => {
      answersMap[ans.questionId.toString()] = ans;
    });

    // 3️⃣ Fetch all questions
    const allQuestions = await C2m2Question.find({});

    // 4️⃣ Group questions by Domain
    const groupedByDomain = {};
    for (const question of allQuestions) {
      const domain = question.Domain || "UNKNOWN";
      if (!groupedByDomain[domain]) groupedByDomain[domain] = [];
      groupedByDomain[domain].push(question);
    }

    // 5️⃣ Calculate averages per domain
    const result = Object.entries(groupedByDomain).map(([domainName, questions]) => {
      let totalScore = 0;

      for (const q of questions) {
        const answer = answersMap[q._id.toString()];
        totalScore += answer?.marks ?? 1; // Default mark if unanswered
      }

      const averageScore = questions.length
        ? (totalScore / questions.length).toFixed(2)
        : "0.00";

      return { domainName, averageScore };
    });

    // 6️⃣ Return response
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    console.error("❌ Error calculating domain-wise averages:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export async function hasDraftAssessment(req,res) {
  try {
    const userId = req.user._id;
    const draftExists = await C2m2Evaluation.exists({ userId, status: 'draft' });
    return res.status(200).json({status: Boolean(draftExists)});
  } catch (error) {
    console.error('Error checking draft status:', error);
    return false;
  }
}
