import express from "express";
import cors from "cors";
import pdfRoutes from "./routes/pdf";
import queryRoutes from "./routes/query";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", pdfRoutes);
app.use("/api", queryRoutes);

app.listen(process.env.PORT, () => {
    console.log("Server running on port", process.env.PORT);
});
