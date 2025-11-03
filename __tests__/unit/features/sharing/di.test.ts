import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { FirebaseShareRepository } from '@/features/sharing/data/repositories/FirebaseShareRepository';
import { WatermelonSharedTrackerRepository } from '@/features/sharing/data/repositories/WatermelonSharedTrackerRepository';
import {
	registerSharingServices,
	SharingServiceIdentifiers,
} from '@/features/sharing/di';
import { GetMySharesUseCase } from '@/features/sharing/domain/use-cases/GetMySharesUseCase';
import { GetSharedWithMeUseCase } from '@/features/sharing/domain/use-cases/GetSharedWithMeUseCase';
import { ShareTrackerUseCase } from '@/features/sharing/domain/use-cases/ShareTrackerUseCase';
import { UnshareTrackerUseCase } from '@/features/sharing/domain/use-cases/UnshareTrackerUseCase';
import { UpdatePermissionUseCase } from '@/features/sharing/domain/use-cases/UpdatePermissionUseCase';

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
	},
}));

describe('registerSharingServices', () => {
	let builder: ContainerBuilder;
	let mockDatabase: jest.Mocked<Database>;

	beforeEach(() => {
		builder = new ContainerBuilder();
		mockDatabase = {} as jest.Mocked<Database>;

		builder.registerSingleton(
			ServiceIdentifiers.WATERMELON_DB,
			() => mockDatabase
		);
	});

	it('registers FirebaseShareRepository as remote repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const remoteRepo = container.resolve(
			SharingServiceIdentifiers.SHARE_REPOSITORY_REMOTE
		);

		expect(remoteRepo).toBeInstanceOf(FirebaseShareRepository);
	});

	it('registers WatermelonSharedTrackerRepository as local repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const localRepo = container.resolve(
			SharingServiceIdentifiers.SHARE_REPOSITORY_LOCAL
		);

		expect(localRepo).toBeInstanceOf(WatermelonSharedTrackerRepository);
	});

	it('registers ShareTrackerUseCase with local repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SharingServiceIdentifiers.SHARE_TRACKER
		);

		expect(useCase).toBeInstanceOf(ShareTrackerUseCase);
	});

	it('registers UnshareTrackerUseCase with local repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SharingServiceIdentifiers.UNSHARE_TRACKER
		);

		expect(useCase).toBeInstanceOf(UnshareTrackerUseCase);
	});

	it('registers UpdatePermissionUseCase with local repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SharingServiceIdentifiers.UPDATE_PERMISSION
		);

		expect(useCase).toBeInstanceOf(UpdatePermissionUseCase);
	});

	it('registers GetMySharesUseCase with local repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SharingServiceIdentifiers.GET_MY_SHARES
		);

		expect(useCase).toBeInstanceOf(GetMySharesUseCase);
	});

	it('registers GetSharedWithMeUseCase with local repository', () => {
		registerSharingServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			SharingServiceIdentifiers.GET_SHARED_WITH_ME
		);

		expect(useCase).toBeInstanceOf(GetSharedWithMeUseCase);
	});

	it('returns the builder for chaining', () => {
		const result = registerSharingServices(builder);

		expect(result).toBe(builder);
	});
});
