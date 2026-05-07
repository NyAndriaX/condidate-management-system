import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useCandidates } from './useCandidates';
import { candidateService } from '../services';
import { Candidate } from '../types/candidate.types';

jest.mock('../services', () => ({
  candidateService: {
    getCandidates: jest.fn(),
    createCandidate: jest.fn(),
    updateCandidate: jest.fn(),
    deleteCandidate: jest.fn(),
  },
}));

const mockedCandidateService = candidateService as jest.Mocked<typeof candidateService>;

const candidate: Candidate = {
  _id: '1',
  firstName: 'Alice',
  lastName: 'Martin',
  email: 'alice@example.com',
  phone: '+33612345678',
  position: 'Frontend Developer',
  experience: 5,
  skills: ['React'],
  status: 'pending',
  isDeleted: false,
  createdAt: '2026-05-07T10:00:00.000Z',
  updatedAt: '2026-05-07T10:00:00.000Z',
  deletedAt: null,
};

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

describe('useCandidates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches candidates with useQuery', async () => {
    mockedCandidateService.getCandidates.mockResolvedValue({
      candidates: [candidate],
      total: 1,
      pages: 1,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useCandidates({ page: 1, limit: 10 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedCandidateService.getCandidates).toHaveBeenCalledWith(1, 10, undefined);
    expect(result.current.data?.candidates).toHaveLength(1);
  });

  it('invalidates cache after create/update/delete mutations', async () => {
    mockedCandidateService.getCandidates.mockResolvedValue({
      candidates: [candidate],
      total: 1,
      pages: 1,
    });
    mockedCandidateService.createCandidate.mockResolvedValue(candidate);
    mockedCandidateService.updateCandidate.mockResolvedValue(candidate);
    mockedCandidateService.deleteCandidate.mockResolvedValue();

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCandidates({ page: 1, limit: 10 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    await result.current.createCandidate({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@example.com',
      phone: '+33612345678',
      position: 'Frontend Developer',
      experience: 5,
      skills: ['React'],
    });
    await result.current.updateCandidate({
      id: '1',
      data: { position: 'Senior Frontend Developer' },
    });
    await result.current.deleteCandidate('1');

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalled();
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['candidates'] });
  });
});
