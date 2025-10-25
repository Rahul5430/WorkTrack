// Temporary stub for migration - will be replaced with actual implementation
export const logout = () => ({ type: 'user/logout' });
export const setUser = (user: unknown) => ({
	type: 'user/setUser',
	payload: user,
});
