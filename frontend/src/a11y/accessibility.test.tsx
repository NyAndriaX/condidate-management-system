import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';

import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import CandidatesPage from '../pages/CandidatesPage';

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children }: { children: React.ReactNode }) => <a href="/mock">{children}</a>,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true },
);

describe('accessibility', () => {
  const runAxe = async (container: HTMLElement) =>
    axe.run(container, {
      rules: {
        // JSDOM does not implement canvas APIs required by this rule.
        'color-contrast': { enabled: false },
      },
    });

  afterEach(() => {
    cleanup();
  });

  it('has no axe violations on HomePage', async () => {
    const { container: homeContainer } = render(<HomePage />);
    const homeResults = await runAxe(homeContainer);
    expect(homeResults.violations).toHaveLength(0);
  });

  it('has no axe violations on LoginPage', async () => {
    const { container: loginContainer } = render(<LoginPage />);
    const loginResults = await runAxe(loginContainer);
    expect(loginResults.violations).toHaveLength(0);
  });

  it('has no axe violations on CandidatesPage', async () => {
    const { container: candidatesContainer } = render(<CandidatesPage />);
    const candidatesResults = await runAxe(candidatesContainer);
    expect(candidatesResults.violations).toHaveLength(0);
  });

  it('ensures labels, aria usage, keyboard navigation and image alt text safety', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    const emailInput = screen.getByLabelText('Adresse email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    await user.tab();
    expect(emailInput).toHaveFocus();
    await user.tab();
    expect(passwordInput).toHaveFocus();

    render(<CandidatesPage />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');

    const images = screen.queryAllByRole('img');
    images.forEach((image) => {
      expect(image).toHaveAttribute('alt');
    });
  });
});
