import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

describe('Login Component', () => {
  
  // TEST 1: Renders standard login by default
  test('renders the authentication title', () => {
    render(<Login onLoginSuccess={() => {}} />);
    const titleElement = screen.getByText(/System Authentication/i);
    expect(titleElement).toBeInTheDocument();
  });

  // TEST 2: Check input fields exist
  test('renders username and password inputs', () => {
    render(<Login onLoginSuccess={() => {}} />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  // TEST 3: Toggles to Forgot Password view
  test('toggles to password recovery when Forgot is clicked', () => {
    render(<Login onLoginSuccess={() => {}} />);
    const forgotButton = screen.getByText(/Forgot\?/i);
    fireEvent.click(forgotButton);
    
    expect(screen.getByText(/Password Recovery/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Registered Email/i)).toBeInTheDocument();
  });

});