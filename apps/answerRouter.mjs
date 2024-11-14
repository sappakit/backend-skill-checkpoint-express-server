import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateVoteData } from "../middlewares/questionValidation.mjs";

const answerRouter = Router();

// Like/Dislike answer
answerRouter.post("/:answerId/vote", [validateVoteData], async (req, res) => {
  try {
    const answerIdFromClient = req.params.answerId;

    const checkAnswerId = await connectionPool.query(
      "SELECT * FROM answer_votes WHERE answer_id = $1",
      [answerIdFromClient]
    );

    if (checkAnswerId.rowCount === 0) {
      return res.status(404).json({
        message: "Answer not found.",
      });
    }

    const { vote } = req.body;

    const sqlQuery = `INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2)`;

    const values = [answerIdFromClient, vote];

    await connectionPool.query(sqlQuery, values);

    return res.status(200).json({
      message: "Vote on the answer has been recorded successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to vote answer.",
    });
  }
});

export default answerRouter;
