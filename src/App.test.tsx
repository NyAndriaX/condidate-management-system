import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: ({ element }: { element: React.ReactNode }) => <>{element}</>,
    Navigate: () => null,
    Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useNavigate: () => jest.fn(),
    useParams: () => ({}),
  }),
  { virtual: true },
);

test('renders app without crashing', () => {
  render(<App />);
  expect(screen.getByText(/Candidate Management System/i)).toBeInTheDocument();
});
