import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

export interface JwtAccessToken {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  
  async signup(dto: AuthDto): Promise<JwtAccessToken> {
    const hash = await this.generatePassword(dto.password);
    const user = await this.saveUserInDb(dto.email, hash);
    return await this.signToken(user.id, user.email);
  }

  async generatePassword(password: string): Promise<string> {
    return await argon.hash(password);
  }

  async saveUserInDb(email: string, hash: string): Promise<User> {
    let user: User;
    try {
      user = await this.prisma.user.create({
      data: {
        email,
        hash
      },
    });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
    }
    throw error;
  }

    return user;
  }

  async signin(dto: AuthDto): Promise<JwtAccessToken> {
    const user = await this.findUserByEmail(dto.email);
    await this.comparePassword(user.hash, dto.password);
    return await this.signToken(user.id, user.email);
  }

  async findUserByEmail(email: string): Promise<User> {
    let user: User;
    user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new ForbiddenException('Credentials Email Incorrect');
    }

    return user;
  }

  async comparePassword(hash: string, password: string) {
    const isCorrectPassword = await argon.verify(hash, password);

    if (!isCorrectPassword) {
      throw new ForbiddenException('Credentials Password Incorrect');
    }
  }

  async signToken(userId: number, email: string): Promise<JwtAccessToken> {
    const payload = {
      sub: userId,
      email,
    }

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: this.config.get('JWT_SECRET'),
    });

    return {
      access_token: token,
    };
  }
}