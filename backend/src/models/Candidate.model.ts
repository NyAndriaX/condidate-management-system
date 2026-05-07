import {
  HydratedDocument,
  Model,
  Schema,
  Types,
  model,
  models,
} from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface CandidateSchemaFields {
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
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CandidateMethods {
  softDelete(): Promise<void>;
}

interface CandidateModel extends Model<CandidateSchemaFields, {}, CandidateMethods> {
  findActive(): Promise<Array<CandidateDocument>>;
}

export type CandidateDocument = HydratedDocument<CandidateSchemaFields, CandidateMethods> & {
  _id: Types.ObjectId;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const internationalPhoneRegex = /^\+[1-9]\d{1,14}$/;

const candidateSchema = new Schema<CandidateSchemaFields, CandidateModel, CandidateMethods>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Invalid email format',
      },
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string): boolean => internationalPhoneRegex.test(value),
        message: 'Phone must be in international format (E.164)',
      },
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]): boolean => value.length >= 1,
        message: 'At least one skill is required',
      },
    },
    resume: {
      type: String,
      required: false,
      validate: {
        validator: (value: string | undefined): boolean =>
          value === undefined || /^https?:\/\/\S+$/i.test(value),
        message: 'Resume must be a valid URL',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'validated', 'rejected'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc: unknown, ret: Record<string, unknown>): Record<string, unknown> => {
        delete ret.__v;
        if (ret._id !== undefined) {
          ret._id = String(ret._id);
        }
        return ret;
      },
    },
  },
);

candidateSchema.index({ email: 1 }, { unique: true });
candidateSchema.index({ status: 1 });
candidateSchema.index({ isDeleted: 1 });

candidateSchema.method('softDelete', async function softDelete(this: CandidateDocument): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
});

candidateSchema.static(
  'findActive',
  function findActive(
    this: Model<CandidateSchemaFields, {}, CandidateMethods>,
  ): Promise<Array<CandidateDocument>> {
  return this.find({ isDeleted: false }).exec() as Promise<Array<CandidateDocument>>;
  },
);

export const CandidateModel =
  (models.Candidate as CandidateModel | undefined) ||
  model<CandidateSchemaFields, CandidateModel>('Candidate', candidateSchema);
