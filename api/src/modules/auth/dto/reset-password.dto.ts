import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Password reset token from the email link',
        example: 'a1b2c3d4e5f6...',
    })
    @IsString()
    token: string;

    @ApiProperty({
        description: 'New password (minimum 8 characters)',
        example: 'newPassword123',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    new_password: string;
}
