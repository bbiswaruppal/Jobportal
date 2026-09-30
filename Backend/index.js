import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Utils/db.js";
dotenv.config({})
const app = express();



// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corosOptions = {
  origin: ["http://localhost:5121"],
  Credentials: true,
};

app.use(cors(corosOptions));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    connectDB();
  console.log(`server is running on port ${PORT}`);
});
