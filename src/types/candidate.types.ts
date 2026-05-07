export type CandidateStatus = 'pending' | 'validated' | 'rejected';

export interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  resume?: string;
  status: CandidateStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type CreateCandidateDTO = Omit<
  Candidate,
  '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeleted' | 'status'
> & {
  status?: CandidateStatus;
  deletedAt?: string | null;
  isDeleted?: boolean;
};

export type UpdateCandidateDTO = Partial<CreateCandidateDTO>;
