import { ApiProperty } from '@nestjs/swagger';

export class FamilySidebarMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    description: 'Relação com o titular. Ex.: Eu, Cônjuge, Filho(a)',
  })
  relationship: string;

  @ApiProperty({ description: 'Idade em anos completos' })
  age: number;
}

export class FamilySidebarResponseDto {
  @ApiProperty({ description: 'Quantidade total de membros da família' })
  totalMembers: number;

  @ApiProperty({ type: [FamilySidebarMemberDto] })
  members: FamilySidebarMemberDto[];
}
