import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PasswordResetService } from '../services/password-reset.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@ApiTags('Password Reset')
@Controller('auth')
export class PasswordResetController {
    constructor(private readonly passwordResetService: PasswordResetService) {}

    @Post('forgot-password')
    @ApiOperation({ summary: 'Request a password reset email' })
    @ApiBody({ type: ForgotPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'If the email exists, a reset link will be sent',
    })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.passwordResetService.requestPasswordReset(dto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token from email' })
    @ApiBody({ type: ResetPasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password reset successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired token',
    })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.passwordResetService.resetPassword(dto);
    }
}
