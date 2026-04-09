import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthRole } from 'generated/prisma';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly roleHierarchy: Record<AuthRole, AuthRole[]> = {
        [AuthRole.USER]: [AuthRole.USER],
        [AuthRole.SUPPORT]: [AuthRole.SUPPORT, AuthRole.USER],
        [AuthRole.ADMIN]: [AuthRole.ADMIN, AuthRole.SUPPORT, AuthRole.USER],
        [AuthRole.SUPER_ADMIN]: [AuthRole.SUPER_ADMIN, AuthRole.ADMIN, AuthRole.SUPPORT, AuthRole.USER],
    };

    constructor(
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<AuthRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            return false;
        }

        const userAllowedRoles = this.roleHierarchy[user.role as AuthRole] ?? [];
        return requiredRoles.some((role) => userAllowedRoles.includes(role));
    }
}