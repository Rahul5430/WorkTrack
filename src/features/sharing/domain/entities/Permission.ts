export type PermissionType = 'read' | 'write';

export class Permission {
	constructor(public readonly value: PermissionType) {
		if (value !== 'read' && value !== 'write') {
			throw new Error('Invalid permission');
		}
	}

	isWrite(): boolean {
		return this.value === 'write';
	}

	toString(): string {
		return this.value;
	}
}
