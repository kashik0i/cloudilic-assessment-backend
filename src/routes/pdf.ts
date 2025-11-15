import { Router, type Router as RouterType } from "express";
import multer from "multer";
import { extractPdfText } from "../services/pdfParser";
import { chunkText } from "../utils/chunkText";
import { embedText } from "../services/embedder";
import { vectorStore } from "../services/vectorStore";

const upload = multer();
const router: RouterType = Router();

router.post("/upload-pdf", upload.single("file"), async (req, res) => {
    try {
        const buffer = req.file?.buffer;
        if (!buffer) return res.status(400).json({ error: "No file provided" });

        const text = await extractPdfText(buffer);
        const chunks = chunkText(text);

        const items = [];
        for (const chunk of chunks) {
            const embedding = await embedText(chunk);
            items.push({ chunk, embedding });
        }

        const documentId = Date.now().toString();
        vectorStore.addDocument(documentId, items);

        res.json({ documentId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
