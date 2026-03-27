import { Controller, Post, Get, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { GameService } from './game.service'
import { CreateGameDto } from './dto/create-game.dto'
import { JoinGameDto } from './dto/join-game.dto'
import { SaveOfflineGameDto } from './dto/save-offline-game.dto'
import { Roles } from '@/shared/decorators/roles.decorator';
import { JwtGuard } from '@/shared/guards/jwt.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
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

    @Post(':code/finish')
    @Roles(AuthRoles.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Save a finished game and update player stats' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game saved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Game not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Game is not over yet' })
    async finishGame(@Param('code') code: string): Promise<void> {
        await this.gameService.finishGame(code)
    }

    @Post('offline/finish')
    @Roles(AuthRoles.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Save a finished offline or single-player game and update stats' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game saved successfully' })
    async saveOfflineGame(
        @CurrentUser('uuid') userUuid: string,
        @Body() dto: SaveOfflineGameDto
    ): Promise<void> {
        await this.gameService.saveOfflineGame(userUuid, dto)
    }
}
