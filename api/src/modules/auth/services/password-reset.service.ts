import {
    BadRequestException,
    Injectable,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { ResendMailService } from '@/integrations/notifications/resend/services/mail.service';
import { TemplateService } from '@/integrations/notifications/sendgrid/utils/templates.utils';
import { EmailTemplates } from '@/integrations/notifications/sendgrid/interfaces/mail.interfaces';
import { EmailConfig } from '@/shared/config/email';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;
const PASSWORD_RESET_SUBJECT = 'Reset your Selinutes password';

@Injectable()
export class PasswordResetService {
    private readonly logger = new Logger(PasswordResetService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly resendMailService: ResendMailService,
        private readonly templateService: TemplateService,
        private readonly configService: ConfigService,
    ) {}

    async requestPasswordReset(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: {
                    equals: dto.email.trim(),
                    mode: 'insensitive',
                },
            },
        });

        if (user) {
            await this.createAndSendResetToken(user.uuid, user.email, user.username);
        }

        return {
            message: 'If an account exists for that email, a password reset link has been sent.',
        };
    }

    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const tokenHash = this.hashToken(dto.token);

        const resetToken = await this.prisma.passwordResetToken.findFirst({
            where: {
                token_hash: tokenHash,
                used_at: null,
                expires_at: { gt: new Date() },
            },
            include: { user: true },
        });

        if (!resetToken) {
            throw new BadRequestException('Invalid or expired reset link. Please request a new one.');
        }

        const hashedPassword = await bcrypt.hash(dto.new_password, 10);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { uuid: resetToken.user_uuid },
                data: { password: hashedPassword },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used_at: new Date() },
            }),
            this.prisma.passwordResetToken.updateMany({
                where: {
                    user_uuid: resetToken.user_uuid,
                    used_at: null,
                    id: { not: resetToken.id },
                },
                data: { used_at: new Date() },
            }),
        ]);

        return { message: 'Password reset successfully. You can now sign in with your new password.' };
    }

    private async createAndSendResetToken(
        userUuid: string,
        email: string,
        username: string,
    ): Promise<void> {
        const rawToken = randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(rawToken);
        const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

        await this.prisma.passwordResetToken.updateMany({
            where: { user_uuid: userUuid, used_at: null },
            data: { used_at: new Date() },
        });

        await this.prisma.passwordResetToken.create({
            data: {
                user_uuid: userUuid,
                token_hash: tokenHash,
                expires_at: expiresAt,
            },
        });

        const appUrl = this.configService.get<string>('APP_URL');
        if (!appUrl) {
            this.logger.error('APP_URL is not configured; cannot send password reset email');
            return;
        }

        const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
        const expiresInMinutes = PASSWORD_RESET_EXPIRY_MS / (60 * 1000);

        const html = await this.templateService.renderTemplate(EmailTemplates.PASSWORD_RESET, {
            username,
            resetUrl,
            expiresInMinutes,
            appName: 'Selinutes',
            year: new Date().getFullYear(),
        });

        try {
            await this.resendMailService.sendEmail({
                to: email,
                from: EmailConfig.email_addresses.password_reset,
                subject: PASSWORD_RESET_SUBJECT,
                html,
                text: `Reset your Selinutes password: ${resetUrl}\n\nThis link expires in ${expiresInMinutes} minutes.`,
            });
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${email}`, error);
        }
    }

    private hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
