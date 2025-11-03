// Status value object
import {
	WORK_STATUS_VALUES,
	type WorkStatusType,
} from '@/shared/types/workStatus';

export class WorkStatus {
	private readonly _value: WorkStatusType;

	constructor(value: WorkStatusType | string) {
		this._value = WorkStatus.validate(value);
	}

	get value(): WorkStatusType {
		return this._value;
	}

	static allowed(): WorkStatusType[] {
		return [...WORK_STATUS_VALUES];
	}

	static validate(value: WorkStatusType | string): WorkStatusType {
		const v = String(value).toLowerCase();
		if (!WorkStatus.allowed().includes(v as WorkStatusType)) {
			throw new Error(`Invalid work status: ${value}`);
		}
		return v as WorkStatusType;
	}

	equals(other: WorkStatus | null | undefined): boolean {
		return !!other && this._value === other._value;
	}

	toString(): string {
		return this._value;
	}
}
