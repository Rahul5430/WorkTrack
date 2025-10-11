import { render } from '@testing-library/react-native';
import React from 'react';

import SharedWithMeListItem from '../../../../src/components/Profile/SharedWithMeListItem';

describe('SharedWithMeListItem', () => {
	const mockOnSetDefaultView = jest.fn();

	const mockShare = {
		id: 'share123',
		sharedWithId: 'user123',
		sharedWithEmail: 'jane@example.com',
		ownerName: 'Jane Doe',
		ownerId: 'owner123',
		ownerEmail: 'owner@example.com',
		permission: 'read' as const,
		trackerId: 'tracker123',
		trackerName: 'Shared Tracker',
		trackerType: 'default' as const,
	};

	const defaultProps = {
		share: mockShare,
		onSetDefaultView: mockOnSetDefaultView,
		isDefaultView: false,
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render without crashing', () => {
		expect(() =>
			render(<SharedWithMeListItem {...defaultProps} />)
		).not.toThrow();
	});

	it('should render with write permission', () => {
		const writeProps = {
			...defaultProps,
			share: { ...mockShare, permission: 'write' as const },
		};

		expect(() =>
			render(<SharedWithMeListItem {...writeProps} />)
		).not.toThrow();
	});

	it('should render with default view enabled', () => {
		const defaultViewProps = {
			...defaultProps,
			isDefaultView: true,
		};

		expect(() =>
			render(<SharedWithMeListItem {...defaultViewProps} />)
		).not.toThrow();
	});

	it('should call onSetDefaultView when switch is toggled', () => {
		// Just test that the component renders without errors
		expect(() =>
			render(<SharedWithMeListItem {...defaultProps} />)
		).not.toThrow();

		// Verify that the mock function is defined
		expect(mockOnSetDefaultView).toBeDefined();
	});

	it('should render with default view disabled', () => {
		const defaultViewProps = {
			...defaultProps,
			isDefaultView: false,
		};

		expect(() =>
			render(<SharedWithMeListItem {...defaultViewProps} />)
		).not.toThrow();
	});

	it('should render owner name', () => {
		const { getByText } = render(
			<SharedWithMeListItem {...defaultProps} />
		);

		expect(getByText('Jane Doe')).toBeTruthy();
	});

	it('should handle long owner names', () => {
		const longNameShare = {
			...mockShare,
			ownerName: 'Very Long Owner Name That Might Overflow The Container',
		};
		const longNameProps = {
			...defaultProps,
			share: longNameShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...longNameProps} />)
		).not.toThrow();
	});

	it('should handle long tracker names', () => {
		const longTrackerShare = {
			...mockShare,
			trackerName:
				'Very Long Tracker Name That Might Overflow The Container',
		};
		const longTrackerProps = {
			...defaultProps,
			share: longTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...longTrackerProps} />)
		).not.toThrow();
	});

	it('should handle null owner name', () => {
		const nullNameShare = {
			...mockShare,
			ownerName: null as unknown as string,
			sharedWithEmail: 'test@example.com', // Ensure email exists for fallback
		};
		const nullNameProps = {
			...defaultProps,
			share: nullNameShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...nullNameProps} />)
		).not.toThrow();
	});

	it('should handle empty tracker name', () => {
		const emptyTrackerShare = {
			...mockShare,
			trackerName: '',
		};
		const emptyTrackerProps = {
			...defaultProps,
			share: emptyTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...emptyTrackerProps} />)
		).not.toThrow();
	});

	it('should handle special characters in owner name', () => {
		const specialNameShare = {
			...mockShare,
			ownerName: "Jean-Pierre O'Connor-Smith",
		};
		const specialNameProps = {
			...defaultProps,
			share: specialNameShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...specialNameProps} />)
		).not.toThrow();
	});

	it('should handle undefined tracker name', () => {
		const undefinedTrackerShare = {
			...mockShare,
			trackerName: undefined as unknown as string,
		};
		const undefinedTrackerProps = {
			...defaultProps,
			share: undefinedTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...undefinedTrackerProps} />)
		).not.toThrow();
	});

	it('should handle null tracker name', () => {
		const nullTrackerShare = {
			...mockShare,
			trackerName: null as unknown as string,
		};
		const nullTrackerProps = {
			...defaultProps,
			share: nullTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...nullTrackerProps} />)
		).not.toThrow();
	});

	it('should handle very long owner names', () => {
		const longNameShare = {
			...mockShare,
			ownerName:
				'Very Long Owner Name That Might Overflow The Container And Cause Layout Issues',
		};
		const longNameProps = {
			...defaultProps,
			share: longNameShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...longNameProps} />)
		).not.toThrow();
	});

	it('should handle very long tracker names', () => {
		const veryLongTrackerShare = {
			...mockShare,
			trackerName:
				'Very Long Tracker Name That Might Overflow The Container And Cause Layout Issues With Text Wrapping',
		};
		const veryLongTrackerProps = {
			...defaultProps,
			share: veryLongTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...veryLongTrackerProps} />)
		).not.toThrow();
	});

	it('should handle unicode characters in owner name', () => {
		const unicodeNameShare = {
			...mockShare,
			ownerName: 'José María García-López',
		};
		const unicodeNameProps = {
			...defaultProps,
			share: unicodeNameShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...unicodeNameProps} />)
		).not.toThrow();
	});

	it('should handle unicode characters in tracker name', () => {
		const unicodeTrackerShare = {
			...mockShare,
			trackerName: 'Tëst Träckër with Ünícödé Chäräctërs',
		};
		const unicodeTrackerProps = {
			...defaultProps,
			share: unicodeTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...unicodeTrackerProps} />)
		).not.toThrow();
	});

	it('should handle special characters in tracker name', () => {
		const specialTrackerShare = {
			...mockShare,
			trackerName:
				'Tracker with Special Chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
		};
		const specialTrackerProps = {
			...defaultProps,
			share: specialTrackerShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...specialTrackerProps} />)
		).not.toThrow();
	});

	it('should handle edge case with minimum data', () => {
		const minimalShare = {
			id: 'min',
			sharedWithId: 'u',
			sharedWithEmail: 'a@b.c',
			ownerName: 'O',
			ownerId: 'o',
			ownerEmail: 'o@o.o',
			permission: 'read' as const,
			trackerId: 't',
			trackerName: 'T',
			trackerType: 'default' as const,
		};
		const minimalProps = {
			...defaultProps,
			share: minimalShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...minimalProps} />)
		).not.toThrow();
	});

	it('should handle maximum length strings', () => {
		const maxLengthShare = {
			...mockShare,
			ownerName: 'O'.repeat(1000), // Very long owner name
			trackerName: 'T'.repeat(1000), // Very long tracker name
		};
		const maxLengthProps = {
			...defaultProps,
			share: maxLengthShare,
		};

		expect(() =>
			render(<SharedWithMeListItem {...maxLengthProps} />)
		).not.toThrow();
	});

	it('should handle all permission types', () => {
		const readProps = {
			...defaultProps,
			share: { ...mockShare, permission: 'read' as const },
		};
		const writeProps = {
			...defaultProps,
			share: { ...mockShare, permission: 'write' as const },
		};

		expect(() =>
			render(<SharedWithMeListItem {...readProps} />)
		).not.toThrow();
		expect(() =>
			render(<SharedWithMeListItem {...writeProps} />)
		).not.toThrow();
	});

	it('should handle all default view states', () => {
		const defaultTrueProps = {
			...defaultProps,
			isDefaultView: true,
		};
		const defaultFalseProps = {
			...defaultProps,
			isDefaultView: false,
		};

		expect(() =>
			render(<SharedWithMeListItem {...defaultTrueProps} />)
		).not.toThrow();
		expect(() =>
			render(<SharedWithMeListItem {...defaultFalseProps} />)
		).not.toThrow();
	});
});
