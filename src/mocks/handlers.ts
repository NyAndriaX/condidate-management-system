import { rest } from 'msw';

type CandidateStatus = 'pending' | 'validated' | 'rejected';

interface CandidateMock {
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

const BASE_URL = 'http://localhost:5000/api';

const initialCandidates: CandidateMock[] = [
  {
    _id: '1',
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice@example.com',
    phone: '+33612345678',
    position: 'Frontend Developer',
    experience: 4,
    skills: ['React', 'TypeScript'],
    status: 'pending',
    isDeleted: false,
    createdAt: '2026-05-07T10:00:00.000Z',
    updatedAt: '2026-05-07T10:00:00.000Z',
    deletedAt: null,
  },
  {
    _id: '2',
    firstName: 'Bruno',
    lastName: 'Dupont',
    email: 'bruno@example.com',
    phone: '+33655555555',
    position: 'Backend Developer',
    experience: 7,
    skills: ['Node.js', 'MongoDB'],
    status: 'validated',
    isDeleted: false,
    createdAt: '2026-05-06T10:00:00.000Z',
    updatedAt: '2026-05-06T10:00:00.000Z',
    deletedAt: null,
  },
];

let candidates = [...initialCandidates];

const paginateCandidates = (items: CandidateMock[], page: number, limit: number): CandidateMock[] => {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};

const handlers = [
  rest.post(`${BASE_URL}/auth/login`, async (_req, res, ctx) =>
    res(
      ctx.delay(100),
      ctx.json({
      success: true,
      token: 'mock-token',
      user: {
        _id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: '2026-05-07T10:00:00.000Z',
        updatedAt: '2026-05-07T10:00:00.000Z',
      },
      }),
    )),

  rest.get(`${BASE_URL}/candidates`, async (req, res, ctx) => {
    const url = new URL(req.url.toString());
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '10');
    const status = url.searchParams.get('status') as CandidateStatus | null;

    const filtered = status
      ? candidates.filter((candidate) => candidate.status === status && !candidate.isDeleted)
      : candidates.filter((candidate) => !candidate.isDeleted);

    const paginated = paginateCandidates(filtered, page, limit);

    return res(
      ctx.delay(120),
      ctx.json({
        success: true,
        data: paginated,
        pagination: {
          total: filtered.length,
          pages: Math.max(1, Math.ceil(filtered.length / limit)),
        },
      }),
    );
  }),

  rest.get(`${BASE_URL}/candidates/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const candidate = candidates.find((item) => item._id === id && !item.isDeleted);
    if (!candidate) {
      return res(ctx.status(404), ctx.json({ message: 'Candidat non trouve.' }));
    }

    return res(ctx.json({ success: true, data: candidate }));
  }),

  rest.post(`${BASE_URL}/candidates`, async (req, res, ctx) => {
    const payload = (await req.json()) as Partial<CandidateMock>;
    const created: CandidateMock = {
      _id: String(candidates.length + 1),
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? '',
      email: payload.email ?? '',
      phone: payload.phone ?? '',
      position: payload.position ?? '',
      experience: payload.experience ?? 0,
      skills: payload.skills ?? [],
      resume: payload.resume,
      status: payload.status ?? 'pending',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    candidates = [created, ...candidates];
    return res(ctx.status(201), ctx.json({ success: true, data: created }));
  }),

  rest.put(`${BASE_URL}/candidates/:id`, async (req, res, ctx) => {
    const payload = (await req.json()) as Partial<CandidateMock>;
    const { id } = req.params;
    const index = candidates.findIndex((item) => item._id === id && !item.isDeleted);
    if (index === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Candidat non trouve.' }));
    }

    candidates[index] = {
      ...candidates[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return res(ctx.json({ success: true, data: candidates[index] }));
  }),

  rest.delete(`${BASE_URL}/candidates/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const index = candidates.findIndex((item) => item._id === id && !item.isDeleted);
    if (index === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Candidat non trouve.' }));
    }

    candidates[index] = {
      ...candidates[index],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
    };

    return res(ctx.json({ success: true, message: 'Candidat supprime' }));
  }),

  rest.post(`${BASE_URL}/candidates/:id/validate`, async (req, res, ctx) => {
    const { id } = req.params;
    const index = candidates.findIndex((item) => item._id === id && !item.isDeleted);
    if (index === -1) {
      return res(ctx.status(404), ctx.json({ message: 'Candidat non trouve.' }));
    }

    candidates[index] = {
      ...candidates[index],
      status: 'validated',
      updatedAt: new Date().toISOString(),
    };

    return res(ctx.delay(2000), ctx.json({ success: true, data: candidates[index] }));
  }),
];

const resetMockCandidates = (): void => {
  candidates = [...initialCandidates];
};

export { BASE_URL, handlers, resetMockCandidates };
