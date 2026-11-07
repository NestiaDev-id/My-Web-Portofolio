import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { getRedisClient } from "./redis.service.js";

const ACTIVE_SLOTS_KEY = "hf:concurrency:active_slots";
const WAITING_QUEUE_KEY = "hf:queue:waiting";
const LEASE_TTL_SECONDS = 60;

const tryAcquireScript = `
  local activeKey = KEYS[1]
  local queueKey = KEYS[2]
  local maxConcurrency = tonumber(ARGV[1])
  local leaseTtl = tonumber(ARGV[2])
  local reqId = ARGV[3]
  local now = tonumber(ARGV[4])
  local threshold = now - leaseTtl

  -- Clean up stale active slots
  redis.call("ZREMRANGEBYSCORE", activeKey, 0, threshold)

  local currentActive = redis.call("ZCARD", activeKey)
  local currentQueue = redis.call("ZCARD", queueKey)

  -- If no one is waiting and slots are free, acquire immediately
  if currentQueue == 0 and currentActive < maxConcurrency then
    redis.call("ZADD", activeKey, now, reqId)
    redis.call("EXPIRE", activeKey, leaseTtl * 2)
    return 1
  end

  -- Otherwise join or remain in waiting queue
  local pos = redis.call("ZRANK", queueKey, reqId)
  if not pos then
    redis.call("ZADD", queueKey, now, reqId)
    redis.call("EXPIRE", queueKey, leaseTtl * 2)
    pos = redis.call("ZRANK", queueKey, reqId)
  end

  -- Return negative 1-based position (e.g. -1 for #1, -2 for #2)
  return -(pos + 1)
`;

const pollQueueScript = `
  local activeKey = KEYS[1]
  local queueKey = KEYS[2]
  local maxConcurrency = tonumber(ARGV[1])
  local leaseTtl = tonumber(ARGV[2])
  local reqId = ARGV[3]
  local now = tonumber(ARGV[4])
  local threshold = now - leaseTtl

  -- Clean up stale active slots
  redis.call("ZREMRANGEBYSCORE", activeKey, 0, threshold)

  local currentActive = redis.call("ZCARD", activeKey)
  local firstMember = redis.call("ZRANGE", queueKey, 0, 0)

  -- If this request is first in queue and slot is available
  if firstMember[1] == reqId and currentActive < maxConcurrency then
    redis.call("ZREM", queueKey, reqId)
    redis.call("ZADD", activeKey, now, reqId)
    redis.call("EXPIRE", activeKey, leaseTtl * 2)
    return 1
  end

  local pos = redis.call("ZRANK", queueKey, reqId)
  if not pos then
    redis.call("ZADD", queueKey, now, reqId)
    pos = redis.call("ZRANK", queueKey, reqId)
  end

  return -(pos + 1)
`;

const releaseSlotScript = `
  local activeKey = KEYS[1]
  local queueKey = KEYS[2]
  local reqId = ARGV[1]

  redis.call("ZREM", activeKey, reqId)
  redis.call("ZREM", queueKey, reqId)
  return 1
`;

const queueStatusScript = `
  local activeKey = KEYS[1]
  local queueKey = KEYS[2]
  local leaseTtl = tonumber(ARGV[1])
  local now = tonumber(ARGV[2])
  local threshold = now - leaseTtl

  redis.call("ZREMRANGEBYSCORE", activeKey, 0, threshold)
  local active = redis.call("ZCARD", activeKey)
  local waiting = redis.call("ZCARD", queueKey)

  return { active, waiting }
`;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface QueueStatus {
  activeCount: number;
  queuedCount: number;
  maxConcurrency: number;
}

export async function getQueueStatus(): Promise<QueueStatus> {
  try {
    const redis = await getRedisClient();
    const now = Math.floor(Date.now() / 1000);

    const [active, waiting] = (await redis.eval(queueStatusScript, {
      keys: [ACTIVE_SLOTS_KEY, WAITING_QUEUE_KEY],
      arguments: [String(LEASE_TTL_SECONDS), String(now)],
    })) as [number, number];

    return {
      activeCount: active,
      queuedCount: waiting,
      maxConcurrency: env.HF_MAX_CONCURRENCY,
    };
  } catch (error) {
    console.error("Failed to read HuggingFace queue status", error);
    return {
      activeCount: 0,
      queuedCount: 0,
      maxConcurrency: env.HF_MAX_CONCURRENCY,
    };
  }
}

export async function executeWithQueue<T>(
  taskFn: () => Promise<T>,
  onQueueWait?: (position: number) => void,
): Promise<T> {
  const reqId = randomUUID();
  let acquired = false;

  try {
    const redis = await getRedisClient();
    const now = Math.floor(Date.now() / 1000);

    const initialResult = (await redis.eval(tryAcquireScript, {
      keys: [ACTIVE_SLOTS_KEY, WAITING_QUEUE_KEY],
      arguments: [
        String(env.HF_MAX_CONCURRENCY),
        String(LEASE_TTL_SECONDS),
        reqId,
        String(now),
      ],
    })) as number;

    if (initialResult === 1) {
      acquired = true;
    } else {
      // Must wait in queue
      const startWait = Date.now();
      const timeoutMs = env.HF_QUEUE_TIMEOUT_SECONDS * 1000;
      let lastReportedPosition = Math.abs(initialResult);
      if (onQueueWait) onQueueWait(lastReportedPosition);

      while (!acquired) {
        if (Date.now() - startWait > timeoutMs) {
          throw new Error(
            `Antrean HuggingFace timeout (${env.HF_QUEUE_TIMEOUT_SECONDS}s). Server AI sedang sibuk melayani permintaan lain. Silakan coba beberapa saat lagi.`,
          );
        }

        await sleep(600);

        const currentNow = Math.floor(Date.now() / 1000);
        const pollResult = (await redis.eval(pollQueueScript, {
          keys: [ACTIVE_SLOTS_KEY, WAITING_QUEUE_KEY],
          arguments: [
            String(env.HF_MAX_CONCURRENCY),
            String(LEASE_TTL_SECONDS),
            reqId,
            String(currentNow),
          ],
        })) as number;

        if (pollResult === 1) {
          acquired = true;
          break;
        }

        const currentPos = Math.abs(pollResult);
        if (currentPos !== lastReportedPosition) {
          lastReportedPosition = currentPos;
          if (onQueueWait) onQueueWait(currentPos);
        }
      }
    }

    // Execute the actual HuggingFace function
    return await taskFn();
  } finally {
    // Always clean up slot and queue membership
    try {
      const redis = await getRedisClient();
      await redis.eval(releaseSlotScript, {
        keys: [ACTIVE_SLOTS_KEY, WAITING_QUEUE_KEY],
        arguments: [reqId],
      });
    } catch (cleanupError) {
      console.error("Failed to release HuggingFace queue slot", cleanupError);
    }
  }
}
