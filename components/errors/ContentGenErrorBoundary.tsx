'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ContentGenErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Content Generation Error:', error, errorInfo);
    
    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'ContentGeneration',
        ai: 'gemini',
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
          title="AI Generation Failed"
          description="Our AI couldn't generate your content right now. Try again or adjust your prompt."
          icon="fa-solid fa-robot"
          variant="card"
        />
      );
    }

    return this.props.children;
  }
}

export default ContentGenErrorBoundary;
