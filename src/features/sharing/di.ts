import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { logger } from '@/shared/utils/logging';

import { FirebaseShareRepository } from './data/repositories/FirebaseShareRepository';
import { WatermelonSharedTrackerRepository } from './data/repositories/WatermelonSharedTrackerRepository';
import { IShareRepository } from './domain/ports/IShareRepository';
import {
	GetMySharesUseCase,
	GetSharedWithMeUseCase,
	ShareTrackerUseCase,
	UnshareTrackerUseCase,
	UpdatePermissionUseCase,
} from './domain/use-cases';

export const SharingServiceIdentifiers = {
	SHARE_REPOSITORY_LOCAL: Symbol('ShareRepositoryLocal'),
	SHARE_REPOSITORY_REMOTE: Symbol('ShareRepositoryRemote'),
	SHARE_TRACKER: Symbol('ShareTrackerUseCase'),
	UNSHARE_TRACKER: Symbol('UnshareTrackerUseCase'),
	UPDATE_PERMISSION: Symbol('UpdatePermissionUseCase'),
	GET_MY_SHARES: Symbol('GetMySharesUseCase'),
	GET_SHARED_WITH_ME: Symbol('GetSharedWithMeUseCase'),
} as const;

export function registerSharingServices(
	builder: ContainerBuilder
): ContainerBuilder {
	logger.info('Registering sharing services...');

	builder.registerSingleton(
		SharingServiceIdentifiers.SHARE_REPOSITORY_REMOTE,
		() => new FirebaseShareRepository()
	);
	builder.registerSingleton(
		SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL,
		(container) => {
			const db = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			) as Database;
			return new WatermelonSharedTrackerRepository(db);
		}
	);

	// Use-cases bind to local repo by default; remote can be used by sync flows
	builder.registerSingleton(
		SharingServiceIdentifiers.SHARE_TRACKER,
		(container) =>
			new ShareTrackerUseCase(
				container.resolve(
					SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL
				) as IShareRepository
			)
	);
	builder.registerSingleton(
		SharingServiceIdentifiers.UNSHARE_TRACKER,
		(container) =>
			new UnshareTrackerUseCase(
				container.resolve(
					SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL
				) as IShareRepository
			)
	);
	builder.registerSingleton(
		SharingServiceIdentifiers.UPDATE_PERMISSION,
		(container) =>
			new UpdatePermissionUseCase(
				container.resolve(
					SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL
				) as IShareRepository
			)
	);
	builder.registerSingleton(
		SharingServiceIdentifiers.GET_MY_SHARES,
		(container) =>
			new GetMySharesUseCase(
				container.resolve(
					SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL
				) as IShareRepository
			)
	);
	builder.registerSingleton(
		SharingServiceIdentifiers.GET_SHARED_WITH_ME,
		(container) =>
			new GetSharedWithMeUseCase(
				container.resolve(
					SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL
				) as IShareRepository
			)
	);

	logger.info('Sharing services registered');
	return builder;
}
