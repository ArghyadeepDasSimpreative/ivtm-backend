import { MaturityResult } from "../models/maturityresult.model.js";

export const upsertMaturityResult = async (req, res) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { score } = req.body;

    if (typeof score !== 'number') {
      return res.status(400).json({ error: 'Score must be a number.' });
    }

    const result = await MaturityResult.findOneAndUpdate(
      { ip },
      { score, submittedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: 'Maturity result saved successfully.',
      result
    });
  } catch (error) {
    console.error('Error saving maturity result:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
