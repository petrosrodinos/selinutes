// src/modules/auth/dto/register-email.dto.ts

import { IsDateString, IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterEmailDto {
    @ApiProperty({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User password (minimum 6 characters)',
        example: 'password123',
        minLength: 6
    })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'User date of birth',
        example: '1990-01-01'
    })
    @IsDateString()
    date_of_birth: Date;

    @ApiProperty({
        description: 'User username',
        example: 'username123'
    })
    @IsString()
    @MinLength(2)
    username: string;

}
