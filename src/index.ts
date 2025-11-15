import express from "express";
import cors from "cors";
import "dotenv/config";
import pdfRoutes from "./routes/pdf";
import queryRoutes from "./routes/query";
import chatRoutes from "./routes/chat";
// import workflowRoutes from "./routes/workflow";
// import documentsRoutes from "./routes/documents";
import { pool } from "../db";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ ok: true });
    } catch {
        res.status(500).json({ ok: false });
    }
});

app.use("/api", pdfRoutes);
app.use("/api", queryRoutes);
app.use("/api", chatRoutes);
// app.use("/api", workflowRoutes);
// app.use("/api", documentsRoutes);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
    console.log("Server running on port", port);
});
