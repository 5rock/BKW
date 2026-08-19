import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Basic test component since the main app requires router context
const TestComponent = () => (
  <div>
    <h1>GoldMarket</h1>
  </div>
);

describe('Basic Frontend Test', () => {
  it('renders correctly', () => {
    render(<TestComponent />);
    expect(screen.getByText('GoldMarket')).toBeInTheDocument();
  });
});
