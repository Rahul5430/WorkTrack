import type { NavigatorScreenParams } from '@react-navigation/native';

import type {
	AuthenticatedStackParamList,
	AuthenticatedStackScreenProps,
	LoadingStackParamList,
	LoadingStackScreenProps,
	MainStackParamList,
	WelcomeStackParamList,
	WelcomeStackScreenProps,
} from '../../../src/types/navigation';

describe('Navigation Types', () => {
	describe('MainStackParamList', () => {
		it('should have correct screen definitions', () => {
			const rootStack: MainStackParamList = {
				AuthenticatedStack:
					{} as NavigatorScreenParams<AuthenticatedStackParamList>,
				LoadingStack:
					{} as NavigatorScreenParams<LoadingStackParamList>,
				WelcomeStack:
					{} as NavigatorScreenParams<WelcomeStackParamList>,
			};

			expect(rootStack).toBeDefined();
			expect(rootStack.AuthenticatedStack).toBeDefined();
			expect(rootStack.LoadingStack).toBeDefined();
			expect(rootStack.WelcomeStack).toBeDefined();
		});
	});

	describe('AuthenticatedStackParamList', () => {
		it('should have correct screen definitions', () => {
			const authenticatedStack: AuthenticatedStackParamList = {
				HomeScreen: undefined,
				ProfileScreen: { scrollToSection: 'sharedWithMe' },
			};

			expect(authenticatedStack).toBeDefined();
			expect(authenticatedStack.HomeScreen).toBeUndefined();
			expect(authenticatedStack.ProfileScreen).toBeDefined();
			expect(authenticatedStack.ProfileScreen?.scrollToSection).toBe(
				'sharedWithMe'
			);
		});
	});

	describe('LoadingStackParamList', () => {
		it('should have correct screen definitions', () => {
			const loadingStack: LoadingStackParamList = {
				LoadingScreen: undefined,
			};

			expect(loadingStack).toBeDefined();
			expect(loadingStack.LoadingScreen).toBeUndefined();
		});
	});

	describe('WelcomeStackParamList', () => {
		it('should have correct screen definitions', () => {
			const welcomeStack: WelcomeStackParamList = {
				WelcomeScreen: undefined,
			};

			expect(welcomeStack).toBeDefined();
			expect(welcomeStack.WelcomeScreen).toBeUndefined();
		});
	});

	describe('Screen Props Types', () => {
		it('should accept AuthenticatedStackScreenProps', () => {
			const mockProps: AuthenticatedStackScreenProps<'HomeScreen'> = {
				navigation: {} as never,
				route: { key: 'test', name: 'HomeScreen', params: undefined },
			};

			expect(mockProps.navigation).toBeDefined();
			expect(mockProps.route.name).toBe('HomeScreen');
			expect(mockProps.route.params).toBeUndefined();
		});

		it('should accept ProfileScreen with params', () => {
			const mockProps: AuthenticatedStackScreenProps<'ProfileScreen'> = {
				navigation: {} as never,
				route: {
					key: 'test',
					name: 'ProfileScreen',
					params: { scrollToSection: 'sharedWithMe' },
				},
			};

			expect(mockProps.navigation).toBeDefined();
			expect(mockProps.route.name).toBe('ProfileScreen');
			expect(mockProps.route.params?.scrollToSection).toBe(
				'sharedWithMe'
			);
		});

		it('should accept LoadingStackScreenProps', () => {
			const mockProps: LoadingStackScreenProps<'LoadingScreen'> = {
				navigation: {} as never,
				route: {
					key: 'test',
					name: 'LoadingScreen',
					params: undefined,
				},
			};

			expect(mockProps.navigation).toBeDefined();
			expect(mockProps.route.name).toBe('LoadingScreen');
			expect(mockProps.route.params).toBeUndefined();
		});

		it('should accept WelcomeStackScreenProps', () => {
			const mockProps: WelcomeStackScreenProps<'WelcomeScreen'> = {
				navigation: {} as never,
				route: {
					key: 'test',
					name: 'WelcomeScreen',
					params: undefined,
				},
			};

			expect(mockProps.navigation).toBeDefined();
			expect(mockProps.route.name).toBe('WelcomeScreen');
			expect(mockProps.route.params).toBeUndefined();
		});
	});
});
