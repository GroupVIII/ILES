import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    defaults: { headers: { common: {} } }
  }
}));

describe('Login Component', () => {
  it('renders the authentication title', () => {
    render(<Login />);
    expect(screen.getByText('System Authentication')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Secure Login/i })).toBeInTheDocument();
  });

  it('renders username and password inputs', () => {
    const { container } = render(<Login />);
    expect(container.querySelector('input[name="username"]')).toBeInTheDocument();
    expect(container.querySelector('input[name="password"]')).toBeInTheDocument();
  });

  it('toggles to password recovery when Forgot is clicked', () => {
    const { container } = render(<Login />);
    fireEvent.click(screen.getByText('Forgot?'));
    expect(screen.getByText('Password Recovery')).toBeInTheDocument();
    expect(container.querySelector('input[type="email"]')).toBeInTheDocument();
  });
});