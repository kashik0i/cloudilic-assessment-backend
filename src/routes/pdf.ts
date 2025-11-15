import {Router, type Router as RouterType} from "express";
import multer from "multer";
import {embedText} from "../services/embedder";
import {chunkText} from "../utils/chunkText";
import {pool} from "../../db";
import {extractPdfText} from "../services/pdfParser";

const upload = multer();
const router: RouterType = Router();

router.post("/upload-pdf", upload.single("file"), async (req, res) => {
    try {
        if (!req.file?.buffer) return res.status(400).json({error: "Missing PDF"});

        const documentId = Date.now().toString();
        await pool.query(
            `INSERT INTO documents(id, filename)
             VALUES ($1, $2)`,
            [documentId, req.file.originalname]
        );

        const parsed = await extractPdfText(req.file.buffer);
        const chunks = chunkText(parsed);

        for (const chunk of chunks) {
            const embedding = await embedText(chunk);
            // Convert number[] -> pgvector literal string "[v1,v2,...]"
            const embeddingVector = `[${embedding.join(',')}]`;

            await pool.query(
                `INSERT INTO chunks (document_id, content, embedding)
                 VALUES ($1, $2, $3::vector)`,
                [documentId, chunk, embeddingVector]
            );
        }

        res.json({documentId, chunkCount: chunks.length});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Upload failed"});
    }
});

export default router;
