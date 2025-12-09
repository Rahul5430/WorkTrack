# Sync Strategy

## Overview

- Persistent queue in WatermelonDB with `attempt_count` and `next_retry_at`.
- Per-operation outcomes from remote sync to update items individually.
- Exponential backoff (base 5s, capped at 24h).
- Network-aware via NetInfo and an `INetworkMonitor` abstraction.

## Components

- Queue repo: `WatermelonSyncQueueRepository` (DB filtering by `next_retry_at`).
- Remote repo: `FirebaseSyncRepository` (returns per-op outcomes).
- Use cases: enqueue, process, push, pull, resolve conflicts.
- Manager: `SyncManager` orchestrates cycles, emits `itemProcessed`, `cycleStart`, `cycleEnd`, `cycleError`.

## Triggers

- App foreground via `AppState`.
- Network reconnect via NetInfo.
- Periodic timer (default 60s) with backoff.

## Conflict Resolution

- Strategies available: last-write-wins, manual.

## Testing

- Unit tests cover queue filtering, backoff, outcomes, and manager eventing.
