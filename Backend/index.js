import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./routes/admin.route.js";
import notificationRoute from "./routes/notification.route.js";
import aiRoute from "./routes/ai.route.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({});
const app = express();

// middleware

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corosOptions = {
  origin: ["http://localhost:5173"],
  credentials: true,
};

app.use(cors(corosOptions));

const PORT = process.env.PORT || 5001;

// View Resume in browser
app.get("/api/resume/view/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Resume file not found");
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  res.sendFile(filePath);
});

// Download Resume
app.get("/api/resume/download/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(__dirname, "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Resume file not found");
  }

  res.download(filePath, filename);
});

//api's

app.use("/api/users", userRoute);
app.use("/api/company", companyRoute);
app.use("/api/job", jobRoute);
app.use("/api/application", applicationRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoute);
app.use("/api/ai", aiRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`server is running on port ${PORT}`);
});
