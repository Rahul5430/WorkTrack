import workTrackReducer, {
	addOrUpdateEntry,
	rollbackEntry,
	selectSyncStatus,
	setError,
	setLoading,
	setWorkTrackData,
	updateSyncStatus,
	WorkTrackState,
} from '../../../../src/store/reducers/workTrackSlice';

describe('workTrackSlice', () => {
	const initialState: WorkTrackState = {
		data: [],
		markedDays: {},
		loading: false,
		error: null,
		syncStatus: {
			isSyncing: false,
			isOnline: true,
			pendingSyncs: 0,
		},
	};

	it('should return the initial state', () => {
		expect(workTrackReducer(undefined, { type: 'unknown' })).toEqual(
			initialState
		);
	});

	it('should handle setWorkTrackData', () => {
		const mockData = [
			{
				date: '2025-01-01',
				status: 'office' as const,
				isAdvisory: false,
			},
			{
				date: '2025-01-02',
				status: 'wfh' as const,
				isAdvisory: true,
			},
		];

		const actual = workTrackReducer(
			initialState,
			setWorkTrackData(mockData)
		);

		expect(actual.data).toEqual(mockData);
		expect(actual.markedDays).toEqual({
			'2025-01-01': { status: 'office', isAdvisory: false },
			'2025-01-02': { status: 'wfh', isAdvisory: true },
		});
	});

	it('should handle addOrUpdateEntry - adding new entry', () => {
		const newEntry = {
			date: '2025-01-03',
			status: 'holiday' as const,
			isAdvisory: false,
		};

		const actual = workTrackReducer(
			initialState,
			addOrUpdateEntry(newEntry)
		);

		expect(actual.data).toHaveLength(1);
		expect(actual.data[0]).toEqual(newEntry);
		expect(actual.markedDays['2025-01-03']).toEqual({
			status: 'holiday',
			isAdvisory: false,
		});
	});

	it('should handle addOrUpdateEntry - updating existing entry', () => {
		const existingState: WorkTrackState = {
			...initialState,
			data: [
				{
					date: '2025-01-01',
					status: 'office' as const,
					isAdvisory: false,
				},
			],
			markedDays: {
				'2025-01-01': { status: 'office', isAdvisory: false },
			},
		};

		const updatedEntry = {
			date: '2025-01-01',
			status: 'wfh' as const,
			isAdvisory: true,
		};

		const actual = workTrackReducer(
			existingState,
			addOrUpdateEntry(updatedEntry)
		);

		expect(actual.data).toHaveLength(1);
		expect(actual.data[0]).toEqual(updatedEntry);
		expect(actual.markedDays['2025-01-01']).toEqual({
			status: 'wfh',
			isAdvisory: true,
		});
	});

	it('should handle rollbackEntry', () => {
		const existingState: WorkTrackState = {
			...initialState,
			data: [
				{
					date: '2025-01-01',
					status: 'office' as const,
					isAdvisory: false,
				},
				{
					date: '2025-01-02',
					status: 'wfh' as const,
					isAdvisory: false,
				},
			],
			markedDays: {
				'2025-01-01': { status: 'office', isAdvisory: false },
				'2025-01-02': { status: 'wfh', isAdvisory: false },
			},
		};

		const actual = workTrackReducer(
			existingState,
			rollbackEntry('2025-01-01')
		);

		expect(actual.data).toHaveLength(1);
		expect(actual.data[0].date).toBe('2025-01-02');
		expect(actual.markedDays).not.toHaveProperty('2025-01-01');
		expect(actual.markedDays).toHaveProperty('2025-01-02');
	});

	it('should handle setLoading', () => {
		const actual = workTrackReducer(initialState, setLoading(true));
		expect(actual.loading).toBe(true);

		const actualFalse = workTrackReducer(initialState, setLoading(false));
		expect(actualFalse.loading).toBe(false);
	});

	it('should handle setError', () => {
		const errorMessage = 'Something went wrong';
		const actual = workTrackReducer(initialState, setError(errorMessage));
		expect(actual.error).toBe(errorMessage);

		const actualNull = workTrackReducer(initialState, setError(null));
		expect(actualNull.error).toBeNull();
	});

	it('should handle updateSyncStatus', () => {
		const syncUpdate = {
			isSyncing: true,
			isOnline: false,
			lastSyncTime: Date.now(),
			error: 'Network error',
			pendingSyncs: 5,
		};

		const actual = workTrackReducer(
			initialState,
			updateSyncStatus(syncUpdate)
		);

		expect(actual.syncStatus).toEqual({
			isSyncing: true,
			isOnline: false,
			lastSyncTime: syncUpdate.lastSyncTime,
			error: 'Network error',
			pendingSyncs: 5,
		});
	});

	it('should handle partial syncStatus update', () => {
		const partialUpdate = {
			isSyncing: true,
		};

		const actual = workTrackReducer(
			initialState,
			updateSyncStatus(partialUpdate)
		);

		expect(actual.syncStatus.isSyncing).toBe(true);
		expect(actual.syncStatus.isOnline).toBe(true); // Should remain unchanged
		expect(actual.syncStatus.pendingSyncs).toBe(0); // Should remain unchanged
	});

	it('should handle multiple actions', () => {
		let state = workTrackReducer(initialState, setLoading(true));
		state = workTrackReducer(state, setError('Test error'));
		state = workTrackReducer(state, updateSyncStatus({ isSyncing: true }));

		expect(state.loading).toBe(true);
		expect(state.error).toBe('Test error');
		expect(state.syncStatus.isSyncing).toBe(true);
	});

	it('should handle selectSyncStatus selector', () => {
		const state = {
			workTrack: {
				...initialState,
				syncStatus: {
					isSyncing: true,
					isOnline: false,
					lastSyncTime: 1234567890,
					error: 'Test error',
					pendingSyncs: 3,
				},
			},
		};

		const syncStatus = selectSyncStatus(state);

		expect(syncStatus).toEqual({
			isSyncing: true,
			isOnline: false,
			lastSyncTime: 1234567890,
			error: 'Test error',
			pendingSyncs: 3,
		});
	});
});
