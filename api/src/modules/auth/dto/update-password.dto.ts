import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @ApiProperty({
        description: 'Current account password',
        example: 'oldPassword123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    current_password: string;

    @ApiProperty({
        description: 'New account password',
        example: 'newPassword123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    new_password: string;
}
