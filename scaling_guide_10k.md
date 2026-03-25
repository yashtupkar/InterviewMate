# Scaling InterviewMate to 10,000+ Users

This document outlines the architectural bottlenecks in the current `InterviewMate` codebase when attempting to handle 10,000+ concurrent users, and provides a step-by-step implementation plan for scaling the application.

## The Bottlenecks & Fixes

1. **The Single-Threaded Node.js Bottleneck**
   - **The Problem:** The `backend/index.js` currently runs as a single Node.js process. If 10,000 users hit API routes simultaneously, the Node.js event loop gets backed up, requests queue up, memory usage spikes, and the server crashes with an Out of Memory (OOM) error.
   - **The Fix:** Utilize all CPU cores on the server using a process manager like **PM2** in **Cluster Mode**.

2. **Third-Party API Rate Limits**
   - **The Problem:** 10,000 users making AI requests will instantly trigger `429 Too Many Requests` errors from **OpenRouter**. API providers impose hard limits on Requests Per Minute (RPM) and Tokens Per Minute (TPM).
   - **The Fix:** Check OpenRouter usage tiers and implement **exponential backoff & retry logic** in API calls to gracefully pause and retry requests instead of crashing or showing errors to users.

3. **Database Connection Pool Exhaustion**
   - **The Problem:** The default Mongoose connection settings maintain a pool of about 100 simultaneous connections. 10,000 concurrent database queries will queue up, causing massive latency and `MongoTimeoutError` crashes.
   - **The Fix:** Increase the `maxPoolSize` in Mongoose and upgrade the MongoDB Atlas cluster if it's on a shared/free tier.

4. **Lack of Caching**
   - **The Problem:** Currently, every request queries MongoDB directly, which is inefficient and expensive under heavy load.
   - **The Fix:** Introduce an in-memory cache like **Redis** for static or slowly-changing data.

5. **Synchronous Heavy Processing**
   - **The Problem:** Running heavy computations or waiting on heavy AI evaluations from OpenRouter on the main Node.js thread blocks the server.
   - **The Fix:** Offload heavy tasks to a background queue system (like **BullMQ** or **RabbitMQ**), returning a "Processing..." status to the frontend while a separate worker handles the task.

---

## Detailed Implementation Plan

### 1. Node.js Clustering & Process Management
To fully utilize the server's CPU cores, we will switch from running a single Node instance to using PM2 in cluster mode.

**Changes Required:**
- **`[NEW]` `backend/ecosystem.config.js`**: Create a PM2 configuration file to manage instances with `instances: "max"` and `exec_mode: "cluster"`.
- **`[MODIFY]` `backend/package.json`**: Update the `start` script to `"start": "pm2-runtime start ecosystem.config.js"`.

### 2. Database Connection Pool Optimization
Increase the Mongoose connection pool size to prevent query queuing under heavy load.

**Changes Required:**
- **`[MODIFY]` `backend/config/db.js`**: Update connection options to `{ maxPoolSize: 500, serverSelectionTimeoutMS: 5000 }`.

### 3. Redis Integration (Caching & Distributed Rate Limiting)
Integrate Redis to cache frequent data requests and prevent overwhelming the database and external APIs.

**Changes Required:**
- **`[NEW]` `backend/config/redis.js`**: Initialize a Redis client using `ioredis`.
- **`[MODIFY]` `backend/package.json`**: Add the `ioredis` dependency.
- **`[MODIFY]` High-Read Routes**: Implement caching middleware for routes fetching question banks or user profiles.

### 4. API Resilience (Exponential Backoff for OpenRouter)
Implement smart retries to handle OpenRouter API failures gracefully.

**Changes Required:**
- **`[NEW]` `backend/utils/apiRetry.js`**: Create a utility using `axios-retry` (or custom backoff) for `429 Too Many Requests` or `5xx Server Errors` from OpenRouter.
- **`[MODIFY]` `backend/services/GDAnalyzer.js` (and other AI services)**: Wrap OpenRouter calls with this retry utility.

### 5. Background Job Processing (BullMQ)
For intensive tasks, do not hold the HTTP request open.

**Changes Required:**
- **`[NEW]` `backend/jobs/queue.js`**: Setup BullMQ.
- **`[NEW]` `backend/jobs/workers/*`**: Create isolated workers to process heavy AI evaluations via OpenRouter asynchronously.
- **`[MODIFY]` `backend/package.json`**: Add the `bullmq` dependency.
