import { BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import {
	ActivityIndicator,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';

import { useResponsiveLayout } from '../hooks/useResponsive';
import { SharedWorkTrack } from '../hooks/useSharedWorkTracks';
import { RootState } from '../store/store';
import { fonts } from '../themes';
import { colors } from '../themes/colors';

type Props = {
	sharedWorkTracks: SharedWorkTrack[];
	loading?: boolean;
	onWorkTrackSelect: (workTrackId: string) => void;
	onAddWorkTrack: () => void;
	currentWorkTrackId?: string;
	defaultWorkTrackId?: string;
};

const WorkTrackSwitcher: React.FC<Props> = ({
	sharedWorkTracks,
	loading = false,
	onWorkTrackSelect,
	onAddWorkTrack,
	currentWorkTrackId,
	defaultWorkTrackId,
}) => {
	const { RFValue, getResponsiveSize } = useResponsiveLayout();
	const user = useSelector((state: RootState) => state.user.user);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='large' color='#0000ff' />
			</View>
		);
	}

	const myWorkTrack = sharedWorkTracks.find((wt) => wt.id === user?.id);
	const otherWorkTracks = sharedWorkTracks.filter((wt) => wt.id !== user?.id);

	return (
		<BottomSheetView
			style={[styles.container, { padding: getResponsiveSize(5).width }]}
		>
			<View style={styles.header}>
				<Text style={[styles.title, { fontSize: RFValue(18) }]}>
					WorkTracks
				</Text>
				<Pressable style={styles.addButton} onPress={onAddWorkTrack}>
					<MaterialCommunityIcons
						name='plus'
						size={24}
						color={colors.text.light}
					/>
				</Pressable>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				bounces={false}
				contentContainerStyle={styles.scrollContent}
			>
				<View style={styles.list}>
					{/* My WorkTrack */}
					{myWorkTrack && (
						<>
							<Pressable
								style={({ pressed }) => [
									styles.workTrackItem,
									myWorkTrack.id === currentWorkTrackId &&
										styles.selectedWorkTrackItem,
									pressed && styles.workTrackItemPressed,
								]}
								onPress={() =>
									onWorkTrackSelect(myWorkTrack.id)
								}
							>
								<View style={styles.workTrackInfo}>
									<View style={styles.ownerInfo}>
										{user?.photo ? (
											<Image
												source={{ uri: user.photo }}
												style={styles.ownerPhoto}
											/>
										) : (
											<View
												style={
													styles.ownerPhotoPlaceholder
												}
											>
												<Text
													style={
														styles.ownerPhotoPlaceholderText
													}
												>
													{(user?.name ??
														'M')[0].toUpperCase()}
												</Text>
											</View>
										)}
										<View style={styles.ownerDetails}>
											<View style={styles.nameRow}>
												<Text style={styles.ownerName}>
													{user?.name ??
														'My WorkTrack'}
												</Text>
												<View
													style={[
														styles.permissionBadge,
														styles.writeBadge,
													]}
												>
													<Text
														style={
															styles.permissionBadgeText
														}
													>
														Owner
													</Text>
												</View>
												{myWorkTrack.id ===
													defaultWorkTrackId && (
													<View
														style={
															styles.defaultBadge
														}
													>
														<Text
															style={
																styles.badgeText
															}
														>
															Default
														</Text>
													</View>
												)}
											</View>
											<Text style={styles.ownerEmail}>
												{user?.email}
											</Text>
										</View>
									</View>
									{myWorkTrack.id === currentWorkTrackId && (
										<MaterialCommunityIcons
											name='check-circle'
											size={24}
											color='#4CAF50'
											style={styles.currentIndicator}
										/>
									)}
								</View>
							</Pressable>
							<View style={styles.sectionDivider} />
						</>
					)}

					{/* Shared WorkTracks */}
					<View style={styles.sharedSection}>
						<Text style={styles.sectionTitle}>
							Shared WorkTracks
						</Text>
						{otherWorkTracks.length > 0 ? (
							<View style={styles.sharedList}>
								{otherWorkTracks.map((workTrack, index) => (
									<React.Fragment key={workTrack.id}>
										<Pressable
											style={({ pressed }) => [
												styles.workTrackItem,
												workTrack.id ===
													currentWorkTrackId &&
													styles.selectedWorkTrackItem,
												pressed &&
													styles.workTrackItemPressed,
											]}
											onPress={() =>
												onWorkTrackSelect(workTrack.id)
											}
										>
											<View style={styles.workTrackInfo}>
												<View style={styles.ownerInfo}>
													{workTrack.ownerPhoto ? (
														<Image
															source={{
																uri: workTrack.ownerPhoto,
															}}
															style={
																styles.ownerPhoto
															}
														/>
													) : (
														<View
															style={
																styles.ownerPhotoPlaceholder
															}
														>
															<MaterialCommunityIcons
																name='account'
																size={24}
																color='#666'
															/>
														</View>
													)}
													<View
														style={
															styles.ownerDetails
														}
													>
														<View
															style={
																styles.nameRow
															}
														>
															<Text
																style={
																	styles.ownerName
																}
															>
																{
																	workTrack.ownerName
																}
															</Text>
															<View
																style={[
																	styles.permissionBadge,
																	workTrack.permission ===
																	'write'
																		? styles.writeBadge
																		: styles.readBadge,
																]}
															>
																<Text
																	style={
																		styles.permissionBadgeText
																	}
																>
																	{workTrack.permission ===
																	'write'
																		? 'Write'
																		: 'Read'}
																</Text>
															</View>
															{workTrack.id ===
																defaultWorkTrackId && (
																<View
																	style={
																		styles.defaultBadge
																	}
																>
																	<Text
																		style={
																			styles.badgeText
																		}
																	>
																		Default
																	</Text>
																</View>
															)}
														</View>
														<Text
															style={
																styles.ownerEmail
															}
														>
															{
																workTrack.ownerEmail
															}
														</Text>
													</View>
												</View>
												{workTrack.id ===
													currentWorkTrackId && (
													<MaterialCommunityIcons
														name='check-circle'
														size={24}
														color='#4CAF50'
														style={
															styles.currentIndicator
														}
													/>
												)}
											</View>
										</Pressable>
										{index < otherWorkTracks.length - 1 && (
											<View style={styles.divider} />
										)}
									</React.Fragment>
								))}
							</View>
						) : (
							<View style={styles.emptyStateContainer}>
								<View style={styles.emptyState}>
									<MaterialCommunityIcons
										name='account-group-outline'
										size={48}
										color={colors.text.secondary}
										style={styles.emptyStateIcon}
									/>
									<Text style={styles.emptyStateTitle}>
										No Shared WorkTracks
									</Text>
									<Text style={styles.emptyStateText}>
										Use the + button above to share your
										WorkTrack with others
									</Text>
								</View>
							</View>
						)}
					</View>

					<View style={styles.noteContainer}>
						<View style={styles.noteContent}>
							<MaterialCommunityIcons
								name='information-outline'
								size={16}
								color={colors.text.secondary}
							/>
							<Text style={styles.noteText}>
								Set your default WorkTrack in Profile screen
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</BottomSheetView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background.primary,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
	},
	addButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: colors.office,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: colors.office,
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	scrollContent: {
		flexGrow: 1,
	},
	list: {
		paddingBottom: 16,
	},
	sectionTitle: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.secondary,
		fontSize: 14,
		marginBottom: 12,
		marginTop: 8,
	},
	workTrackItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: colors.background.secondary,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	selectedWorkTrackItem: {
		borderWidth: 1,
		borderColor: colors.office,
	},
	workTrackItemPressed: {
		opacity: 0.7,
	},
	workTrackInfo: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	ownerInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	ownerDetails: {
		flex: 1,
	},
	ownerPhoto: {
		width: 44,
		height: 44,
		borderRadius: 22,
		marginRight: 12,
	},
	ownerPhotoPlaceholder: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.office + '15',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	ownerPhotoPlaceholderText: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.office,
		fontSize: 18,
	},
	nameRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 2,
	},
	ownerName: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.primary,
	},
	ownerEmail: {
		fontFamily: fonts.PoppinsRegular,
		color: colors.text.secondary,
		fontSize: 12,
	},
	permissionBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		backgroundColor: colors.office + '15',
		marginLeft: 8,
	},
	readBadge: {
		backgroundColor: colors.ui.gray[200],
	},
	writeBadge: {
		backgroundColor: colors.office + '15',
	},
	permissionBadgeText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 12,
		color: colors.text.secondary,
	},
	defaultBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 4,
		backgroundColor: colors.office + '15',
		marginLeft: 8,
	},
	badgeText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 12,
		color: colors.office,
	},
	currentIndicator: {
		marginLeft: 8,
	},
	divider: {
		height: 1,
		backgroundColor: colors.ui.gray[100],
		marginLeft: 72, // 44 (photo width) + 12 (margin) + 16 (padding)
		marginBottom: 8,
	},
	sectionDivider: {
		height: 1,
		backgroundColor: colors.ui.gray[200],
		marginVertical: 16,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	noteContainer: {
		alignItems: 'center',
		marginTop: 12,
	},
	noteContent: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: colors.background.secondary,
		borderRadius: 6,
		padding: 12,
	},
	noteText: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 12,
		color: colors.text.secondary,
	},
	sharedSection: {
		marginTop: 8,
	},
	sharedList: {
		gap: 8,
	},
	emptyStateContainer: {
		paddingVertical: 20,
	},
	emptyState: {
		alignItems: 'center',
		padding: 24,
	},
	emptyStateIcon: {
		marginBottom: 16,
		opacity: 0.5,
	},
	emptyStateTitle: {
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 18,
		color: colors.text.primary,
		marginBottom: 8,
	},
	emptyStateText: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 14,
		color: colors.text.secondary,
		textAlign: 'center',
	},
});

export default WorkTrackSwitcher;
