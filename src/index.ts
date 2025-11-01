// WorkTrack V2 - New Architecture Exports
export * from './app';
export * from './di';
// export * from './features'; // Disabled from root barrel to reduce bundle surface
export * from './shared';

// Legacy exports (to be migrated)
export * as Errors from './shared/domain/errors';
export * as Logging from './shared/utils/logging';
