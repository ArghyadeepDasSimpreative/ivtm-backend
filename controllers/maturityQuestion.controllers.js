import { MaturityQuestion } from "../models/MaturityQuestion.model.js";

export const createMaturityQuestion = async (req, res) => {
  try {
    const {
      questionText,
      options,
      isInitial = false,
      domain,
      category,
      subcategory,
    } = req.body;

    if (!questionText || typeof questionText !== 'string') {
      return res.status(400).json({ error: 'questionText is required and must be a string.' });
    }

    if (!Array.isArray(options) || options.length === 0 || options.some(opt => typeof opt !== 'string')) {
      return res.status(400).json({ error: 'options must be a non-empty array of strings.' });
    }

    const validDomains = ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'];
    if (!domain || !validDomains.includes(domain)) {
      return res.status(400).json({ error: `domain must be one of: ${validDomains.join(', ')}` });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'category is required and must be a string.' });
    }

    if (!subcategory || typeof subcategory !== 'string') {
      return res.status(400).json({ error: 'subcategory is required and must be a string.' });
    }

    // --- Create and Save the question ---
    const question = new MaturityQuestion({
      questionText,
      options,
      isInitial,
      domain,
      category,
      subcategory,
    });

    await question.save();

    return res.status(201).json({ message: 'Maturity question created successfully.', question });
  } catch (error) {
    console.error('Error creating maturity question:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
