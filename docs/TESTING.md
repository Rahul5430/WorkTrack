# Testing Strategy

## Test types

- Unit: fast, isolated, mirror `src/` structure.
- Integration: cross-module workflows (bootstrap, sync, attendance flows).
- E2E: future Detox-based journeys.

## Conventions

- One test file per module, same path under `__tests__/unit`.
- Use DI to inject fakes/mocks for unit tests.
- Use real DI container for integration tests when feasible.

## Targets

- Shared domain: 100%.
- Feature domain: ≥95%.
- Sync subsystem: 100% queue logic.

## Commands

```bash
npm run test
npm run test:unit
npm run test:integration
```
