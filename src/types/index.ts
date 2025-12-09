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

// WorkTrack specific types
export type MarkedDayStatus =
	| 'office'
	| 'wfh'
	| 'holiday'
	| 'leave'
	| 'weekend'
	| 'forecast'
	| 'advisory';

export interface MarkedDay {
	date: string;
	status: MarkedDayStatus;
	isAdvisory: boolean;
}
