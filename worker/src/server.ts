import express from "express";
import cors from "cors";
import createJobRouter from "./routes/job-create";
import jobStatusRouter from "./routes/job-status";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/generate", createJobRouter); 
app.use("/status", jobStatusRouter);

app.get('/health', (req, res) => {
  res.status(200).json({
    message: "Health is OK",
  });
});

export default app;
