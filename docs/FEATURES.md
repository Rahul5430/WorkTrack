# Features Development Guide

- Follow feature-first, hexagonal architecture.
- Start with domain (entities, ports, use-cases), then data adapters, then UI wiring.
- Register dependencies in `src/features/<feature>/di.ts` and wire via `src/di/registry.ts`.
- Add unit tests under `__tests__/unit/features/<feature>/...` mirroring structure.

## Checklist per feature

- Domain: entities, ports, use-cases, validators/strategies if needed.
- Data: models, mappers, repositories/services.
- UI: minimal screens/components/hooks; no business logic inside components.
- Store: Redux slice/selectors if needed.
- DI: registration function.

## Import rules

- Domain → shared/domain only.
- Data → domain + shared/data.
- UI → domain/data/store/shared/ui.
