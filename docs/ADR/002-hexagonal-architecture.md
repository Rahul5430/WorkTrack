# ADR 002: Hexagonal Architecture (Ports & Adapters)

- Context: We need testability and replaceable adapters.
- Decision: Domain defines ports; data implements; UI consumes via use-cases.
- Consequences: High testability, low coupling; more interfaces to maintain.
