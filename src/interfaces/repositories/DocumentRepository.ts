import type { Document } from "../../entities/Document.entity";
import type { QueryRunner } from "typeorm";

export interface DocumentRepository {
  create(filename: string, opts?: { queryRunner?: QueryRunner }): Promise<Document>;
  findById(id: string): Promise<Document | null>;
}

export default DocumentRepository;
