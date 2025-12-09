// migrated to V2 structure
import { useCallback, useState } from 'react';

import { useDI as useContainer } from '@/app/providers/DIProvider';
import { SharingServiceIdentifiers } from '@/features/sharing/di';
import { Share } from '@/features/sharing/domain/entities/Share';
import {
	GetMySharesUseCase,
	GetSharedWithMeUseCase,
} from '@/features/sharing/domain/use-cases';

export const useShares = () => {
	const container = useContainer();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [myShares, setMyShares] = useState<Share[]>([]);
	const [sharedWithMe, setSharedWithMe] = useState<Share[]>([]);

	const loadShares = useCallback(
		async (userId: string): Promise<void> => {
			if (!userId) return;

			setIsLoading(true);
			setError(null);

			try {
				const [mySharesData, sharedWithMeData] = await Promise.all([
					container
						.resolve<GetMySharesUseCase>(
							SharingServiceIdentifiers.GET_MY_SHARES
						)
						.execute(userId),
					container
						.resolve<GetSharedWithMeUseCase>(
							SharingServiceIdentifiers.GET_SHARED_WITH_ME
						)
						.execute(userId),
				]);

				setMyShares(mySharesData);
				setSharedWithMe(sharedWithMeData);
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: 'Failed to load shares';
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[container]
	);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		isLoading,
		error,
		myShares,
		sharedWithMe,
		loadShares,
		clearError,
	};
};
