import React from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../../theme';

interface ConfirmDialogProps {
	visible: boolean;
	title: string;
	message: string;
	onCancel: () => void;
	onConfirm: () => void;
	cancelText?: string;
	confirmText?: string;
	confirmStyle?: 'default' | 'destructive';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	visible,
	title,
	message,
	onCancel,
	onConfirm,
	cancelText = 'Cancel',
	confirmText = 'Confirm',
	confirmStyle = 'default',
}) => {
	if (!visible) return null;

	return (
		<View style={styles.dialogOverlay}>
			<Pressable
				testID='confirm-dialog-backdrop'
				style={styles.dialogBackdrop}
				onPress={onCancel}
			/>
			<Pressable
				testID='confirm-dialog-content'
				style={styles.dialog}
				onPress={() => {
					Keyboard.dismiss();
				}}
			>
				<Text style={styles.dialogTitle}>{title}</Text>
				<View style={styles.dialogContent}>
					<Text style={styles.dialogMessage}>{message}</Text>
				</View>
				<View style={styles.dialogActions}>
					<Pressable
						testID='confirm-dialog-cancel-button'
						onPress={() => {
							Keyboard.dismiss();
							onCancel();
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
						testID='confirm-dialog-confirm-button'
						onPress={() => {
							Keyboard.dismiss();
							onConfirm();
						}}
						style={({ pressed }) => [
							styles.dialogButton,
							confirmStyle === 'destructive'
								? styles.dialogButtonDestructive
								: styles.dialogButtonPrimary,
							{ opacity: pressed ? 0.8 : 1 },
						]}
					>
						<Text
							style={[
								styles.dialogButtonText,
								styles.dialogButtonTextPrimary,
							]}
						>
							{confirmText}
						</Text>
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
	dialogMessage: {
		fontFamily: fonts.PoppinsRegular,
		fontSize: 16,
		color: colors.text.secondary,
		lineHeight: 24,
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
	dialogButtonDestructive: {
		backgroundColor: colors.error,
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

export default ConfirmDialog;
