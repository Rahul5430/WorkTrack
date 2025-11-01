import * as React from 'react';
import { Button } from 'react-native';

interface PrimaryButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
}

export default function PrimaryButton({
	title,
	onPress,
	disabled,
}: PrimaryButtonProps) {
	return <Button title={title} onPress={onPress} disabled={disabled} />;
}
