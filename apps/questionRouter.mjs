import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import {
  validateQuestionData,
  validateAnswerData,
  validateVoteData,
} from "../middlewares/dataValidation.mjs";

const questionRouter = Router();

// Get questions
questionRouter.get("/", async (req, res) => {
  try {
    const sqlQuery = "SELECT * FROM questions";

    const results = await connectionPool.query(sqlQuery);

    return res.status(200).json({
      data: results.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

// Get question by title or category
questionRouter.get("/search", async (req, res) => {
  try {
    const title = req.query.title;
    const category = req.query.category;

    let sqlQuery = "SELECT * FROM questions";
    const condition = [];
    const values = [];

    if (title) {
      condition.push(
        `(title ILIKE $${values.length + 1} OR description ILIKE $${
          values.length + 1
        })`
      );
      values.push(`%${title}%`);
    }

    if (category) {
      condition.push(`category ILIKE $${values.length + 1}`);
      values.push(`%${category}%`);
    }

    if (condition.length > 0) {
      sqlQuery += " WHERE " + condition.join(" AND ");
    }

    const results = await connectionPool.query(sqlQuery, values);

    if (results.rowCount === 0) {
      return res.status(400).json({
        message: "Invalid search parameters.",
      });
    }

    return res.status(200).json({
      data: results.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch a question.",
    });
  }
});

// Get question by id
questionRouter.get("/:id", async (req, res) => {
  try {
    const questionIdFromClient = req.params.id;

    const sqlQuery = "SELECT * FROM questions WHERE id = $1";
    const values = [questionIdFromClient];

    const results = await connectionPool.query(sqlQuery, values);

    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      data: results.rows[0],
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch questions.",
    });
  }
});

// Post question
questionRouter.post("/", [validateQuestionData], async (req, res) => {
  try {
    const newQuestion = { ...req.body };

    const sqlQuery =
      "INSERT INTO questions (title, description, category) VALUES ($1, $2, $3)";

    const values = [
      newQuestion.title,
      newQuestion.description,
      newQuestion.category,
    ];

    await connectionPool.query(sqlQuery, values);

    return res.status(201).json({
      message: "Question created successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to create question.",
    });
  }
});

// Update question
questionRouter.put("/:id", [validateQuestionData], async (req, res) => {
  try {
    const questionIdFromClient = req.params.id;
    const updatedQuestion = { ...req.body };

    const checkQuestionId = await connectionPool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionIdFromClient]
    );

    if (checkQuestionId.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    const sqlQuery =
      "UPDATE questions SET title = $2, description = $3, category = $4 WHERE id = $1 RETURNING id";

    const values = [
      questionIdFromClient,
      updatedQuestion.title,
      updatedQuestion.description,
      updatedQuestion.category,
    ];

    await connectionPool.query(sqlQuery, values);

    return res.status(200).json({
      message: "Question updated successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to update questions.",
    });
  }
});

// Delete question
questionRouter.delete("/:id", async (req, res) => {
  try {
    const questionIdFromClient = req.params.id;

    const checkQuestionId = await connectionPool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionIdFromClient]
    );

    if (checkQuestionId.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    await connectionPool.query("DELETE FROM questions WHERE id = $1", [
      questionIdFromClient,
    ]);

    return res.status(200).json({
      message: "Question post has been deleted successfully.",
    });
  } catch {
    return res.status(500).json({
      message: "Unable to delete question.",
    });
  }
});

// Get question answers
questionRouter.get("/:questionId/answers", async (req, res) => {
  try {
    const questionIdFromClient = req.params.questionId;

    const sqlQuery = `
      SELECT questions.id, answers.content
      FROM questions
      INNER JOIN answers ON questions.id = answers.question_id
      WHERE questions.id = $1
    `;

    const values = [questionIdFromClient];

    const results = await connectionPool.query(sqlQuery, values);

    if (results.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      data: results.rows,
    });
  } catch {
    return res.status(500).json({
      message: "Unable to fetch answers.",
    });
  }
});

// Post answer
questionRouter.post(
  "/:questionId/answers",
  [validateAnswerData],
  async (req, res) => {
    try {
      const questionIdFromClient = req.params.questionId;

      const checkQuestionId = await connectionPool.query(
        "SELECT * FROM questions WHERE id = $1",
        [questionIdFromClient]
      );

      if (checkQuestionId.rowCount === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }

      const { content } = req.body;

      const sqlQuery = `
        INSERT INTO answers (question_id, content)
        VALUES ($1, $2)
    `;

      const values = [questionIdFromClient, content];

      await connectionPool.query(sqlQuery, values);

      return res.status(201).json({
        message: "Answer created successfully.",
      });
    } catch {
      return res.status(500).json({
        message: "Unable to create answers.",
      });
    }
  }
);

// Like/Dislike question
questionRouter.post(
  "/:questionId/vote",
  [validateVoteData],
  async (req, res) => {
    try {
      const questionIdFromClient = req.params.questionId;

      const checkQuestionId = await connectionPool.query(
        "SELECT * FROM question_votes WHERE question_id = $1",
        [questionIdFromClient]
      );

      if (checkQuestionId.rowCount === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }

      const { vote } = req.body;

      const sqlQuery = `INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)`;

      const values = [questionIdFromClient, vote];

      await connectionPool.query(sqlQuery, values);

      return res.status(200).json({
        message: "Vote on the question has been recorded successfully.",
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "Unable to vote question.",
      });
    }
  }
);

export default questionRouter;
