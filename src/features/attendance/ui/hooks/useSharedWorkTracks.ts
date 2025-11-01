import { Database, Q } from '@nozbe/watermelondb';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useDI } from '@/app/providers/DIProvider';
import { AppDispatch, RootState, setWorkTrackLoading } from '@/app/store';
import { ServiceIdentifiers } from '@/di/registry';
import TrackerModel from '@/features/attendance/data/models/TrackerModel';
import { AttendanceServiceIdentifiers } from '@/features/attendance/di';
import { ITrackerRepository } from '@/features/attendance/domain/ports/ITrackerRepository';
import { AuthServiceIdentifiers } from '@/features/auth/di';
import { IAuthRepository } from '@/features/auth/domain/ports/IAuthRepository';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { GetSharedWithMeUseCase } from '@/features/sharing/domain/use-cases';
import { logger } from '@/shared/utils/logging';

export type SharedWorkTrack = {
	id: string;
	ownerName: string;
	ownerEmail?: string;
	ownerPhoto?: string;
	permission: 'read' | 'write';
};

export const useSharedWorkTracks = () => {
	const dispatch = useDispatch<AppDispatch>();
	const container = useDI();
	const user = useSelector((state: RootState) => state.user.user);

	const [sharedWorkTracks, setSharedWorkTracks] = useState<SharedWorkTrack[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Resolve dependencies from DI container
	const getSharedWithMeUseCase = useMemo(
		() =>
			container.resolve<GetSharedWithMeUseCase>(
				SharingServiceIdentifiers.GET_SHARED_WITH_ME
			),
		[container]
	);

	const trackerRepository = useMemo(
		() =>
			container.resolve<ITrackerRepository>(
				AttendanceServiceIdentifiers.TRACKER_REPOSITORY
			),
		[container]
	);

	const authRepository = useMemo(
		() =>
			container.resolve<IAuthRepository>(
				AuthServiceIdentifiers.AUTH_REPOSITORY
			),
		[container]
	);

	const database = useMemo(
		() => container.resolve<Database>(ServiceIdentifiers.WATERMELON_DB),
		[container]
	);

	const loadSharedWorkTracks = useCallback(async () => {
		if (!user?.id) {
			setSharedWorkTracks([]);
			return;
		}

		setIsLoading(true);
		setError(null);
		dispatch(setWorkTrackLoading(true));

		try {
			// Get shares where current user is the sharedWithUserId
			const shares = await getSharedWithMeUseCase.execute(user.id);

			// Transform shares to SharedWorkTrack format
			const transformedTracks = await Promise.all(
				shares.map(async (share) => {
					// Get the tracker to find owner information
					const tracker = await trackerRepository.getById(
						share.trackerId
					);
					if (!tracker) {
						return null;
					}

					// Get owner userId from tracker model (domain entity doesn't expose it)
					const trackerCollection =
						database.get<TrackerModel>('trackers');
					const trackerModels = await trackerCollection
						.query(Q.where('id', tracker.id))
						.fetch();
					const trackerModel = trackerModels[0];
					const ownerUserId = trackerModel?.userId || null;

					if (!ownerUserId) {
						logger.warn('Tracker owner userId not found', {
							trackerId: tracker.id,
						});
						return null;
					}

					// Get owner user info
					const ownerUser =
						await authRepository.getUserById(ownerUserId);
					if (!ownerUser) {
						logger.warn('Owner user not found', {
							ownerUserId,
						});
						return null;
					}

					const sharedTrack: SharedWorkTrack = {
						id: share.trackerId, // Use trackerId as the ID
						ownerName: ownerUser.name,
						ownerEmail: ownerUser.email.value,
						ownerPhoto: ownerUser.photoUrl,
						permission: share.permission.value as 'read' | 'write',
					};

					return sharedTrack;
				})
			);

			const validTracks = transformedTracks.filter(
				(track): track is SharedWorkTrack => track !== null
			);

			setSharedWorkTracks(validTracks);
		} catch (err) {
			logger.error('Error loading shared worktracks:', { error: err });
			setError(
				err instanceof Error
					? err.message
					: 'Failed to load shared work tracks'
			);
			setSharedWorkTracks([]);
		} finally {
			setIsLoading(false);
			dispatch(setWorkTrackLoading(false));
		}
	}, [
		user?.id,
		dispatch,
		getSharedWithMeUseCase,
		trackerRepository,
		authRepository,
		database,
	]);

	useEffect(() => {
		loadSharedWorkTracks();
	}, [loadSharedWorkTracks]);

	return {
		sharedTracks: sharedWorkTracks, // Alias for compatibility
		sharedWorkTracks,
		loading: isLoading,
		error,
		refresh: loadSharedWorkTracks,
	};
};
