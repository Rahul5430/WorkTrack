import * as React from 'react';

interface ErrorBoundaryProps {
	children?: React.ReactNode;
	fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

export default class ErrorBoundary extends React.Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	componentDidCatch(_error: unknown): void {}

	render(): React.ReactNode {
		if (this.state.hasError) return this.props.fallback ?? null;
		return this.props.children ?? null;
	}
}
