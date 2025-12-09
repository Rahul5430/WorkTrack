import * as React from 'react';
import { Button } from 'react-native';

interface SecondaryButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
}

export default function SecondaryButton({
	title,
	onPress,
	disabled,
}: SecondaryButtonProps) {
	return <Button title={title} onPress={onPress} disabled={disabled} />;
}
