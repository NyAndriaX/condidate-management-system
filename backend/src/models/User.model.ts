import bcrypt from 'bcryptjs';
import { HydratedDocument, Model, Schema, Types, model, models } from 'mongoose';

export type UserRole = 'admin' | 'user';

export interface User {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSchemaFields {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

interface UserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface UserModel extends Model<UserSchemaFields, {}, UserMethods> {}

export type UserDocument = HydratedDocument<UserSchemaFields, UserMethods> & {
  _id: Types.ObjectId;
};

const userSchema = new Schema<UserSchemaFields, UserModel, UserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        delete ret.__v;
        if (ret._id !== undefined) {
          ret._id = String(ret._id);
        }
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.method(
  'comparePassword',
  async function comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  },
);

export const UserModel =
  (models.User as UserModel | undefined) || model<UserSchemaFields, UserModel>('User', userSchema);
