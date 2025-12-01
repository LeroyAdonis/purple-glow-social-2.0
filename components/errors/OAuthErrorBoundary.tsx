'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  platform?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class OAuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OAuth Error:', error, errorInfo);
    
    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'OAuth',
        platform: this.props.platform || 'unknown',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={this.handleReset}
          title="Connection Failed"
          description={`We couldn't connect to ${this.props.platform || 'the platform'}. Please try again.`}
          icon="fa-solid fa-link-slash"
          variant="card"
        />
      );
    }

    return this.props.children;
  }
}

export default OAuthErrorBoundary;
