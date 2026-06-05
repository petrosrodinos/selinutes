import { Body, Controller, Get, HttpCode, HttpStatus, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DocsService, GameRulesContent } from './docs.service'
import { UpdateGameRulesDto } from './dto/update-game-rules.dto'
import { JwtGuard } from '@/shared/guards/jwt.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface'

@ApiTags('Docs')
@Controller('docs')
export class DocsController {
    constructor(private readonly docsService: DocsService) {}

    @Get('game-rules')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get canonical game rules markdown' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game rules retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Game rules document not found' })
    getGameRules(): Promise<GameRulesContent> {
        return this.docsService.getGameRules()
    }

    @Put('game-rules')
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(AuthRoles.ADMIN)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: update canonical game rules markdown' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Game rules updated successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    updateGameRules(@Body() dto: UpdateGameRulesDto): Promise<GameRulesContent> {
        return this.docsService.updateGameRules(dto.content)
    }
}
