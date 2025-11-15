import {type Router as RouterType, Router} from "express";
import { embedText, getCompletion } from "../services/embedder";
import { vectorStore } from "../services/vectorStore";
import { cosineSimilarity } from "../services/vectorSearch";

const router: RouterType = Router();

router.post("/query", async (req, res) => {
    try {
        const { prompt, documentId } = req.body;

        const doc = vectorStore.getDocument(documentId);
        if (!doc) return res.status(404).json({ error: "Document not found" });

        const promptEmbedding = await embedText(prompt);

        const ranked = doc
            .map(item => ({
                ...item,
                score: cosineSimilarity(promptEmbedding, item.embedding),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        const context = ranked.map(r => r.chunk).join("\n\n");

        const answer = await getCompletion(
            `Context:\n${context}\n\nQuestion:\n${prompt}`
        );

        res.json({ answer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
