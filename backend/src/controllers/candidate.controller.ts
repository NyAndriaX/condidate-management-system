import { Request, Response } from 'express';

import { candidateService } from '../services/candidate.service';
import { asyncHandler } from '../utils/asyncHandler';

export const createCandidate = asyncHandler(async (req: Request, res: Response) => {
  const candidate = await candidateService.create(req.body);

  res.status(201).json({
    success: true,
    data: candidate,
  });
});

export const getCandidate = asyncHandler(async (req: Request, res: Response) => {
  const candidate = await candidateService.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: candidate,
  });
});

export const updateCandidate = asyncHandler(async (req: Request, res: Response) => {
  const candidate = await candidateService.update(req.params.id, req.body);

  res.status(200).json({
    success: true,
    data: candidate,
  });
});

export const deleteCandidate = asyncHandler(async (req: Request, res: Response) => {
  await candidateService.softDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Candidat supprime',
  });
});

export const validateCandidate = asyncHandler(async (req: Request, res: Response) => {
  const candidate = await candidateService.validate(req.params.id);

  res.status(200).json({
    success: true,
    data: candidate,
  });
});

export const getCandidates = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const result = await candidateService.findAll({ page, limit, status });

  res.status(200).json({
    success: true,
    data: result.candidates,
    pagination: {
      total: result.total,
      pages: result.pages,
    },
  });
});
