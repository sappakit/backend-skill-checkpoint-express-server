export const validateQuestionData = (req, res, next) => {
  const questionData = { ...req.body };

  if (!questionData.title) {
    return res.status(400).json({
      message: "Title is required",
    });
  }

  if (!questionData.description) {
    return res.status(400).json({
      message: "Description is required",
    });
  }

  if (!questionData.category) {
    return res.status(400).json({
      message: "Category is required",
    });
  }

  next();
};

export const validateAnswerData = (req, res, next) => {
  const { content } = req.body;
  const contentTrim = content ? content.trim() : null;

  if (!contentTrim) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  if (contentTrim.length > 300) {
    return res.status(400).json({
      message: "Content must be fewer than 300 characters.",
    });
  }

  next();
};

export const validateVoteData = (req, res, next) => {
  const { vote } = req.body;

  if (!vote) {
    return res.status(400).json({
      message: "Invalid request data.",
    });
  }

  if (typeof vote !== "number") {
    return res.status(400).json({
      message: "Invalid vote value.",
    });
  }

  next();
};
