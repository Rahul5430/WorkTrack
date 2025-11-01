// migrated to V2 structure
// Core DI components
export { Container } from './Container';
export { ContainerBuilder } from './ContainerBuilder';
export { ServiceIdentifiers } from './registry';

// Registry functions
export {
	createContainer,
	createCoreContainer,
	registerAllServices,
	registerCoreServices,
	registerFeatureServices,
} from './registry';

// Types and interfaces
export type {
	Disposable,
	Container as IContainer,
	ContainerBuilder as IContainerBuilder,
	ServiceFactory,
	ServiceIdentifier,
	ServiceRegistration,
	ServiceScope,
} from './types';
export { ServiceRegistrationError, ServiceResolutionError } from './types';
