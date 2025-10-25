// migrated to V2 structure
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useResponsiveLayout } from '@/hooks/useResponsive';
import { colors, fonts } from '@/themes';

interface SignInButtonProps {
	onPress: () => void;
	loading?: boolean;
	disabled?: boolean;
	style?: ViewStyle;
}

const SignInButton: React.FC<SignInButtonProps> = ({
	onPress,
	loading = false,
	disabled = false,
	style,
}) => {
	const { RFValue } = useResponsiveLayout();

	return (
		<Pressable
			style={({ pressed }) => [
				styles.button,
				{
					opacity: pressed ? 0.8 : 1,
					backgroundColor: disabled
						? colors.button.disabled
						: colors.button.primary,
				},
				style,
			]}
			onPress={onPress}
			disabled={disabled || loading}
		>
			<Text
				style={[
					styles.buttonText,
					{
						fontSize: RFValue(16),
						color: disabled
							? colors.text.secondary
							: colors.text.light,
					},
				]}
			>
				{loading ? 'Signing in...' : 'Sign In'}
			</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: colors.button.primary,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 48,
	},
	buttonText: {
		fontFamily: fonts.PoppinsMedium,
		color: colors.text.light,
	},
});

export default SignInButton;
