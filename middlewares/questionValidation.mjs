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
