import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { passportJwtSecret } from 'jwks-rsa';
import { UserRole } from '../../../../shared/domain/enums/user-role.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(configService: ConfigService) {
    // Cognito pode estar em região diferente (ex: us-east-1) do restante da app (ex: sa-east-1)
    const cognitoRegion =
      configService.get<string>('aws.cognito.region') || 'us-east-1';
    const userPoolId = configService.get<string>('aws.cognito.userPoolId');
    const jwksUri = `https://cognito-idp.${cognitoRegion}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: `https://cognito-idp.${cognitoRegion}.amazonaws.com/${userPoolId}`,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(payload: any): {
    cognitoId: string;
    username: string;
    role?: UserRole;
    groups: string[];
  } {
    // Cognito groups are in cognito:groups
    const cognitoGroups: unknown = payload['cognito:groups'];
    const groups: string[] = Array.isArray(cognitoGroups)
      ? cognitoGroups.map((g: unknown) => String(g))
      : [];

    // Extract role from groups, validating against UserRole enum
    let role: UserRole | undefined;
    if (groups && groups.length > 0) {
      // Try to find a valid role from groups
      for (const group of groups) {
        // Check if group matches any UserRole enum value (case-sensitive)
        if (Object.values(UserRole).includes(group as UserRole)) {
          role = group as UserRole;
          break;
        }
      }
    }

    const username = String(payload?.username || 'N/A');
    const sub = String(payload?.sub || '');

    // Log error only if role is missing
    if (!role) {
      this.logger.error(
        `No valid role found in Cognito groups for user ${username}. Groups: ${JSON.stringify(groups)}. Available roles: ${Object.values(UserRole).join(', ')}`,
      );
    }

    // Cognito access token não tem email, mas tem username e sub
    // Usamos o sub (Cognito ID) para buscar o usuário no banco
    return {
      cognitoId: sub, // Cognito sub - usado para buscar no banco
      username: username,
      role: role, // Can be undefined - RolesGuard will handle authorization
      groups: groups,
    };
  }
}
