import { Logger, Module } from '@nestjs/common';
import { EmailAuthService } from './services/email.service';
import { PasswordResetService } from './services/password-reset.service';
import { EmailAuthController } from './controllers/email.controller';
import { PasswordResetController } from './controllers/password-reset.controller';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { CreateJwtServiceModule } from '@/shared/utils/jwt/jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SendgridModule } from '@/integrations/notifications/sendgrid/sendgrid.module';
import { ResendModule } from '@/integrations/notifications/resend/resend.module';

@Module({
  imports: [
    PrismaModule,
    CreateJwtServiceModule,
    SendgridModule,
    ResendModule,
  ],
  providers: [EmailAuthService, PasswordResetService, JwtStrategy, Logger],
  controllers: [EmailAuthController, PasswordResetController],
})
export class AuthModule { }
