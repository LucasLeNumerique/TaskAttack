import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import todoRoutes from "./routes/todos.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);

app.get("/", (req, res) => res.json({ message: "TaskAttack API running 🚀" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));