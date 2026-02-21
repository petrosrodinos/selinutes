import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { GameService } from './game.service'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface';

@ApiTags('Game')
@Controller('games')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.ADMIN)
export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new game' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Game created successfully' })
    createGame(@Body() dto: CreateGameDto): void {
    }

    @Post('join')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Join an existing game' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Joined game successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Game not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Game is full or already started' })
    joinGame(@Body() dto: JoinGameDto): void {
    }

    @Get(':code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get game info by code' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game info retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Game not found' })
    getGame(@Param('code') code: string): void {
    }
}
