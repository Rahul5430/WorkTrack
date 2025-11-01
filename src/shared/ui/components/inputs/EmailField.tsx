import * as React from 'react';
import { TextInput } from 'react-native';

interface EmailFieldProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
}

export default function EmailField({
	value,
	onChangeText,
	placeholder,
}: EmailFieldProps) {
	return (
		<TextInput
			autoCapitalize='none'
			keyboardType='email-address'
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
		/>
	);
}
