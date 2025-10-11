import React from 'react';

// Mock React Native components that work with HTML test environment
export const MockView = ({
	children,
	testID,
	style,
	...props
}: {
	children: React.ReactNode;
	testID?: string;
	style?: Record<string, unknown>;
	[key: string]: unknown;
}) => (
	<div data-testid={testID} style={style} {...props}>
		{children}
	</div>
);

export const MockText = ({
	children,
	testID,
	style,
	...props
}: {
	children: React.ReactNode;
	testID?: string;
	style?: Record<string, unknown>;
	[key: string]: unknown;
}) => (
	<span data-testid={testID} style={style} {...props}>
		{children}
	</span>
);

export const MockTouchableOpacity = ({
	children,
	testID,
	style,
	onPress,
	...props
}: {
	children: React.ReactNode;
	testID?: string;
	style?: Record<string, unknown>;
	onPress?: () => void;
	[key: string]: unknown;
}) => (
	<div data-testid={testID} style={style} onClick={onPress} {...props}>
		{children}
	</div>
);

export const MockFlatList = ({
	children,
	testID,
	data,
	renderItem,
	keyExtractor,
	...props
}: {
	children: React.ReactNode;
	testID?: string;
	data: unknown[];
	renderItem?: (item: { item: unknown; index: number }) => React.ReactNode;
	keyExtractor?: (item: unknown, index: number) => string;
	[key: string]: unknown;
}) => (
	<div data-testid={testID} {...props}>
		{data?.map((item: unknown, index: number) => (
			<div key={keyExtractor ? keyExtractor(item, index) : index}>
				{renderItem ? renderItem({ item, index }) : children}
			</div>
		))}
	</div>
);

export const MockModal = ({
	children,
	testID,
	visible,
	...props
}: {
	children: React.ReactNode;
	testID?: string;
	visible: boolean;
	[key: string]: unknown;
}) =>
	visible ? (
		<div data-testid={testID} {...props}>
			{children}
		</div>
	) : null;
