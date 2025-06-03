import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import FirebaseService from '../services/firebase';
import { setLoading } from '../store/reducers/workTrackSlice';
import { RootState } from '../store/store';

export type SharedWorkTrack = {
	id: string;
	ownerName: string;
	ownerEmail: string;
	ownerPhoto?: string;
	permission: 'read' | 'write';
	isCurrent: boolean;
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
			}));

			setSharedWorkTracks(transformedTracks);
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
