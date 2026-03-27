import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
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
import { GetGamesDto } from './dto/get-games.dto';
import { Game, GameMode } from 'generated/prisma';
import { GameSession } from './interfaces/game.interface';


@ApiTags('Game')
@Controller('games')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.USER)

export class GameController {
    constructor(private readonly gameService: GameService) { }

    @Get()
    @Roles(AuthRoles.USER)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get games with filtering, sorting, and pagination' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Games retrieved successfully' })
    async getGames(@Query() dto: GetGamesDto): Promise<{ data: Game[]; total: number; page: number; limit: number }> {
        return this.gameService.getGames(dto)
    }


    @Get('record/:uuid')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a stored game record by UUID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game record retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Game not found' })
    async getGameRecord(@Param('uuid') uuid: string): Promise<Game & { opponent: (Game & { username: string; stats: object | null }) | null }> {
        return this.gameService.getGameRecord(uuid)
    }

    @Get(':code')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get game info by code' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game info retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Game not found' })
    async getLocalGame(@Param('code') code: string): Promise<GameSession> {
        return this.gameService.getLocalGame({ code })
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
