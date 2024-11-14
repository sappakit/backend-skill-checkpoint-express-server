import express from "express";
import questionRouter from "./apps/questionRouter.mjs";
import answerRouter from "./apps/answerRouter.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use("/questions", questionRouter);
app.use("/answers", answerRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
