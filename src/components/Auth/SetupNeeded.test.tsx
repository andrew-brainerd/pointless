import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SetupNeeded } from './SetupNeeded';

describe('SetupNeeded', () => {
  it('explains which env vars to set', () => {
    render(<SetupNeeded />);
    expect(screen.getByRole('heading', { name: /setup needed/i })).toBeInTheDocument();
    expect(screen.getByText(/VITE_FIREBASE_\*/)).toBeInTheDocument();
    expect(screen.getByText(/\.env\.local/)).toBeInTheDocument();
  });
});
