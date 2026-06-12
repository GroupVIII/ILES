import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}));

describe('Login Component Test Suite', () => {
  it('renders the authentication title', () => {
    render(<Login />);
    expect(screen.getByText('System Authentication')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /Secure Login/i })).toBeInTheDocument();
  });

  it('toggles to password recovery when Forgot is clicked', () => {
    render(<Login />);
    fireEvent.click(screen.getByText('Forgot?'));
    expect(screen.getByText('Password Recovery')).toBeInTheDocument();
  });
});