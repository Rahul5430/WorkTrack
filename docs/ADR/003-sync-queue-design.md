# ADR 003: Sync Queue Design

- Context: Offline-first requires durable operations and retries.
- Decision: WatermelonDB-backed queue with attempt_count/next_retry_at and per-op outcomes.
- Consequences: Reliable sync, DB-level filtering, simpler processing per item.
