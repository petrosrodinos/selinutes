import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { RegisterEmailDto } from '../dto/register-email.dto';
import { LoginEmailDto } from '../dto/login-email.dto';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateJwtService } from '@/shared/utils/jwt/jwt.service';
import { AuthRoles } from '../interfaces/auth.interface';
import { UpdateUsernameDto } from '../dto/update-username.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

@Injectable()
export class EmailAuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: CreateJwtService,
    ) { }

    async registerWithEmail(dto: RegisterEmailDto) {

        try {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { email: dto.email },
                        { username: dto.username },
                    ]
                },
            });

            if (existingUser) {
                throw new ConflictException('User with this email or username already exists');
            }

            const hashedPassword = await bcrypt.hash(dto.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    password: hashedPassword,
                    role: AuthRoles.USER,
                    date_of_birth: new Date(dto.date_of_birth),
                    stats: {
                        create: {
                            rank: 0,
                            level: 1,
                            points: 0,
                            wins: 0,
                            losses: 0,
                            draws: 0,
                        },
                    }
                },
                include: {
                    stats: true,
                },
            });

            const token = await this.jwtService.signToken({
                uuid: user.uuid,
                role: user.role,
            });

            const expires_in = this.jwtService.getExpirationTime(token);

            delete user.password;

            return { access_token: token, expires_in: expires_in, user: user };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async loginWithEmail(dto: LoginEmailDto) {

        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                },
                include: {
                    stats: true,
                },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const password_match = await bcrypt.compare(dto.password, user.password);

            if (!password_match) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const token = await this.jwtService.signToken({
                uuid: user.uuid,
                role: user.role,
            });

            const expires_in = this.jwtService.getExpirationTime(token);

            delete user.password;

            return { access_token: token, expires_in: expires_in, user: user };
        } catch (error) {
            throw new BadRequestException(error.message);
        }

    }

    async refreshToken(uuid: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    uuid: uuid,
                },
                include: {
                    stats: true,
                },
            });


            const token = await this.jwtService.signToken({
                uuid: user.uuid,
                role: user.role,
            });

            const expires_in = this.jwtService.getExpirationTime(token);

            delete user.password;

            return { access_token: token, expires_in: expires_in, user: user };

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateUsername(uuid: string, dto: UpdateUsernameDto) {
        try {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    username: dto.username,
                    NOT: { uuid },
                },
            });

            if (existingUser) {
                throw new ConflictException('Username already in use');
            }

            const user = await this.prisma.user.update({
                where: { uuid },
                data: { username: dto.username },
                include: { stats: true },
            });

            const token = await this.jwtService.signToken({
                uuid: user.uuid,
                role: user.role,
            });

            const expires_in = this.jwtService.getExpirationTime(token);

            delete user.password;

            return { access_token: token, expires_in, user };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updatePassword(uuid: string, dto: UpdatePasswordDto) {
        try {
            if (dto.current_password === dto.new_password) {
                throw new BadRequestException('New password must be different from current password');
            }

            const user = await this.prisma.user.findUnique({
                where: { uuid },
            });

            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const passwordMatch = await bcrypt.compare(dto.current_password, user.password);
            if (!passwordMatch) {
                throw new UnauthorizedException('Current password is incorrect');
            }

            const hashedPassword = await bcrypt.hash(dto.new_password, 10);
            await this.prisma.user.update({
                where: { uuid },
                data: { password: hashedPassword },
            });

            return { message: 'Password updated successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

}
