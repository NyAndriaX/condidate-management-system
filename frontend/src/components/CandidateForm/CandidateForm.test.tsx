import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CandidateForm from './CandidateForm';
import { candidateService } from '../../services';
import { Candidate } from '../../types/candidate.types';

jest.mock('../../services', () => ({
  candidateService: {
    createCandidate: jest.fn(),
    updateCandidate: jest.fn(),
  },
}));

const mockedCandidateService = candidateService as jest.Mocked<typeof candidateService>;

const buildCandidate = (): Candidate => ({
  _id: 'candidate-1',
  firstName: 'Alice',
  lastName: 'Martin',
  email: 'alice@example.com',
  phone: '+33612345678',
  position: 'Frontend Developer',
  experience: 4,
  skills: ['React', 'TypeScript'],
  resume: 'https://example.com/resume.pdf',
  status: 'pending',
  isDeleted: false,
  createdAt: '2026-05-07T10:00:00.000Z',
  updatedAt: '2026-05-07T10:00:00.000Z',
  deletedAt: null,
});

describe('CandidateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows field validation errors', async () => {
    render(<CandidateForm onSuccess={jest.fn()} onCancel={jest.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByText('Le prenom est requis.')).toBeInTheDocument();
    expect(screen.getByText('Le nom est requis.')).toBeInTheDocument();
    expect(screen.getByText("L'email est requis.")).toBeInTheDocument();
    expect(screen.getByText('Le numero de telephone est requis.')).toBeInTheDocument();
    expect(screen.getByText('Le poste est requis.')).toBeInTheDocument();
    expect(screen.getByText('Au moins une competence est requise.')).toBeInTheDocument();
  });

  it('submits successfully in create mode', async () => {
    mockedCandidateService.createCandidate.mockResolvedValue(buildCandidate());
    const onSuccess = jest.fn();

    render(<CandidateForm onSuccess={onSuccess} onCancel={jest.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('First name'), 'Alice');
    await user.type(screen.getByLabelText('Last name'), 'Martin');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Phone'), '+33612345678');
    await user.type(screen.getByLabelText('Position'), 'Frontend Developer');
    await user.clear(screen.getByLabelText('Experience'));
    await user.type(screen.getByLabelText('Experience'), '4');
    await user.type(screen.getByPlaceholderText('Add a skill'), 'React');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    await user.type(screen.getByLabelText('Resume URL'), 'https://example.com/resume.pdf');

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(mockedCandidateService.createCandidate).toHaveBeenCalledTimes(1);
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows API errors during submission', async () => {
    mockedCandidateService.createCandidate.mockRejectedValue(new Error('Creation failed'));

    render(<CandidateForm onSuccess={jest.fn()} onCancel={jest.fn()} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('First name'), 'Alice');
    await user.type(screen.getByLabelText('Last name'), 'Martin');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Phone'), '+33612345678');
    await user.type(screen.getByLabelText('Position'), 'Frontend Developer');
    await user.clear(screen.getByLabelText('Experience'));
    await user.type(screen.getByLabelText('Experience'), '4');
    await user.type(screen.getByPlaceholderText('Add a skill'), 'React');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Creation failed');
  });

  it('uses edit mode when candidate is provided', async () => {
    const existingCandidate = buildCandidate();
    mockedCandidateService.updateCandidate.mockResolvedValue(existingCandidate);
    const onSuccess = jest.fn();

    render(<CandidateForm candidate={existingCandidate} onSuccess={onSuccess} onCancel={jest.fn()} />);
    const user = userEvent.setup();

    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Martin')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(mockedCandidateService.updateCandidate).toHaveBeenCalledWith(existingCandidate._id, expect.any(Object));
    });
    expect(mockedCandidateService.createCandidate).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
