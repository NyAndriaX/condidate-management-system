import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CandidateDetail from './CandidateDetail';
import { candidateService } from '../../services';
import { Candidate } from '../../types/candidate.types';

jest.mock('../../services', () => ({
  candidateService: {
    getCandidate: jest.fn(),
    validateCandidate: jest.fn(),
    deleteCandidate: jest.fn(),
  },
}));

const mockedCandidateService = candidateService as jest.Mocked<typeof candidateService>;

const createCandidate = (status: Candidate['status'] = 'pending'): Candidate => ({
  _id: 'candidate-1',
  firstName: 'Alice',
  lastName: 'Martin',
  email: 'alice@example.com',
  phone: '+33612345678',
  position: 'Frontend Developer',
  experience: 5,
  skills: ['React', 'TypeScript'],
  resume: 'https://example.com/resume.pdf',
  status,
  isDeleted: false,
  createdAt: '2026-05-07T10:00:00.000Z',
  updatedAt: '2026-05-07T10:00:00.000Z',
  deletedAt: null,
});

describe('CandidateDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays candidate details', async () => {
    mockedCandidateService.getCandidate.mockResolvedValue(createCandidate());

    render(<CandidateDetail candidateId="candidate-1" />);

    expect(await screen.findByText('Candidate Details')).toBeInTheDocument();
    expect(screen.getByText(/Alice Martin/)).toBeInTheDocument();
    expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/React, TypeScript/)).toBeInTheDocument();
  });

  it('handles asynchronous validation', async () => {
    mockedCandidateService.getCandidate.mockResolvedValue(createCandidate('pending'));
    let resolveValidation: ((value: Candidate) => void) | undefined;
    mockedCandidateService.validateCandidate.mockReturnValue(
      new Promise<Candidate>((resolve) => {
        resolveValidation = resolve;
      }),
    );

    render(<CandidateDetail candidateId="candidate-1" />);
    await screen.findByText('Candidate Details');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Valider le candidat' }));

    expect(screen.getByRole('button', { name: 'Validation en cours...' })).toBeDisabled();
    resolveValidation?.(createCandidate('validated'));

    await waitFor(() => {
      expect(mockedCandidateService.validateCandidate).toHaveBeenCalledWith('candidate-1');
    });
    expect(await screen.findByText('Candidat valide avec succes.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Valider le candidat' })).not.toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    let resolvePromise: ((value: Candidate) => void) | undefined;
    mockedCandidateService.getCandidate.mockReturnValue(
      new Promise<Candidate>((resolve) => {
        resolvePromise = resolve;
      }),
    );

    render(<CandidateDetail candidateId="candidate-1" />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading candidate...');

    resolvePromise?.(createCandidate());

    expect(await screen.findByText('Candidate Details')).toBeInTheDocument();
  });

  it('handles action buttons', async () => {
    mockedCandidateService.getCandidate.mockResolvedValue(createCandidate());
    mockedCandidateService.deleteCandidate.mockResolvedValue();
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const assignSpy = jest.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign: assignSpy },
    });

    render(<CandidateDetail candidateId="candidate-1" />);
    await screen.findByText('Candidate Details');

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(assignSpy).toHaveBeenCalledWith('/candidates/candidate-1/edit');

    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await waitFor(() => {
      expect(mockedCandidateService.deleteCandidate).toHaveBeenCalledWith('candidate-1');
    });
    expect(assignSpy).toHaveBeenCalledWith('/candidates');

    await user.click(screen.getByRole('button', { name: 'Retour a la liste' }));
    expect(assignSpy).toHaveBeenCalledWith('/candidates');

    confirmSpy.mockRestore();
  });
});
