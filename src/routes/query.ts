import {Router, type Router as RouterType} from "express";
import { embedText, getCompletion } from "../services/embedder";
import {pool} from "../../db";

const router: RouterType = Router();

router.post("/query", async (req, res) => {
    try {
        const { prompt, documentId } = req.body;

        const embed = await embedText(prompt);
        const embedVector = `[${embed.join(',')}]`;

        // Search top K relevant chunks using pgvector
        const result = await pool.query(
            `SELECT content
       FROM chunks
       WHERE document_id = $1
       ORDER BY embedding <-> $2::vector
       LIMIT 5`,
            [documentId, embedVector]
        );

        const context = result.rows.map(r => r.content).join("\n\n");

        const answer = await getCompletion(
            `Context:\n${context}\n\nQuestion:\n${prompt}`
        );

        res.json({ answer, retrieved: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Query failed" });
    }
});

export default router;
