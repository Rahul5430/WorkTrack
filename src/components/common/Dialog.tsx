import React from 'react';
import {
	ActivityIndicator,
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import { fonts } from '../../themes';
import { colors } from '../../themes/colors';

interface DialogProps {
	isVisible: boolean;
	onBackdropPress: () => void;
	title: string;
	subtitle?: string;
	loading?: boolean;
	onDismiss: () => void;
	onConfirm: () => void;
	confirmText?: string;
	cancelText?: string;
	children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({
	isVisible,
	onBackdropPress,
	title,
	subtitle,
	loading = false,
	onDismiss,
	onConfirm,
	confirmText = 'Confirm',
	cancelText = 'Cancel',
	children,
}) => {
	if (!isVisible) return null;

	return (
		<View style={styles.dialogOverlay}>
			<Pressable
				testID='dialog-backdrop'
				style={styles.dialogBackdrop}
				onPress={onBackdropPress}
			/>
			<Pressable
				testID='dialog-content'
				style={styles.dialog}
				onPress={() => {
					Keyboard.dismiss();
				}}
			>
				<Text style={styles.dialogTitle}>{title}</Text>
				<View style={styles.dialogContent}>
					{subtitle && (
						<Text style={styles.dialogSubtitle}>{subtitle}</Text>
					)}
					<View testID='dialog-children'>{children}</View>
				</View>
				<View style={styles.dialogActions}>
					<Pressable
						testID='dialog-cancel-button'
						onPress={() => {
							Keyboard.dismiss();
							onDismiss();
						}}
						style={({ pressed }) => [
							styles.dialogButton,
							{ opacity: pressed ? 0.8 : 1 },
						]}
					>
						<Text style={styles.dialogButtonText}>
							{cancelText}
						</Text>
					</Pressable>
					<Pressable
						testID='dialog-confirm-button'
						onPress={() => {
							Keyboard.dismiss();
							onConfirm();
						}}
						disabled={loading}
						style={({ pressed }) => [
							styles.dialogButton,
							styles.dialogButtonPrimary,
							{ opacity: pressed ? 0.8 : 1 },
						]}
					>
						{loading ? (
							<ActivityIndicator
								testID='activity-indicator'
								color={colors.background.primary}
							/>
						) : (
							<Text
								style={[
									styles.dialogButtonText,
									styles.dialogButtonTextPrimary,
								]}
							>
								{confirmText}
							</Text>
						)}
					</Pressable>
				</View>
			</Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	dialogOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 9999,
	},
	dialogBackdrop: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: colors.ui.backdrop,
	},
	dialog: {
		backgroundColor: colors.background.primary,
		borderRadius: 12,
		width: '90%',
		maxWidth: 400,
		padding: 20,
		zIndex: 1,
	},
	dialogTitle: {
		fontFamily: fonts.PoppinsSemiBold,
		fontSize: 20,
		color: colors.text.primary,
		marginBottom: 16,
	},
	dialogContent: {
		marginBottom: 20,
	},
	dialogSubtitle: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 16,
		color: colors.text.secondary,
		marginBottom: 16,
	},
	dialogActions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	dialogButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginLeft: 8,
	},
	dialogButtonPrimary: {
		backgroundColor: colors.office,
	},
	dialogButtonText: {
		fontFamily: fonts.PoppinsMedium,
		fontSize: 14,
		color: colors.text.primary,
	},
	dialogButtonTextPrimary: {
		color: colors.background.primary,
	},
});

export default Dialog;
