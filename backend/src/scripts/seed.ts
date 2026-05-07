import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../config/database';
import { logger } from '../config/logger';
import { CandidateModel } from '../models/Candidate.model';
import { UserModel } from '../models/User.model';

const seedUsers = async (): Promise<void> => {
  const users = [
    {
      email: 'admin@cms.local',
      password: 'Admin1234!',
      name: 'Admin CMS',
      role: 'admin' as const,
    },
    {
      email: 'recruiter@cms.local',
      password: 'Recruiter1234!',
      name: 'Recruiter CMS',
      role: 'user' as const,
    },
  ];

  for (const user of users) {
    const existing = await UserModel.findOne({ email: user.email }).exec();

    if (!existing) {
      await UserModel.create(user);
      logger.info(`Seed user created: ${user.email}`);
      continue;
    }

    existing.name = user.name;
    existing.role = user.role;
    existing.password = user.password;
    await existing.save();
    logger.info(`Seed user updated: ${user.email}`);
  }
};

const seedCandidates = async (): Promise<void> => {
  const candidates = [
    {
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice.martin@demo.local',
      phone: '+33612000001',
      position: 'Frontend Developer',
      experience: 3,
      skills: ['React', 'TypeScript', 'CSS'],
      resume: 'https://example.com/resume/alice-martin.pdf',
      status: 'pending' as const,
    },
    {
      firstName: 'Karim',
      lastName: 'Benali',
      email: 'karim.benali@demo.local',
      phone: '+33612000002',
      position: 'Backend Developer',
      experience: 5,
      skills: ['Node.js', 'Express', 'MongoDB'],
      resume: 'https://example.com/resume/karim-benali.pdf',
      status: 'validated' as const,
    },
    {
      firstName: 'Sophie',
      lastName: 'Dupont',
      email: 'sophie.dupont@demo.local',
      phone: '+33612000003',
      position: 'QA Engineer',
      experience: 4,
      skills: ['Cypress', 'Playwright', 'Jest'],
      resume: 'https://example.com/resume/sophie-dupont.pdf',
      status: 'pending' as const,
    },
    {
      firstName: 'Youssef',
      lastName: 'El Idrissi',
      email: 'youssef.elidrissi@demo.local',
      phone: '+33612000004',
      position: 'DevOps Engineer',
      experience: 6,
      skills: ['Docker', 'Kubernetes', 'CI/CD'],
      resume: 'https://example.com/resume/youssef-elidrissi.pdf',
      status: 'rejected' as const,
    },
    {
      firstName: 'Nina',
      lastName: 'Bernard',
      email: 'nina.bernard@demo.local',
      phone: '+33612000005',
      position: 'Product Manager',
      experience: 7,
      skills: ['Product Strategy', 'Agile', 'Analytics'],
      resume: 'https://example.com/resume/nina-bernard.pdf',
      status: 'validated' as const,
    },
  ];

  for (const candidate of candidates) {
    const existing = await CandidateModel.findOne({ email: candidate.email }).exec();

    if (!existing) {
      await CandidateModel.create(candidate);
      logger.info(`Seed candidate created: ${candidate.email}`);
      continue;
    }

    existing.firstName = candidate.firstName;
    existing.lastName = candidate.lastName;
    existing.phone = candidate.phone;
    existing.position = candidate.position;
    existing.experience = candidate.experience;
    existing.skills = candidate.skills;
    existing.resume = candidate.resume;
    existing.status = candidate.status;
    existing.isDeleted = false;
    existing.deletedAt = null;
    await existing.save();
    logger.info(`Seed candidate updated: ${candidate.email}`);
  }
};

const run = async (): Promise<void> => {
  try {
    await connectDB();
    await seedUsers();
    await seedCandidates();
    logger.info('Database seeding completed.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Database seeding failed: ${message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

void run();
