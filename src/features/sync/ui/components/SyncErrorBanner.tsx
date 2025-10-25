import React, { useCallback, useEffect, useState } from 'react';
import {
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import { useToast, useWorkTrackManager } from '@/hooks';
import { logger } from '@/logging';
import { colors } from '@/themes';

interface SyncErrorBannerProps {
	onSyncComplete?: () => void;
}

interface FailedRecord {
	id: string;
	date: string;
	status: string;
	syncError?: string;
	retryCount?: number;
}

export const SyncErrorBanner: React.FC<SyncErrorBannerProps> = ({
	onSyncComplete,
}) => {
	const [hasErrors, setHasErrors] = useState(false);
	const [isRetrying, setIsRetrying] = useState(false);
	const [failedCount, setFailedCount] = useState(0);
	const [exceededRetryLimit, setExceededRetryLimit] = useState(false);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [failedRecords, setFailedRecords] = useState<FailedRecord[]>([]);
	const [loading, setLoading] = useState(false);

	const { show } = useToast();
	const manager = useWorkTrackManager();

	const checkForErrors = useCallback(async () => {
		try {
			const errorRecords = await manager.entry.getFailedSyncRecords();
			const exceededLimitRecords =
				await manager.entry.getRecordsExceedingRetryLimit(3);

			setHasErrors(errorRecords.length > 0);
			setFailedCount(errorRecords.length);
			setExceededRetryLimit(exceededLimitRecords.length > 0);
		} catch (error) {
			logger.error('Error checking for sync errors:', { error });
		}
	}, [manager.entry]);

	const loadFailedRecords = async () => {
		setLoading(true);
		try {
			const records = await manager.entry.getFailedSyncRecords();
			setFailedRecords(
				records.map((record) => ({
					id: record.id,
					date: record.date,
					status: record.status,
					syncError: record.syncError,
					retryCount: record.retryCount ?? 0,
				}))
			);
		} catch (error) {
			logger.error('Error loading failed records:', { error });
		} finally {
			setLoading(false);
		}
	};

	const handleRetry = async () => {
		setIsRetrying(true);
		try {
			await manager.sync();
			await checkForErrors(); // Re-check after sync

			// Show success toast if no more errors
			const remainingErrors = await manager.entry.getFailedSyncRecords();
			if (remainingErrors.length === 0) {
				show('Sync completed successfully!', 'success');
			} else {
				show(
					`Sync completed with ${remainingErrors.length} remaining errors`,
					'error'
				);
			}

			onSyncComplete?.();
		} catch (error) {
			logger.error('Sync retry failed:', { error });
			show('Sync failed. Please try again.', 'error');
		} finally {
			setIsRetrying(false);
		}
	};

	const handleShowDetails = async () => {
		await loadFailedRecords();
		setShowErrorModal(true);
	};

	useEffect(() => {
		checkForErrors();
		// Check periodically for new errors
		const interval = setInterval(checkForErrors, 30000); // Every 30 seconds
		return () => clearInterval(interval);
	}, [checkForErrors]);

	const getBannerMessage = () => {
		if (isRetrying) return 'Syncing...';

		if (exceededRetryLimit) {
			return `Multiple retries failed. Please check your connection. (${failedCount} failed records)`;
		}

		return `Some entries failed to sync. Tap to retry. (${failedCount} failed records)`;
	};

	const renderFailedRecord = ({ item }: { item: FailedRecord }) => (
		<View style={styles.recordItem}>
			<View style={styles.recordHeader}>
				<Text style={styles.recordDate}>{item.date}</Text>
				<Text style={styles.recordStatus}>{item.status}</Text>
			</View>
			{item.syncError && (
				<Text style={styles.errorText}>Error: {item.syncError}</Text>
			)}
			<Text style={styles.retryCount}>
				Retry attempts: {item.retryCount}
			</Text>
		</View>
	);

	if (!hasErrors) return null;

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.banner,
					isRetrying && styles.bannerSyncing,
					exceededRetryLimit && styles.bannerExceededLimit,
				]}
				onPress={handleRetry}
				disabled={isRetrying}
				testID='banner'
			>
				<Text style={styles.icon}>
					{isRetrying ? '🔄' : exceededRetryLimit ? '❌' : '⚠️'}
				</Text>
				<Text style={styles.text}>{getBannerMessage()}</Text>
				<TouchableOpacity
					style={styles.detailsButton}
					onPress={handleShowDetails}
					disabled={isRetrying}
					testID='details-button'
				>
					<Text style={styles.detailsButtonText}>Details</Text>
				</TouchableOpacity>
			</TouchableOpacity>

			<Modal
				visible={showErrorModal}
				animationType='slide'
				transparent={true}
				onRequestClose={() => setShowErrorModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Sync Errors</Text>
							<TouchableOpacity
								onPress={() => setShowErrorModal(false)}
								style={styles.closeButton}
								testID='close-button'
							>
								<Text style={styles.closeButtonText}>✕</Text>
							</TouchableOpacity>
						</View>

						{loading ? (
							<View style={styles.loadingContainer}>
								<Text style={styles.loadingText}>
									Loading...
								</Text>
							</View>
						) : failedRecords.length === 0 ? (
							<View style={styles.emptyContainer}>
								<Text style={styles.emptyText}>
									No sync errors found
								</Text>
							</View>
						) : (
							<FlatList
								data={failedRecords}
								renderItem={renderFailedRecord}
								keyExtractor={(item) => item.id}
								style={styles.recordsList}
								showsVerticalScrollIndicator={false}
							/>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
	},
	banner: {
		backgroundColor: colors.error,
		paddingHorizontal: 16,
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	bannerSyncing: {
		backgroundColor: colors.button.primary,
	},
	bannerExceededLimit: {
		backgroundColor: colors.error,
	},
	icon: {
		fontSize: 16,
		marginRight: 8,
	},
	text: {
		color: colors.text.primary,
		fontSize: 14,
		fontWeight: '500',
		flex: 1,
		textAlign: 'center',
	},
	detailsButton: {
		padding: 8,
		backgroundColor: colors.button.primary,
		borderRadius: 4,
	},
	detailsButtonText: {
		color: colors.text.light,
		fontSize: 12,
		fontWeight: '500',
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: colors.ui.backdrop,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalContent: {
		backgroundColor: colors.background.primary,
		padding: 20,
		borderRadius: 10,
		width: '80%',
		maxHeight: '80%',
	},
	modalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginRight: 10,
	},
	closeButton: {
		padding: 5,
	},
	closeButtonText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	recordItem: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.ui.gray[200],
	},
	recordHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 5,
	},
	recordDate: {
		fontSize: 12,
		fontWeight: 'bold',
		marginRight: 10,
	},
	recordStatus: {
		fontSize: 12,
		fontWeight: 'bold',
	},
	errorText: {
		fontSize: 12,
		color: colors.error,
	},
	retryCount: {
		fontSize: 12,
		color: colors.text.secondary,
	},
	recordsList: {
		flex: 1,
	},
});

export default SyncErrorBanner;
