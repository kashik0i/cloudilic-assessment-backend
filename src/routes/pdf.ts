import {Router, type Router as RouterType} from "express";
import multer from "multer";
import {embedTextCached} from "../services/embedder";
import {chunkText} from "../utils/chunkText";
import {pool} from "../../db";
import {extractPdfText} from "../services/pdfParser";

// Configure multer to accept any field name but only one PDF file, in memory.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 50 * 1024 * 1024, files: 1}, // 20MB cap, single file
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only application/pdf files are allowed"));
        }
        cb(null, true);
    }
});

const router: RouterType = Router();

router.post(
    "/upload-pdf",
    (req, res, next) => {
        // Accept any field name to avoid Unexpected field errors; we'll validate count & type.
        const anyMiddleware = upload.any();
        anyMiddleware(req, res, (err: any) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    // Map common Multer codes to clearer messages.
                    const codeMap: Record<string, string> = {
                        LIMIT_FILE_SIZE: "File too large (max 50MB)",
                        LIMIT_FILE_COUNT: "Only one file allowed",
                        LIMIT_UNEXPECTED_FILE: "Unexpected file type or field"
                    };
                    return res.status(400).json({error: codeMap[err.code] || `Upload error: ${err.code}`});
                }
                return res.status(400).json({error: err.message || "Upload failed"});
            }
            next();
        });
    },
    async (req, res) => {
        // At this point req.files is an array when using any().
        const files = req.files as Express.Multer.File[] | undefined;
        if (!files || files.length === 0) {
            return res.status(400).json({error: "Missing PDF. Send multipart/form-data with a PDF file."});
        }
        if (files.length > 1) {
            return res.status(400).json({error: "Only one PDF file is allowed"});
        }
        const file = files[0];
        if (!file) {
            return res.status(400).json({error: "File not present after upload parsing"});
        }
        if (file.mimetype !== "application/pdf") {
            return res.status(400).json({error: "Invalid mimetype. Expected application/pdf"});
        }
        if (!file.buffer) {
            return res.status(400).json({error: "File buffer missing"});
        }

        const documentId = Date.now().toString();
        let committed = false;
        try {
            await pool.query("BEGIN");
            await pool.query(
                `INSERT INTO documents(id, filename) VALUES ($1, $2)`,
                [documentId, file.originalname]
            );

            const parsed = await extractPdfText(file.buffer);
            const chunks = chunkText(parsed);

            for (const chunk of chunks) {
                const embedding = await embedTextCached(chunk);
                const embeddingVector = `[${embedding.join(',')}]`;
                await pool.query(
                    `INSERT INTO chunks (document_id, content, embedding) VALUES ($1, $2, $3::vector)`,
                    [documentId, chunk, embeddingVector]
                );
            }

            await pool.query("COMMIT");
            committed = true;
            res.json({documentId, chunkCount: chunks.length});
        } catch (err: any) {
            console.error(err);
            if (!committed) {
                try { await pool.query("ROLLBACK"); } catch (rbErr) { console.error("Rollback failed", rbErr); }
            }
            res.status(500).json({error: "Upload failed"});
        }
    }
);

export default router;
