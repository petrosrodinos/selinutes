import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { EmailAuthService } from '../services/email.service';
import { RegisterEmailDto } from '../dto/register-email.dto';
import { LoginEmailDto } from '../dto/login-email.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthResponse } from '../entities/auth-response.entity';
import { JwtGuard } from 'src/shared/guards/jwt.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UpdateUsernameDto } from '../dto/update-username.dto';
import { UpdatePasswordDto } from '../dto/update-password.dto';

@ApiTags('Email Authentication')
@Controller('auth/email')
export class EmailAuthController {
    constructor(private readonly authService: EmailAuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user with email and password' })
    @ApiBody({ type: RegisterEmailDto })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        type: AuthResponse
    })
    @ApiResponse({
        status: 409,
        description: 'Conflict - User with this email already exists'
    })
    async registerWithEmail(@Body() dto: RegisterEmailDto) {
        try {
            return this.authService.registerWithEmail(dto);

        } catch (error) {
        }
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user with email and password' })
    @ApiBody({ type: LoginEmailDto })
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully',
        type: AuthResponse
    })
    async loginWithEmail(@Body() dto: LoginEmailDto) {
        return this.authService.loginWithEmail(dto);
    }


    @Get('refresh-token')
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Refresh token' })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        type: AuthResponse
    })
    async getMe(@CurrentUser('uuid') uuid: string) {
        return this.authService.refreshToken(uuid);
    }

    @Patch('update-username')
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Update username for authenticated user' })
    @ApiBody({ type: UpdateUsernameDto })
    @ApiResponse({
        status: 200,
        description: 'Username updated successfully',
        type: AuthResponse,
    })
    async updateUsername(@CurrentUser('uuid') uuid: string, @Body() dto: UpdateUsernameDto) {
        return this.authService.updateUsername(uuid, dto);
    }

    @Patch('update-password')
    @UseGuards(JwtGuard)
    @ApiOperation({ summary: 'Update password for authenticated user' })
    @ApiBody({ type: UpdatePasswordDto })
    @ApiResponse({
        status: 200,
        description: 'Password updated successfully',
    })
    async updatePassword(@CurrentUser('uuid') uuid: string, @Body() dto: UpdatePasswordDto) {
        return this.authService.updatePassword(uuid, dto);
    }
}
