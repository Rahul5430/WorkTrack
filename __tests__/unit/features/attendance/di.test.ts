import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { SyncingEntryRepositoryDecorator } from '@/features/attendance/data/repositories/SyncingEntryRepositoryDecorator';
import { SyncingTrackerRepositoryDecorator } from '@/features/attendance/data/repositories/SyncingTrackerRepositoryDecorator';
import {
	AttendanceServiceIdentifiers,
	registerAttendanceServices,
} from '@/features/attendance/di';
import { CreateEntryUseCase } from '@/features/attendance/domain/use-cases/CreateEntryUseCase';
import { DeleteEntryUseCase } from '@/features/attendance/domain/use-cases/DeleteEntryUseCase';
import { GetEntriesForPeriodUseCase } from '@/features/attendance/domain/use-cases/GetEntriesForPeriodUseCase';
import { GetEntriesForTrackerUseCase } from '@/features/attendance/domain/use-cases/GetEntriesForTrackerUseCase';
import { UpdateEntryUseCase } from '@/features/attendance/domain/use-cases/UpdateEntryUseCase';
import { ISyncQueueRepository } from '@/features/sync/domain/ports/ISyncQueueRepository';

jest.mock('@/features/sync/di', () => ({
	SyncServiceIdentifiers: {
		SYNC_QUEUE_REPOSITORY: Symbol('SyncQueueRepository'),
	},
}));

jest.mock('@/shared/utils/logging', () => ({
	logger: {
		info: jest.fn(),
		debug: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
}));

describe('registerAttendanceServices', () => {
	let builder: ContainerBuilder;
	let mockDatabase: jest.Mocked<Database>;
	let mockSyncQueueRepo: jest.Mocked<ISyncQueueRepository>;

	beforeEach(() => {
		builder = new ContainerBuilder();
		mockDatabase = {} as jest.Mocked<Database>;
		mockSyncQueueRepo = {
			enqueue: jest.fn(),
			dequeue: jest.fn(),
			peek: jest.fn(),
			update: jest.fn(),
			getAll: jest.fn(),
			clear: jest.fn(),
		} as unknown as jest.Mocked<ISyncQueueRepository>;

		builder.registerSingleton(
			ServiceIdentifiers.WATERMELON_DB,
			() => mockDatabase
		);
		const { SyncServiceIdentifiers } = require('@/features/sync/di');
		builder.registerSingleton(
			SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY,
			() => mockSyncQueueRepo
		);
	});

	it('registers entry repository as SyncingEntryRepositoryDecorator', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const entryRepo = container.resolve(
			AttendanceServiceIdentifiers.ENTRY_REPOSITORY
		);

		expect(entryRepo).toBeInstanceOf(SyncingEntryRepositoryDecorator);
	});

	it('registers tracker repository as SyncingTrackerRepositoryDecorator', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const trackerRepo = container.resolve(
			AttendanceServiceIdentifiers.TRACKER_REPOSITORY
		);

		expect(trackerRepo).toBeInstanceOf(SyncingTrackerRepositoryDecorator);
	});

	it('registers CreateEntryUseCase', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AttendanceServiceIdentifiers.CREATE_ENTRY
		);

		expect(useCase).toBeInstanceOf(CreateEntryUseCase);
	});

	it('registers UpdateEntryUseCase', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AttendanceServiceIdentifiers.UPDATE_ENTRY
		);

		expect(useCase).toBeInstanceOf(UpdateEntryUseCase);
	});

	it('registers DeleteEntryUseCase', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AttendanceServiceIdentifiers.DELETE_ENTRY
		);

		expect(useCase).toBeInstanceOf(DeleteEntryUseCase);
	});

	it('registers GetEntriesForPeriodUseCase', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AttendanceServiceIdentifiers.GET_ENTRIES_FOR_PERIOD
		);

		expect(useCase).toBeInstanceOf(GetEntriesForPeriodUseCase);
	});

	it('registers GetEntriesForTrackerUseCase', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const useCase = container.resolve(
			AttendanceServiceIdentifiers.GET_ENTRIES_FOR_TRACKER
		);

		expect(useCase).toBeInstanceOf(GetEntriesForTrackerUseCase);
	});

	it('wraps WatermelonEntryRepository with SyncingEntryRepositoryDecorator', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const entryRepo = container.resolve(
			AttendanceServiceIdentifiers.ENTRY_REPOSITORY
		) as SyncingEntryRepositoryDecorator;

		expect(entryRepo).toBeInstanceOf(SyncingEntryRepositoryDecorator);
	});

	it('wraps WatermelonTrackerRepository with SyncingTrackerRepositoryDecorator', () => {
		registerAttendanceServices(builder);
		const container = builder.build();
		const trackerRepo = container.resolve(
			AttendanceServiceIdentifiers.TRACKER_REPOSITORY
		) as SyncingTrackerRepositoryDecorator;

		expect(trackerRepo).toBeInstanceOf(SyncingTrackerRepositoryDecorator);
	});

	it('returns the builder for chaining', () => {
		const result = registerAttendanceServices(builder);

		expect(result).toBe(builder);
	});
});
