import * as React from 'react';
import { TextInput } from 'react-native';

interface TextFieldProps {
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
}

export default function TextField({
	value,
	onChangeText,
	placeholder,
}: TextFieldProps) {
	return (
		<TextInput
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
		/>
	);
}
