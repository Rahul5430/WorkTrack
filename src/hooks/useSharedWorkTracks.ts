import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { DEFAULT_TRACKER_TYPE, TrackerType } from '../constants';
import { FirebaseService } from '../services';
import { setLoading } from '../store/reducers/workTrackSlice';
import { RootState } from '../store/store';

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

	const loadSharedWorkTracks = useCallback(async () => {
		if (!user?.id) return;

		setIsLoading(true);
		dispatch(setLoading(true));

		try {
			// Get shared worktracks from Firestore
			const db = FirebaseService.getInstance();
			const sharedTracks = await db.getSharedWorkTracks();

			// Transform the data
			const transformedTracks = sharedTracks.map((track) => ({
				id: track.ownerId,
				ownerName: track.ownerName ?? track.ownerEmail,
				ownerEmail: track.ownerEmail,
				ownerPhoto: track.ownerPhoto,
				permission: track.permission,
				isCurrent: track.ownerId === user.id,
				trackerType: track.trackerType ?? DEFAULT_TRACKER_TYPE,
			}));

			// Add mock data for testing
			const mockTracks = [
				{
					id: 'mock1',
					ownerName: 'John Doe',
					ownerEmail: 'john.doe@example.com',
					permission: 'write' as const,
					isCurrent: false,
					trackerType: DEFAULT_TRACKER_TYPE,
				},
				{
					id: 'mock2',
					ownerName: 'Jane Smith',
					ownerEmail: 'jane.smith@example.com',
					permission: 'read' as const,
					isCurrent: false,
					trackerType: DEFAULT_TRACKER_TYPE,
				},
				{
					id: 'mock3',
					ownerName: 'Mike Johnson',
					ownerEmail: 'mike.johnson@example.com',
					permission: 'write' as const,
					isCurrent: false,
					trackerType: DEFAULT_TRACKER_TYPE,
				},
				{
					id: 'mock4',
					ownerName: 'Sarah Wilson',
					ownerEmail: 'sarah.wilson@example.com',
					permission: 'read' as const,
					isCurrent: false,
					trackerType: DEFAULT_TRACKER_TYPE,
				},
			];

			setSharedWorkTracks([...transformedTracks, ...mockTracks]);
		} catch (error) {
			console.error('Error loading shared worktracks:', error);
		} finally {
			setIsLoading(false);
			dispatch(setLoading(false));
		}
	}, [user?.id, dispatch]);

	useEffect(() => {
		loadSharedWorkTracks();
	}, [loadSharedWorkTracks]);

	return {
		sharedWorkTracks,
		loading: isLoading,
		refresh: loadSharedWorkTracks,
	};
};
