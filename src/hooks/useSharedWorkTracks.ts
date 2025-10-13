import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DEFAULT_TRACKER_TYPE, TrackerType } from '../constants';
import { logger } from '../logging';
import { setLoading } from '../store/reducers/workTrackSlice';
import { RootState } from '../store/store';
import { useWorkTrackManager } from './useWorkTrackManager';

export type SharedWorkTrack = {
	id: string;
	ownerName: string;
	ownerEmail: string;
	ownerPhoto?: string;
	permission: 'read' | 'write';
	isCurrent: boolean;
	trackerType: TrackerType;
};

export const useSharedWorkTracks = () => {
	const dispatch = useDispatch();
	const [sharedWorkTracks, setSharedWorkTracks] = useState<SharedWorkTrack[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState(false);
	const user = useSelector((state: RootState) => state.user.user);
	const manager = useWorkTrackManager();

	const loadSharedWorkTracks = useCallback(async () => {
		if (!user?.id) return;

		setIsLoading(true);
		dispatch(setLoading(true));

		try {
			// Get shared worktracks from Firestore
			const sharedTracks = await manager.shareRead.getSharedWithMe();

			// Transform the data
			const transformedTracks = sharedTracks.map((track) => ({
				id: track.ownerId,
				ownerName: track.ownerName ?? track.ownerEmail,
				ownerEmail: track.ownerEmail,
				ownerPhoto: track.ownerPhoto,
				permission: track.permission,
				isCurrent: track.ownerId === user.id,
				trackerType:
					(track.trackerType as TrackerType) ?? DEFAULT_TRACKER_TYPE,
			}));

			setSharedWorkTracks([...transformedTracks]);
		} catch (error) {
			logger.error('Error loading shared worktracks:', { error });
		} finally {
			setIsLoading(false);
			dispatch(setLoading(false));
		}
	}, [user?.id, dispatch, manager.shareRead]);

	useEffect(() => {
		loadSharedWorkTracks();
	}, [loadSharedWorkTracks]);

	return {
		sharedWorkTracks,
		loading: isLoading,
		refresh: loadSharedWorkTracks,
	};
};
