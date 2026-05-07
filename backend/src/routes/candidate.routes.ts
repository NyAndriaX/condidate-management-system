import { Router } from 'express';

import {
  createCandidate,
  deleteCandidate,
  getCandidate,
  getCandidates,
  updateCandidate,
  validateCandidate,
} from '../controllers/candidate.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCandidateSchema, updateCandidateSchema } from '../validators/candidate.validator';

const candidateRouter = Router();

candidateRouter.use(authenticate);

candidateRouter.post('/', validate(createCandidateSchema), createCandidate);
candidateRouter.get('/', getCandidates);
candidateRouter.get('/:id', getCandidate);
candidateRouter.put('/:id', validate(updateCandidateSchema), updateCandidate);
candidateRouter.delete('/:id', deleteCandidate);
candidateRouter.post('/:id/validate', validateCandidate);

export { candidateRouter };
