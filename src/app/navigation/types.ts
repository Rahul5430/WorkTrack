import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type MainStackParamList = {
	HomeScreen: undefined;
	ProfileScreen: {
		scrollToSection?: 'sharedWithMe';
		highlightWorkTrackId?: string;
	};
};

export type AuthStackParamList = {
	WelcomeScreen: undefined;
};

export type LoadingStackParamList = {
	LoadingScreen: undefined;
};

export type RootStackParamList = {
	MainStack: NavigatorScreenParams<MainStackParamList>;
	AuthStack: NavigatorScreenParams<AuthStackParamList>;
	LoadingStack: NavigatorScreenParams<LoadingStackParamList>;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
	NativeStackScreenProps<RootStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
	NativeStackScreenProps<MainStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
	NativeStackScreenProps<AuthStackParamList, T>;

export type LoadingStackScreenProps<T extends keyof LoadingStackParamList> =
	NativeStackScreenProps<LoadingStackParamList, T>;

declare global {
	namespace ReactNavigation {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface RootParamList extends RootStackParamList {}
	}
}
