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

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Payment Error:', error, errorInfo);
    
    // Report to Sentry with high priority
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        component: 'Payment',
        critical: 'true',
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
          title="Payment Error"
          description="We couldn't process your payment. Please try again or contact support if the issue persists."
          icon="fa-solid fa-credit-card"
          showDetails={false}
        />
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary;
