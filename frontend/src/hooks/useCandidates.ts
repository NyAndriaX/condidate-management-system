import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { candidateService } from '../services';
import { CandidateStatus, CreateCandidateDTO, UpdateCandidateDTO } from '../types/candidate.types';

interface UseCandidatesParams {
  page?: number;
  limit?: number;
  status?: CandidateStatus;
}

const CANDIDATES_QUERY_KEY = 'candidates';

export const useCandidates = ({ page = 1, limit = 10, status }: UseCandidatesParams = {}) => {
  const queryClient = useQueryClient();

  const candidatesQuery = useQuery({
    queryKey: [CANDIDATES_QUERY_KEY, page, limit, status],
    queryFn: () => candidateService.getCandidates(page, limit, status),
  });

  const createCandidateMutation = useMutation({
    mutationFn: (data: CreateCandidateDTO) => candidateService.createCandidate(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [CANDIDATES_QUERY_KEY] });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCandidateDTO }) =>
      candidateService.updateCandidate(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [CANDIDATES_QUERY_KEY] });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: (id: string) => candidateService.deleteCandidate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [CANDIDATES_QUERY_KEY] });
    },
  });

  return {
    ...candidatesQuery,
    createCandidate: createCandidateMutation.mutateAsync,
    updateCandidate: updateCandidateMutation.mutateAsync,
    deleteCandidate: deleteCandidateMutation.mutateAsync,
    createState: createCandidateMutation,
    updateState: updateCandidateMutation,
    deleteState: deleteCandidateMutation,
  };
};

export { CANDIDATES_QUERY_KEY };
