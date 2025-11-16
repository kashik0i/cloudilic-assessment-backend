import { DataSource, QueryRunner } from "typeorm";
import { Document } from "../entities";
import type { DocumentRepository as IDocumentRepository } from "../interfaces/repositories/DocumentRepository";

export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly ds: DataSource) {}

  async create(
    filename: string,
    opts?: { queryRunner?: QueryRunner }
  ): Promise<Document> {
    const repo = (opts?.queryRunner?.manager ?? this.ds).getRepository(Document);
    const doc = repo.create({ id: Date.now().toString(), filename });
    return repo.save(doc);
  }

  async findById(id: string): Promise<Document | null> {
    return this.ds.getRepository(Document).findOne({ where: { id } });
  }
}
