import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET'),
        });
    }

    async validate(payload: { uuid: string; role?: string }) {
        if (!payload.uuid) {
            throw new Error('Invalid token');
        }

        const user = await this.prisma.user.findUnique({
            where: { uuid: payload.uuid },
            select: { uuid: true, role: true },
        });

        if (!user) {
            throw new Error('Invalid token');
        }

        return {
            uuid: user.uuid,
            role: user.role,
        };
    }
}