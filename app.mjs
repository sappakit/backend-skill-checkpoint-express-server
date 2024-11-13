import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4000;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

// Get questions
app.get("/questions", async (req, res) => {
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

// Get question by id
app.get("/questions/:id", async (req, res) => {
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
app.post("/questions", async (req, res) => {
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
app.put("/questions/:id", async (req, res) => {
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
      "UPDATE questions SET title = $2, description = $3, category= $4 WHERE id = $1 RETURNING id";

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
app.delete("/questions/:id", async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
