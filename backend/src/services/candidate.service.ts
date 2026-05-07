import {
  Candidate as ICandidate,
  CandidateDocument,
  CandidateModel,
  CandidateStatus,
} from '../models/Candidate.model';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

export type CreateCandidateDTO = Omit<
  ICandidate,
  '_id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeleted' | 'status'
> & {
  status?: CandidateStatus;
  deletedAt?: Date | null;
  isDeleted?: boolean;
};

export type UpdateCandidateDTO = Partial<CreateCandidateDTO>;

interface FindAllFilters {
  page?: number;
  limit?: number;
  status?: string;
}

interface FindAllResult {
  candidates: ICandidate[];
  total: number;
  pages: number;
}

export class CandidateService {
  public async create(data: CreateCandidateDTO): Promise<ICandidate> {
    const existingCandidate = await CandidateModel.findOne({ email: data.email }).lean().exec();
    if (existingCandidate) {
      throw new AppError('Un candidat avec cet email existe deja.', 409);
    }

    const candidate = await CandidateModel.create(data);
    logger.info(`Candidat cree: ${candidate.email}`);
    return candidate.toJSON() as ICandidate;
  }

  public async findById(id: string): Promise<ICandidate | null> {
    const candidate = await CandidateModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!candidate) {
      throw new AppError('Candidat non trouve.', 404);
    }

    return candidate.toJSON() as ICandidate;
  }

  public async update(id: string, data: UpdateCandidateDTO): Promise<ICandidate> {
    const updatedCandidate = await CandidateModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      data,
      {
        new: true,
        runValidators: true,
      },
    ).exec();

    if (!updatedCandidate) {
      throw new AppError('Candidat non trouve.', 404);
    }

    return updatedCandidate.toJSON() as ICandidate;
  }

  public async softDelete(id: string): Promise<void> {
    const candidate = await CandidateModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!candidate) {
      throw new AppError('Candidat non trouve.', 404);
    }

    await candidate.softDelete();
    logger.info(`Candidat supprime (soft delete): ${candidate.email}`);
  }

  public async validate(id: string): Promise<ICandidate> {
    const candidate = await CandidateModel.findOne({ _id: id, isDeleted: false }).exec();
    if (!candidate) {
      throw new AppError('Candidat non trouve.', 404);
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2000);
    });

    candidate.status = 'validated';
    await candidate.save();
    logger.info(`Candidat valide: ${candidate.email}`);

    return candidate.toJSON() as ICandidate;
  }

  public async findAll(filters: FindAllFilters): Promise<FindAllResult> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, filters.limit ?? 10);
    const skip = (page - 1) * limit;

    const query: {
      isDeleted: boolean;
      status?: CandidateStatus;
    } = { isDeleted: false };

    if (filters.status && ['pending', 'validated', 'rejected'].includes(filters.status)) {
      query.status = filters.status as CandidateStatus;
    }

    const [documents, total] = await Promise.all([
      CandidateModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      CandidateModel.countDocuments(query).exec(),
    ]);

    return {
      candidates: documents.map((document: CandidateDocument) => document.toJSON() as ICandidate),
      total,
      pages: Math.ceil(total / limit),
    };
  }
}

export const candidateService = new CandidateService();
