import { MarkedDayStatus } from '../types/calendar';

/**
 * Common validation utilities
 */
export class ValidationUtils {
	/**
	 * Validates MarkedDayStatus values
	 */
	static validateStatus(status: string): status is MarkedDayStatus {
		const validStatuses: MarkedDayStatus[] = [
			'wfh',
			'office',
			'holiday',
			'leave',
		];
		return validStatuses.includes(status as MarkedDayStatus);
	}

	/**
	 * Validates date format (YYYY-MM-DD)
	 */
	static validateDate(date: string): boolean {
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateRegex.test(date)) return false;

		const parsedDate = new Date(date);
		return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
	}

	/**
	 * Validates tracker ID format
	 */
	static validateTrackerId(trackerId: string): boolean {
		return typeof trackerId === 'string' && trackerId.length > 0;
	}

	/**
	 * Validates entry data structure
	 */
	static validateEntryData(data: {
		trackerId: string;
		date: string;
		status: string;
		isAdvisory: boolean;
	}): boolean {
		return (
			this.validateTrackerId(data.trackerId) &&
			this.validateDate(data.date) &&
			this.validateStatus(data.status) &&
			typeof data.isAdvisory === 'boolean'
		);
	}
}
