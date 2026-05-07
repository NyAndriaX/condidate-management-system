import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import CandidateList from './CandidateList';
import { BASE_URL } from '../../mocks/handlers';
import { server } from '../../mocks/server';

describe('CandidateList', () => {
  it('displays candidate list', async () => {
    render(<CandidateList />);

    expect(await screen.findByText('Alice Martin')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('handles pagination with Previous/Next', async () => {
    server.use(
      rest.get(`${BASE_URL}/candidates`, (req, res, ctx) => {
        const url = new URL(req.url.toString());
        const page = Number(url.searchParams.get('page') ?? '1');

        if (page === 1) {
          return res(
            ctx.json({
              success: true,
              data: [
              {
                _id: '1',
                firstName: 'Alice',
                lastName: 'Martin',
                email: 'alice@example.com',
                phone: '+33612345678',
                position: 'Frontend Developer',
                experience: 4,
                skills: ['React'],
                status: 'pending',
                isDeleted: false,
                createdAt: '2026-05-07T10:00:00.000Z',
                updatedAt: '2026-05-07T10:00:00.000Z',
                deletedAt: null,
              },
              ],
              pagination: { total: 2, pages: 2 },
            }),
          );
        }

        return res(
          ctx.json({
            success: true,
            data: [
            {
              _id: '2',
              firstName: 'Bob',
              lastName: 'Durand',
              email: 'bob@example.com',
              phone: '+33600000000',
              position: 'Backend Developer',
              experience: 5,
              skills: ['Node'],
              status: 'validated',
              isDeleted: false,
              createdAt: '2026-05-07T10:00:00.000Z',
              updatedAt: '2026-05-07T10:00:00.000Z',
              deletedAt: null,
            },
            ],
            pagination: { total: 2, pages: 2 },
          }),
        );
      }),
    );

    render(<CandidateList />);

    await screen.findByText('Alice Martin');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Bob Durand');
  });

  it('applies status and search filters', async () => {
    render(<CandidateList />);

    await screen.findByText('Alice Martin');
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'validated');
    await screen.findByText('Bruno Dupont');

    const searchInput = screen.getByLabelText('Search by name');
    await user.type(searchInput, 'zzz');

    await waitFor(() => {
      expect(screen.queryByText('Bruno Dupont')).not.toBeInTheDocument();
    });
    expect(screen.getByText('No candidates found.')).toBeInTheDocument();
  });

  it('shows loading state while fetching', async () => {
    server.use(
      rest.get(`${BASE_URL}/candidates`, (_req, res, ctx) =>
        res(ctx.delay(400), ctx.json({
          success: true,
          data: [],
          pagination: { total: 0, pages: 1 },
        }))),
    );

    render(<CandidateList />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading candidates...');
  });

  it('shows error message when request fails', async () => {
    server.use(
      rest.get(`${BASE_URL}/candidates`, (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ message: 'Backend unavailable' }))),
    );

    render(<CandidateList />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Backend unavailable');
  });
});
