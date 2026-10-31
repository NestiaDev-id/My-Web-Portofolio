import { MongoClient, type Db } from "mongodb";
import { env } from "../config/env.js";
import type { ChatMessage } from "./types.js";

interface ConversationDocument {
  _id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MessageDocument {
  id: string;
  session_id: string;
  role: ChatMessage["role"];
  content: string;
  model_used: string | null;
  tokens_used: number | null;
  created_at: string;
}

let mongoClient: MongoClient | null = null;
let mongoDatabase: Db | null = null;

function getMongoDatabase(): Db {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!mongoClient) {
    mongoClient = new MongoClient(env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
    });
  }

  mongoDatabase ??= mongoClient.db(env.MONGODB_DB_NAME);
  return mongoDatabase;
}

function messageDocument(message: ChatMessage) {
  return {
    id: message.id,
    session_id: message.sessionId,
    role: message.role,
    content: message.content,
    model_used: message.modelUsed ?? null,
    tokens_used: message.tokensUsed ?? null,
    created_at: message.createdAt,
  };
}

export async function saveMessageToMongo(message: ChatMessage): Promise<void> {
  const db = getMongoDatabase();
  const document = messageDocument(message);

  await db.collection<ConversationDocument>("conversations").updateOne(
    { _id: message.sessionId },
    {
      $setOnInsert: {
        created_at: message.createdAt,
        title: message.role === "user" ? message.content.slice(0, 80) : "Untitled",
      },
      $set: { updated_at: message.createdAt },
    },
    { upsert: true },
  );
  await db.collection<MessageDocument>("messages").insertOne(document);
}

export async function upsertConversation(
  sessionId: string,
  title = "Untitled",
): Promise<void> {
  const now = new Date().toISOString();
  const db = getMongoDatabase();

  await db.collection<ConversationDocument>("conversations").updateOne(
    { _id: sessionId },
    { $setOnInsert: { created_at: now, title }, $set: { updated_at: now } },
    { upsert: true },
  );
}

export async function getFullHistory(
  sessionId: string,
  limit = env.REDIS_MAX_HISTORY,
): Promise<ChatMessage[]> {
  const db = getMongoDatabase();
  const documents = await db
    .collection<MessageDocument>("messages")
    .find({ session_id: sessionId }, { projection: { _id: 0 } })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();

  return documents.reverse().map((document) => ({
    id: String(document.id),
    sessionId: String(document.session_id),
    role: document.role as ChatMessage["role"],
    content: String(document.content),
    modelUsed: document.model_used == null ? undefined : String(document.model_used),
    tokensUsed:
      document.tokens_used == null ? undefined : Number(document.tokens_used),
    createdAt: String(document.created_at),
  }));
}

export async function checkMongoHealth(): Promise<"connected"> {
  const db = getMongoDatabase();
  await db.command({ ping: 1 });
  return "connected";
}
