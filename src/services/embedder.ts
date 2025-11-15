import OpenAI from "openai";
import "dotenv/config";
import { getOrEmbed } from './embedCache';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
});

export async function embedText(text: string): Promise<number[]> {
    const res = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });

    if (!res.data[0]) {
        throw new Error("No embedding returned from OpenAI");
    }

    return res.data[0].embedding;
}

export async function getCompletion(prompt: string): Promise<string> {
    const res = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
            { role: "system", content: "Use ONLY the provided context to answer." },
            { role: "user", content: prompt }
        ]
    });

    if (!res.choices[0]) {
        throw new Error("No completion returned from OpenAI");
    }

    return res.choices[0].message.content ?? "";
}

export async function embedTextCached(text: string): Promise<number[]> {
    return getOrEmbed(text);
}
