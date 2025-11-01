// Minimal secure storage shim (can be replaced by Keychain later)
export class SecureStorage {
	async getItem(_key: string): Promise<string | null> {
		return null;
	}
	async setItem(_key: string, _value: string): Promise<void> {}
	async removeItem(_key: string): Promise<void> {}
}
