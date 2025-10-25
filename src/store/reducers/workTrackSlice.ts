// Temporary stub for migration - will be replaced with actual implementation
export const addOrUpdateEntry = (entry: unknown) => ({
	type: 'workTrack/addOrUpdateEntry',
	payload: entry,
});
export const rollbackEntry = (date: string) => ({
	type: 'workTrack/rollbackEntry',
	payload: date,
});
export const setError = (error: string | null) => ({
	type: 'workTrack/setError',
	payload: error,
});
export const setLoading = (loading: boolean) => ({
	type: 'workTrack/setLoading',
	payload: loading,
});
export const setWorkTrackData = (data: unknown[]) => ({
	type: 'workTrack/setWorkTrackData',
	payload: data,
});
