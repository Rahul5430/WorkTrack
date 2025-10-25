// migrated to V2 structure
import { logger } from '@/logging';

import {
	Container as IContainer,
	Disposable,
	ServiceFactory,
	ServiceIdentifier,
	ServiceRegistration,
	ServiceRegistrationError,
	ServiceResolutionError,
	ServiceScope,
} from './types';

/**
 * Service instance wrapper
 */
interface ServiceInstance<T = unknown> {
	instance?: T;
	factory: ServiceFactory<T>;
	scope: ServiceScope;
	disposable?: boolean;
}

/**
 * Dependency Injection Container implementation
 * Manages service lifecycle and dependency resolution
 */
export class Container implements IContainer {
	private services = new Map<ServiceIdentifier, ServiceInstance>();
	private singletons = new Map<ServiceIdentifier, unknown>();
	private scopedInstances = new Map<ServiceIdentifier, unknown>();
	private disposed = false;
	private parent?: Container;

	constructor(parent?: Container) {
		this.parent = parent;
	}

	/**
	 * Register a service with the container
	 */
	register<T>(registration: ServiceRegistration<T>): void {
		if (this.disposed) {
			throw new ServiceRegistrationError(
				registration.identifier,
				'Cannot register services on a disposed container'
			);
		}

		if (this.services.has(registration.identifier)) {
			throw new ServiceRegistrationError(
				registration.identifier,
				'Service is already registered'
			);
		}

		this.services.set(registration.identifier, {
			factory: registration.factory,
			scope: registration.scope,
			disposable: this.isDisposable(registration.factory),
		});

		logger.info(`Registered service: ${String(registration.identifier)}`);
	}

	/**
	 * Register a singleton service
	 */
	registerSingleton<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void {
		this.register({
			identifier,
			factory,
			scope: ServiceScope.SINGLETON,
		});
	}

	/**
	 * Register a transient service
	 */
	registerTransient<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void {
		this.register({
			identifier,
			factory,
			scope: ServiceScope.TRANSIENT,
		});
	}

	/**
	 * Register a scoped service
	 */
	registerScoped<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): void {
		this.register({
			identifier,
			factory,
			scope: ServiceScope.SCOPED,
		});
	}

	/**
	 * Resolve a service from the container
	 */
	resolve<T>(identifier: ServiceIdentifier<T>): T {
		if (this.disposed) {
			throw new ServiceResolutionError(
				identifier,
				'Cannot resolve services from a disposed container'
			);
		}

		// Check if service is registered in this container
		const registration = this.services.get(identifier);
		if (registration) {
			return this.createInstance(identifier, registration);
		}

		// Check parent container
		if (this.parent) {
			return this.parent.resolve(identifier);
		}

		throw new ServiceResolutionError(
			identifier,
			'Service is not registered'
		);
	}

	/**
	 * Check if a service is registered
	 */
	isRegistered<T>(identifier: ServiceIdentifier<T>): boolean {
		if (this.services.has(identifier)) {
			return true;
		}

		if (this.parent) {
			return this.parent.isRegistered(identifier);
		}

		return false;
	}

	/**
	 * Create a child container
	 */
	createChild(): Container {
		return new Container(this);
	}

	/**
	 * Dispose of the container and all its services
	 */
	dispose(): void {
		if (this.disposed) {
			return;
		}

		// Dispose all singleton instances
		for (const [identifier, instance] of this.singletons) {
			this.disposeInstance(identifier, instance);
		}

		// Dispose all scoped instances
		for (const [identifier, instance] of this.scopedInstances) {
			this.disposeInstance(identifier, instance);
		}

		// Clear all maps
		this.services.clear();
		this.singletons.clear();
		this.scopedInstances.clear();

		this.disposed = true;
		logger.info('Container disposed');
	}

	/**
	 * Create a service instance based on its scope
	 */
	private createInstance<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		switch (registration.scope) {
			case ServiceScope.SINGLETON:
				return this.createSingleton(identifier, registration);

			case ServiceScope.TRANSIENT:
				return this.createTransient(identifier, registration);

			case ServiceScope.SCOPED:
				return this.createScoped(identifier, registration);

			default:
				throw new ServiceResolutionError(
					identifier,
					`Unknown service scope: ${registration.scope}`
				);
		}
	}

	/**
	 * Create or return existing singleton instance
	 */
	private createSingleton<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		if (this.singletons.has(identifier)) {
			return this.singletons.get(identifier) as T;
		}

		const instance = registration.factory(this);
		this.singletons.set(identifier, instance);

		logger.info(`Created singleton instance: ${String(identifier)}`);
		return instance;
	}

	/**
	 * Create a new transient instance
	 */
	private createTransient<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		const instance = registration.factory(this);
		logger.info(`Created transient instance: ${String(identifier)}`);
		return instance;
	}

	/**
	 * Create or return existing scoped instance
	 */
	private createScoped<T>(
		identifier: ServiceIdentifier<T>,
		registration: ServiceInstance<T>
	): T {
		if (this.scopedInstances.has(identifier)) {
			return this.scopedInstances.get(identifier) as T;
		}

		const instance = registration.factory(this);
		this.scopedInstances.set(identifier, instance);

		logger.info(`Created scoped instance: ${String(identifier)}`);
		return instance;
	}

	/**
	 * Check if a factory creates a disposable instance
	 */
	private isDisposable(factory: ServiceFactory): boolean {
		// This is a simplified check - in a real implementation,
		// you might want to use reflection or metadata to determine this
		try {
			const testInstance = factory(this);
			return typeof (testInstance as Disposable).dispose === 'function';
		} catch {
			return false;
		}
	}

	/**
	 * Dispose of a service instance if it's disposable
	 */
	private disposeInstance(
		identifier: ServiceIdentifier,
		instance: unknown
	): void {
		if (this.isDisposableInstance(instance)) {
			try {
				instance.dispose();
				logger.info(`Disposed instance: ${String(identifier)}`);
			} catch (error) {
				logger.error(
					`Error disposing instance ${String(identifier)}:`,
					error
				);
			}
		}
	}

	/**
	 * Check if an instance implements Disposable
	 */
	private isDisposableInstance(instance: unknown): instance is Disposable {
		return (
			typeof instance === 'object' &&
			instance !== null &&
			typeof (instance as Disposable).dispose === 'function'
		);
	}
}
