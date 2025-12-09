// migrated to V2 structure
import type { Database } from '@nozbe/watermelondb';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { createContainer, ServiceIdentifiers } from '@/di/registry';
import { SyncServiceIdentifiers } from '@/features/sync/di';
import { database as watermelonDB } from '@/shared/data/database/watermelon';

import { setLoading, setUser } from '../store/reducers/userSlice';
import { store } from '../store/store';

export interface BootstrapResult {
	container: ReturnType<typeof createContainer>;
	database: Database;
	store: typeof store;
}

export async function bootstrap(): Promise<BootstrapResult> {
	// Initialize DI container
	const container = createContainer();

	// Ensure database is created and migrations are applied
	// Access via DI if desired; the instance import already wires migrations/schema
	const dbFromDI = container.resolve(
		ServiceIdentifiers.WATERMELON_DB
	) as Database;
	const database = dbFromDI ?? (watermelonDB as Database);

	// No-op to touch DB (helps some adapters initialize lazily)
	await Promise.resolve();

	return { container, database, store };
}

/**
 * Full runtime initialization as per APP_BOOTSTRAP_DESIGN.md
 * - Restore session from storage
 * - Start SyncManager (no immediate sync)
 */
export async function initializeRuntime(): Promise<void> {
	store.dispatch(setLoading(true));
	try {
		const raw = await AsyncStorage.getItem('user');
		if (raw) {
			const parsed = JSON.parse(raw) as {
				id: string;
				name: string;
				email: string;
				photo?: string;
				createdAt?: string;
				updatedAt?: string;
			};
			store.dispatch(
				setUser({
					id: parsed.id,
					name: parsed.name,
					email: parsed.email,
					photo: parsed.photo,
					createdAt: parsed.createdAt ?? new Date().toISOString(),
					updatedAt: parsed.updatedAt ?? new Date().toISOString(),
				})
			);
		} else {
			store.dispatch(setUser(null));
		}

		// Start SyncManager after DI+DB ready
		const { container } = await bootstrap();
		const syncManager = container.resolve(
			SyncServiceIdentifiers.SYNC_MANAGER
		) as import('@/features/sync/data/services/SyncManager').SyncManager;
		// Start without forcing an immediate cycle; AppState/NetInfo will trigger
		syncManager.start();
	} finally {
		store.dispatch(setLoading(false));
	}
}
