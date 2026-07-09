import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { AppError } from '../../shared/errors';
import { User } from '../users/user.model';
import { RegisterInput, LoginInput } from './auth.validation';

const SALT_ROUNDS = 12;

export class AuthService {
  async register(input: RegisterInput) {
    const existingEmail = await User.findOne({ where: { email: input.email } });
    if (existingEmail) {
      throw new AppError('Email already registered', 409);
    }

    const existingUsername = await User.findOne({ where: { username: input.username } });
    if (existingUsername) {
      throw new AppError('Username already taken', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await User.create({
      username: input.username,
      email: input.email,
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
    };
  }

  async login(input: LoginInput) {
    const user = await User.findOne({ where: { email: input.email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user);

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
    };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn } as jwt.SignOptions,
    );
  }
}

export const authService = new AuthService();
