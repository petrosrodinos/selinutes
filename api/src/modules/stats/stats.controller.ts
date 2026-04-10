import { Controller, Get, Query, HttpCode, HttpStatus, UseGuards, ParseIntPipe, DefaultValuePipe, Delete, Param } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { StatsService, LeaderboardEntry, AdminUserOverviewEntry } from './stats.service'
import { JwtGuard } from '@/shared/guards/jwt.guard'
import { RolesGuard } from '@/shared/guards/roles.guard'
import { Roles } from '@/shared/decorators/roles.decorator'
import { CurrentUser } from '@/shared/decorators/current-user.decorator'
import { AuthRoles } from 'src/modules/auth/interfaces/auth.interface'

@ApiTags('Stats')
@ApiBearerAuth()
@Controller('stats')
@UseGuards(JwtGuard, RolesGuard)
@Roles(AuthRoles.USER)
export class StatsController {
    constructor(private readonly statsService: StatsService) {}

    @Get('me')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the current authenticated user stats' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Stats retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Stats not found' })
    getMyStats(@CurrentUser('uuid') userUuid: string) {
        return this.statsService.getStats(userUuid)
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get stats by user UUID' })
    @ApiQuery({ name: 'user_uuid', required: true, description: 'The UUID of the user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Stats retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Stats not found' })
    getStatsByUser(@Query('user_uuid') userUuid: string) {
        return this.statsService.getStats(userUuid)
    }

    @Get('leaderboard')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get leaderboard sorted by points descending' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of entries to return (default 10)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Leaderboard retrieved successfully' })
    getLeaderboard(
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ): Promise<LeaderboardEntry[]> {
        return this.statsService.getLeaderboard(limit)
    }

    @Get('admin/users-overview')
    @Roles(AuthRoles.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: get users overview with stats and games played' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Users overview retrieved successfully' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    getAdminUsersOverview(): Promise<AdminUserOverviewEntry[]> {
        return this.statsService.getAdminUsersOverview()
    }

    @Delete('admin/users/:userUuid')
    @Roles(AuthRoles.ADMIN)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin: delete user by UUID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    deleteUserByUuid(
        @CurrentUser('uuid') adminUuid: string,
        @Param('userUuid') userUuid: string,
    ): Promise<{ message: string }> {
        return this.statsService.deleteUserByUuid(adminUuid, userUuid)
    }
}
