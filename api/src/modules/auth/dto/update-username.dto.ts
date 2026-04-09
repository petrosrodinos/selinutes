import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUsernameDto {
    @ApiProperty({
        description: 'New username',
        example: 'new_username',
        minLength: 2,
    })
    @IsString()
    @MinLength(2)
    username: string;
}
