import { ApiProperty } from '@nestjs/swagger';

export class BrokerThemeResponseDto {
  @ApiProperty({
    description: 'Dados do tema do broker',
    example: {
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNmOGY5ZmEiLz48L3N2Zz4=',
      favicon:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PjxyZWN0IHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgZmlsbD0iIzAwN2JmZiIvPjwvc3ZnPg==',
      loginBackground:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiPjxyZWN0IHdpZHRoPSIxOTIwIiBoZWlnaHQ9IjEwODAiIGZpbGw9IiMwMDdiZmYiLz48L3N2Zz4=',
      bannerDashboard: 'data:image/svg+xml;base64,...',
      bannerDashboardMobile: 'data:image/svg+xml;base64,...',
      onboardingFinalIllustration: 'data:image/svg+xml;base64,...',
    },
  })
  theme: {
    name?: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundSecondaryColor?: string;
    logo: string; // Base64 data URI
    favicon: string; // Base64 data URI
    loginBackground: string; // Base64 data URI
    bannerDashboard: string; // Base64 data URI
    bannerDashboardMobile: string;
    onboardingFinalIllustration: string; // Base64 data URI
  };
}
