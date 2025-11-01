# ADR 004: DI Container Strategy

- Context: Need centralized wiring and easy test injection.
- Decision: Custom Container/Builder with feature registration in `src/di/registry.ts`.
- Consequences: Clear lifecycle, single composition root, simpler unit testing.
