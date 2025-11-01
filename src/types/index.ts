export type {
	AuthStackParamList,
	AuthStackScreenProps,
	LoadingStackParamList,
	LoadingStackScreenProps,
	MainStackParamList,
	MainStackScreenProps,
	RootStackParamList,
	RootStackScreenProps,
} from '@/app/navigation/types';

// Re-export shared domain types
export type {
	AppError,
	AuthenticationError,
	BaseEntity,
	Email,
	NetworkError,
	SyncError,
	Timestamp,
	UUID,
	ValidationError,
} from '@/shared/domain';

// Re-export DI types
export type {
	Disposable,
	Container as IContainer,
	ContainerBuilder as IContainerBuilder,
	ServiceFactory,
	ServiceIdentifier,
	ServiceRegistration,
	ServiceRegistrationError,
	ServiceResolutionError,
	ServiceScope,
} from '@/di';

// Re-export shared UI types
// Note: Theme types are defined locally in this file below

// Global utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common API response types
export interface ApiResponse<T = unknown> {
	data: T;
	success: boolean;
	message?: string;
	error?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Common form types
export interface FormField<T = unknown> {
	value: T;
	error?: string;
	touched: boolean;
	required: boolean;
}

export interface FormState<T = Record<string, unknown>> {
	fields: { [K in keyof T]: FormField<T[K]> };
	isValid: boolean;
	isSubmitting: boolean;
	isDirty: boolean;
}

// Common state types
export interface LoadingState {
	isLoading: boolean;
	error?: string;
}

export interface AsyncState<T = unknown> extends LoadingState {
	data?: T;
}

// Common component props
export interface BaseComponentProps {
	children?: React.ReactNode;
	className?: string;
	testID?: string;
}

export interface StyledComponentProps extends BaseComponentProps {
	style?: React.CSSProperties;
}

// Common hook return types
export interface UseAsyncReturn<T = unknown> extends AsyncState<T> {
	execute: (...args: unknown[]) => Promise<void>;
	reset: () => void;
}

export interface UseFormReturn<T = Record<string, unknown>>
	extends FormState<T> {
	setValue: <K extends keyof T>(field: K, value: T[K]) => void;
	setError: <K extends keyof T>(field: K, error: string) => void;
	clearError: <K extends keyof T>(field: K) => void;
	handleSubmit: (
		onSubmit: (values: T) => void
	) => (e?: React.FormEvent) => void;
	reset: () => void;
}

// Common event types
export interface CustomEvent<T = unknown> {
	type: string;
	payload: T;
	timestamp: number;
}

// Common configuration types
export interface AppConfig {
	api: {
		baseUrl: string;
		timeout: number;
		retries: number;
	};
	features: {
		[feature: string]: boolean;
	};
	environment: 'development' | 'staging' | 'production';
}

// Common error types
export interface AppErrorInfo {
	code: string;
	message: string;
	statusCode?: number;
	context?: Record<string, unknown>;
	timestamp: number;
	stack?: string;
}

// Common validation types
export interface ValidationRule<T = unknown> {
	required?: boolean;
	min?: number;
	max?: number;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	custom?: (value: T) => string | undefined;
}

export type ValidationSchema<T = Record<string, unknown>> = {
	[K in keyof T]?: ValidationRule<T[K]>;
};

// Common storage types
export interface StorageItem<T = unknown> {
	key: string;
	value: T;
	expiresAt?: number;
}

// Common navigation types
export interface NavigationState {
	index: number;
	routes: Array<{
		key: string;
		name: string;
		params?: Record<string, unknown>;
	}>;
}

// WorkTrack specific types
export type MarkedDayStatus =
	| 'office'
	| 'wfh'
	| 'holiday'
	| 'leave'
	| 'weekend'
	| 'forecast';

export interface MarkedDay {
	date: string;
	status: MarkedDayStatus;
	isAdvisory: boolean;
}

// Common theme types
export interface ColorPalette {
	primary: string;
	secondary: string;
	accent: string;
	background: string;
	surface: string;
	text: string;
	textSecondary: string;
	border: string;
	error: string;
	warning: string;
	success: string;
	info: string;
}

export interface SpacingScale {
	xs: number;
	sm: number;
	md: number;
	lg: number;
	xl: number;
	xxl: number;
}

export interface TypographyScale {
	h1: React.CSSProperties;
	h2: React.CSSProperties;
	h3: React.CSSProperties;
	h4: React.CSSProperties;
	h5: React.CSSProperties;
	h6: React.CSSProperties;
	body1: React.CSSProperties;
	body2: React.CSSProperties;
	caption: React.CSSProperties;
	overline: React.CSSProperties;
}
