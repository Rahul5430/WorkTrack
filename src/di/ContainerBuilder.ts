// migrated to V2 structure
import { logger } from '@/shared/utils/logging';

import { Container } from './Container';
import {
	ContainerBuilder as IContainerBuilder,
	ServiceFactory,
	ServiceIdentifier,
	ServiceRegistration,
	ServiceScope,
} from './types';

/**
 * Container Builder for fluent service registration
 * Provides a fluent API for registering services before building the container
 * Internal storage uses unknown to allow storing different service types
 */
export class ContainerBuilder implements IContainerBuilder {
	private registrations: Array<ServiceRegistration<unknown>> = [];

	/**
	 * Register a service
	 */
	register<T>(registration: ServiceRegistration<T>): ContainerBuilder {
		// Check for duplicate registrations
		const existing = this.registrations.find(
			(reg) => reg.identifier === registration.identifier
		);

		if (existing) {
			throw new Error(
				`Service ${String(registration.identifier)} is already registered`
			);
		}

		// Store with unknown type for internal storage
		// Type safety is maintained at the public API level
		this.registrations.push(registration as ServiceRegistration<unknown>);
		logger.info(
			`Queued service registration: ${String(registration.identifier)}`
		);
		return this;
	}

	/**
	 * Register a singleton service
	 */
	registerSingleton<T>(
		identifier: ServiceIdentifier<T>,
		factory: ServiceFactory<T>
	): ContainerBuilder {
		return this.register({
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
	): ContainerBuilder {
		return this.register({
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
	): ContainerBuilder {
		return this.register({
			identifier,
			factory,
			scope: ServiceScope.SCOPED,
		});
	}

	/**
	 * Build the container with all registered services
	 */
	build(): Container {
		const container = new Container();

		// Register all services
		for (const registration of this.registrations) {
			container.register(registration);
		}

		logger.debug(
			`Built container with ${this.registrations.length} services`
		);
		return container;
	}

	/**
	 * Get the number of registered services
	 */
	getRegistrationCount(): number {
		return this.registrations.length;
	}

	/**
	 * Check if a service is registered
	 */
	hasRegistration(identifier: ServiceIdentifier<unknown>): boolean {
		return this.registrations.some((reg) => reg.identifier === identifier);
	}

	/**
	 * Clear all registrations
	 */
	clear(): ContainerBuilder {
		this.registrations = [];
		logger.info('Cleared all service registrations');
		return this;
	}
}
