import { type VectorStoreItem } from "../types";

export class VectorStore {
    private store: Record<string, VectorStoreItem[]> = {};

    addDocument(id: string, items: VectorStoreItem[]) {
        this.store[id] = items;
    }

    getDocument(id: string) {
        return this.store[id] || [];
    }
}

export const vectorStore = new VectorStore();
