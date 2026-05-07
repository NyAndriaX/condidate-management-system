import { api } from './api';
import { Candidate, CandidateStatus, CreateCandidateDTO, UpdateCandidateDTO } from '../types/candidate.types';

interface CandidatesResponse {
  success: boolean;
  data: Candidate[];
  pagination: {
    total: number;
    pages: number;
  };
}

interface CandidateResponse {
  success: boolean;
  data: Candidate;
}

interface DeleteCandidateResponse {
  success: boolean;
  message: string;
}

export const candidateService = {
  async getCandidates(
    page = 1,
    limit = 10,
    status?: CandidateStatus,
  ): Promise<{ candidates: Candidate[]; total: number; pages: number }> {
    const response = await api.get<CandidatesResponse>('/candidates', {
      params: { page, limit, status },
    });

    return {
      candidates: response.data.data,
      total: response.data.pagination.total,
      pages: response.data.pagination.pages,
    };
  },

  async getCandidate(id: string): Promise<Candidate> {
    const response = await api.get<CandidateResponse>(`/candidates/${id}`);
    return response.data.data;
  },

  async createCandidate(data: CreateCandidateDTO): Promise<Candidate> {
    const response = await api.post<CandidateResponse>('/candidates', data);
    return response.data.data;
  },

  async updateCandidate(id: string, data: UpdateCandidateDTO): Promise<Candidate> {
    const response = await api.put<CandidateResponse>(`/candidates/${id}`, data);
    return response.data.data;
  },

  async deleteCandidate(id: string): Promise<void> {
    await api.delete<DeleteCandidateResponse>(`/candidates/${id}`);
  },

  async validateCandidate(id: string): Promise<Candidate> {
    const response = await api.post<CandidateResponse>(`/candidates/${id}/validate`);
    return response.data.data;
  },
};
