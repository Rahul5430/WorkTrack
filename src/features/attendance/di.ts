// Feature DI registration
import { Database } from '@nozbe/watermelondb';

import { ContainerBuilder } from '@/di/ContainerBuilder';
import { ServiceIdentifiers } from '@/di/registry';
import { logger } from '@/shared/utils/logging';

import {
	WatermelonEntryRepository,
	WatermelonTrackerRepository,
} from './data/repositories';
import { SyncingEntryRepositoryDecorator } from './data/repositories/SyncingEntryRepositoryDecorator';
import { SyncingTrackerRepositoryDecorator } from './data/repositories/SyncingTrackerRepositoryDecorator';
import { IEntryRepository } from './domain/ports/IEntryRepository';
import {
	CreateEntryUseCase,
	DeleteEntryUseCase,
	GetEntriesForPeriodUseCase,
	GetEntriesForTrackerUseCase,
	UpdateEntryUseCase,
} from './domain/use-cases';

export const AttendanceServiceIdentifiers = {
	ENTRY_REPOSITORY: Symbol('EntryRepository'),
	TRACKER_REPOSITORY: Symbol('TrackerRepository'),
	CREATE_ENTRY: Symbol('CreateEntryUseCase'),
	UPDATE_ENTRY: Symbol('UpdateEntryUseCase'),
	DELETE_ENTRY: Symbol('DeleteEntryUseCase'),
	GET_ENTRIES_FOR_PERIOD: Symbol('GetEntriesForPeriodUseCase'),
	GET_ENTRIES_FOR_TRACKER: Symbol('GetEntriesForTrackerUseCase'),
} as const;

export function registerAttendanceServices(
	builder: ContainerBuilder
): ContainerBuilder {
	logger.info('Registering attendance services...');

	// Repositories
	builder.registerSingleton(
		AttendanceServiceIdentifiers.ENTRY_REPOSITORY,
		(container) => {
			const db = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			) as Database;
			const inner = new WatermelonEntryRepository(db);
			const { SyncServiceIdentifiers } = require('@/features/sync/di');
			const queueRepo = container.resolve(
				SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
			) as import('@/features/sync/domain/ports/ISyncQueueRepository').ISyncQueueRepository;
			return new SyncingEntryRepositoryDecorator(inner, queueRepo);
		}
	);

	builder.registerSingleton(
		AttendanceServiceIdentifiers.TRACKER_REPOSITORY,
		(container) => {
			const db = container.resolve(
				ServiceIdentifiers.WATERMELON_DB
			) as Database;
			const inner = new WatermelonTrackerRepository(db);
			const { SyncServiceIdentifiers } = require('@/features/sync/di');
			const queueRepo = container.resolve(
				SyncServiceIdentifiers.SYNC_QUEUE_REPOSITORY
			) as import('@/features/sync/domain/ports/ISyncQueueRepository').ISyncQueueRepository;
			return new SyncingTrackerRepositoryDecorator(inner, queueRepo);
		}
	);

	// Use cases
	builder.registerSingleton(
		AttendanceServiceIdentifiers.CREATE_ENTRY,
		(container) =>
			new CreateEntryUseCase(
				container.resolve(
					AttendanceServiceIdentifiers.ENTRY_REPOSITORY
				) as IEntryRepository
			)
	);

	builder.registerSingleton(
		AttendanceServiceIdentifiers.UPDATE_ENTRY,
		(container) =>
			new UpdateEntryUseCase(
				container.resolve(
					AttendanceServiceIdentifiers.ENTRY_REPOSITORY
				) as IEntryRepository
			)
	);

	builder.registerSingleton(
		AttendanceServiceIdentifiers.DELETE_ENTRY,
		(container) =>
			new DeleteEntryUseCase(
				container.resolve(
					AttendanceServiceIdentifiers.ENTRY_REPOSITORY
				) as IEntryRepository
			)
	);

	builder.registerSingleton(
		AttendanceServiceIdentifiers.GET_ENTRIES_FOR_PERIOD,
		(container) =>
			new GetEntriesForPeriodUseCase(
				container.resolve(
					AttendanceServiceIdentifiers.ENTRY_REPOSITORY
				) as IEntryRepository
			)
	);

	builder.registerSingleton(
		AttendanceServiceIdentifiers.GET_ENTRIES_FOR_TRACKER,
		(container) =>
			new GetEntriesForTrackerUseCase(
				container.resolve(
					AttendanceServiceIdentifiers.ENTRY_REPOSITORY
				) as IEntryRepository
			)
	);

	logger.info('Attendance services registered');
	return builder;
}
