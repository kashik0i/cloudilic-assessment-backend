import {Router, type Router as RouterType} from "express";
import multer from "multer";
import {chunkText} from "../utils/chunkText";
import { AppDataSource } from "../config/database";
import { withTransaction } from "../repositories/transaction";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 50 * 1024 * 1024, files: 1},
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
        const anyMiddleware = upload.any();
        anyMiddleware(req, res, (err: any) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    const codeMap: Record<string, string> = {
                        LIMIT_FILE_SIZE: "File too large (max 50MB)",
                        LIMIT_FILE_COUNT: "Only one file allowed",
                        LIMIT_UNEXPECTED_FILE: "Unexpected file type or field"
                    };
                    req.log?.warn({ err, code: err.code }, "Multer upload error");
                    return res.status(400).json({error: codeMap[err.code] || `Upload error: ${err.code}`});
                }
                req.log?.warn({ err }, "Upload failed");
                return res.status(400).json({error: err.message || "Upload failed"});
            }
            next();
        });
    },
    async (req, res, next) => {
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

        try {
            // Resolve services from container
            const pdfParser = req.container?.services.pdfParser;
            const embedder = req.container?.services.embedder;
            const { documents, chunks } = req.container!.repos;
            if (!pdfParser || !embedder) {
                throw new Error("Services not initialized");
            }

            req.log?.info({ filename: file.originalname, size: file.size }, "Parsing uploaded PDF");
            const parsed = await pdfParser.parse(file.buffer);
            const textChunks = chunkText(parsed);
            req.log?.info({ chunkCount: textChunks.length }, "Embedding chunks");

            const { documentId, chunkCount } = await withTransaction(AppDataSource, async (qr) => {
                const doc = await documents.create(file.originalname, { queryRunner: qr });
                const vectorized = [] as Array<{ documentId: string; content: string; embedding: number[] }>;
                for (const c of textChunks) {
                    const e = await embedder.embedCached(c);
                    vectorized.push({ documentId: doc.id, content: c, embedding: e });
                }
                await chunks.insertMany(vectorized, { queryRunner: qr });
                return { documentId: doc.id, chunkCount: vectorized.length };
            });

            req.log?.info({ documentId, chunkCount }, "PDF ingested successfully");
            res.json({ documentId, chunkCount });
        } catch (err: any) {
            req.log?.error({ err }, "Error handling PDF upload");
            return next(err);
        }
    }
);

export default router;
