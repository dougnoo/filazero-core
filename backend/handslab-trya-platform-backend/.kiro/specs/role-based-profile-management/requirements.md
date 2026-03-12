# Requirements Document

## Introduction

Esta feature aprimora o sistema de autenticação e gerenciamento de usuários da Trya Platform API para fornecer experiências personalizadas baseadas em roles. O sistema retornará dados específicos de perfil conforme a role do usuário autenticado, permitirá atualizações de perfil com validações específicas por role, implementará estratégias de notificação personalizadas para cada tipo de usuário, e removerá o signup público do módulo de autenticação, centralizando a criação de usuários nos controllers administrativos apropriados.

## Requirements

### Requirement 1: Endpoint /me com Dados Específicos por Role

**User Story:** Como usuário autenticado, eu quero que o endpoint /me retorne meus dados com campos específicos da minha role, para que eu receba apenas informações relevantes ao meu perfil.

#### Acceptance Criteria

1. WHEN um usuário ADMIN autenticado acessa GET /auth/me THEN o sistema SHALL retornar: id, cognitoId, email, name, role, phone, active, createdAt, updatedAt
2. WHEN um usuário DOCTOR autenticado acessa GET /auth/me THEN o sistema SHALL retornar: id, cognitoId, email, name, role, phone, active, crm, specialty, createdAt, updatedAt
3. WHEN o usuário autenticado tem role DOCTOR THEN o sistema SHALL incluir automaticamente os dados da tabela doctors (crm, specialty)
4. WHEN o usuário autenticado tem role ADMIN THEN o sistema SHALL NOT incluir campos relacionados a doctor
5. WHEN o token JWT é inválido ou expirado THEN o sistema SHALL retornar erro 401 Unauthorized
6. WHEN o usuário não existe no banco de dados PostgreSQL THEN o sistema SHALL retornar erro 404 Not Found

### Requirement 2: Atualização de Perfil Baseada em Role

**User Story:** Como usuário autenticado, eu quero atualizar meu perfil com campos específicos da minha role, para que eu possa manter minhas informações atualizadas de forma apropriada.

#### Acceptance Criteria

1. WHEN um usuário ADMIN autenticado atualiza seu perfil THEN ele SHALL poder modificar: name, phone
2. WHEN um usuário DOCTOR autenticado atualiza seu perfil THEN ele SHALL poder modificar: name, phone, crm, specialty
3. WHEN um usuário ADMIN tenta atualizar campos de doctor (crm, specialty) THEN o sistema SHALL ignorar esses campos silenciosamente
4. WHEN um usuário DOCTOR atualiza crm ou specialty THEN o sistema SHALL atualizar a tabela doctors no PostgreSQL
5. WHEN um usuário atualiza name ou phone THEN o sistema SHALL atualizar a tabela users no PostgreSQL
6. WHEN a atualização de perfil é bem-sucedida THEN o sistema SHALL retornar os dados atualizados no formato específico da role
7. WHEN a validação falha em qualquer campo THEN o sistema SHALL retornar erro 400 Bad Request com detalhes dos campos inválidos
8. WHEN a atualização no PostgreSQL falha THEN o sistema SHALL retornar erro 500 Internal Server Error
9. IF o usuário tenta atualizar email THEN o sistema SHALL retornar erro 400 Bad Request indicando que email não pode ser alterado

### Requirement 3: Estratégias de Email Personalizadas para Criação de Usuários

**User Story:** Como novo usuário do sistema, eu quero receber emails de boas-vindas personalizados baseados na minha role, para que a comunicação inicial seja relevante ao meu contexto profissional.

#### Acceptance Criteria

1. WHEN um novo usuário ADMIN é criado THEN o sistema SHALL enviar email de boas-vindas com template específico para administradores
2. WHEN um novo usuário DOCTOR é criado THEN o sistema SHALL enviar email de boas-vindas com template específico para médicos incluindo CRM e specialty
3. WHEN o template de email de boas-vindas para ADMIN é usado THEN ele SHALL incluir: nome, email, senha temporária, link de login, instruções administrativas
4. WHEN o template de email de boas-vindas para DOCTOR é usado THEN ele SHALL incluir: nome, email, CRM, specialty, senha temporária, link de login, instruções médicas
5. WHEN o envio de email falha THEN o sistema SHALL logar o erro mas NOT bloquear a criação do usuário
6. WHEN o NOTIFICATION_PROVIDER é 'console' THEN o sistema SHALL logar o conteúdo do email formatado no console
7. WHEN o NOTIFICATION_PROVIDER é 'ses' THEN o sistema SHALL enviar o email via AWS SES
8. WHEN outros fluxos de autenticação são executados (reset de senha, verificação de email, etc.) THEN o sistema SHALL usar templates genéricos padrão sem personalização por role

### Requirement 4: Remoção do Signup Público do Auth Controller

**User Story:** Como arquiteto de segurança, eu quero que o signup de usuários seja feito apenas através dos controllers administrativos, para que o sistema tenha controle centralizado sobre a criação de contas.

#### Acceptance Criteria

1. WHEN o endpoint POST /auth/sign-up é removido THEN ele SHALL NOT estar mais disponível na API
2. WHEN um ADMIN quer criar um novo ADMIN THEN ele SHALL usar POST /users
3. WHEN um ADMIN quer criar um novo DOCTOR THEN ele SHALL usar POST /doctors
4. WHEN a documentação Swagger é acessada THEN o endpoint /auth/sign-up SHALL NOT estar listado
5. WHEN o código do AuthController é revisado THEN o método signUp SHALL estar completamente removido
6. WHEN o SignUpUseCase é revisado THEN ele SHALL estar completamente removido do código
7. WHEN testes existentes para signup são executados THEN eles SHALL ser removidos ou atualizados para testar os novos endpoints administrativos

### Requirement 5: Integração entre Auth e Users Module

**User Story:** Como desenvolvedor, eu quero que os módulos de autenticação e usuários estejam integrados corretamente, para que operações de perfil funcionem de forma consistente.

#### Acceptance Criteria

1. WHEN o GetCurrentUserUseCase é executado THEN ele SHALL consultar o IUserDbRepository para buscar dados do PostgreSQL
2. WHEN o GetCurrentUserUseCase busca um DOCTOR THEN ele SHALL fazer eager loading da relação com a tabela doctors
3. WHEN o UpdateProfileUseCase é executado THEN ele SHALL usar o IUserDbRepository e IDoctorRepository conforme necessário
4. WHEN o AuthModule é inicializado THEN ele SHALL importar o UsersModule para acessar os repositórios
5. WHEN o UsersModule exporta repositórios THEN ele SHALL incluir USER_DB_REPOSITORY_TOKEN e DOCTOR_REPOSITORY_TOKEN
6. WHEN operações de perfil falham THEN o sistema SHALL usar os mesmos domain errors (UserNotFoundError, DatabaseSaveFailedError)

### Requirement 6: DTOs de Response Específicos por Role

**User Story:** Como desenvolvedor frontend, eu quero DTOs de resposta bem definidos para cada role, para que eu possa tipar corretamente as respostas da API.

#### Acceptance Criteria

1. WHEN o sistema define DTOs de response THEN ele SHALL criar AdminProfileResponseDto com campos específicos de admin
2. WHEN o sistema define DTOs de response THEN ele SHALL criar DoctorProfileResponseDto com campos específicos de doctor
3. WHEN o endpoint /auth/me retorna dados THEN ele SHALL usar o DTO apropriado baseado na role
4. WHEN o endpoint PATCH /auth/profile retorna dados THEN ele SHALL usar o DTO apropriado baseado na role
5. WHEN a documentação Swagger é gerada THEN ela SHALL mostrar exemplos diferentes para cada role
6. WHEN os DTOs são validados THEN eles SHALL incluir decoradores @ApiProperty com descrições claras

### Requirement 7: Validação e Segurança

**User Story:** Como arquiteto de segurança, eu quero validações robustas nas operações de perfil, para que o sistema previna atualizações não autorizadas.

#### Acceptance Criteria

1. WHEN um usuário tenta acessar /auth/me THEN o sistema SHALL validar o JWT token via JwtAuthGuard
2. WHEN um usuário tenta atualizar perfil THEN o sistema SHALL validar que o userId do token corresponde ao perfil sendo atualizado
3. WHEN um usuário tenta atualizar campos não permitidos THEN o sistema SHALL ignorar esses campos sem retornar erro
4. WHEN validação de input falha THEN o sistema SHALL retornar mensagens de erro claras e específicas
5. WHEN um usuário está desativado (active=false) THEN o sistema SHALL permitir acesso ao /auth/me mas indicar o status
6. WHEN logs são gerados THEN eles SHALL NOT incluir dados sensíveis como senhas ou tokens completos

### Requirement 8: Migração de Dados e Limpeza de Código

**User Story:** Como engenheiro de plataforma, eu quero que o código seja limpo e atualizado sem preocupação com compatibilidade, para que o sistema seja mantível e moderno.

#### Acceptance Criteria

1. WHEN o endpoint /auth/sign-up é removido THEN todos os arquivos relacionados (controller method, use case, DTOs, testes) SHALL ser completamente deletados
2. WHEN o código é revisado THEN não SHALL existir referências ao SignUpUseCase
3. WHEN migrações de banco de dados são necessárias THEN elas SHALL ser criadas e documentadas
4. WHEN a documentação é atualizada THEN ela SHALL refletir apenas os novos endpoints sem mencionar o signup público
5. WHEN imports não utilizados existem THEN eles SHALL ser removidos
6. WHEN arquivos de teste obsoletos existem THEN eles SHALL ser deletados

### Requirement 9: Templates de Email para Criação de Usuários

**User Story:** Como gerente de produto, eu quero templates de email profissionais e personalizados para novos usuários, para que a comunicação inicial seja clara e apropriada.

#### Acceptance Criteria

1. WHEN templates de email de boas-vindas são criados THEN eles SHALL existir em formato HTML e texto plano
2. WHEN um template de boas-vindas para ADMIN é usado THEN ele SHALL incluir: nome, email, senha temporária, link de login, instruções administrativas sobre primeiro acesso
3. WHEN um template de boas-vindas para DOCTOR é usado THEN ele SHALL incluir: nome, email, CRM, specialty, senha temporária, link de login, instruções sobre primeiro acesso e uso da plataforma médica
4. WHEN templates são renderizados THEN eles SHALL usar o EmailTemplateService existente
5. WHEN o template de boas-vindas para DOCTOR é renderizado THEN ele SHALL destacar visualmente o CRM e specialty do médico
6. WHEN o template de boas-vindas para ADMIN é renderizado THEN ele SHALL incluir informações sobre permissões administrativas

### Requirement 10: Documentação e Testes

**User Story:** Como desenvolvedor, eu quero documentação clara e testes abrangentes, para que eu possa entender e manter o sistema facilmente.

#### Acceptance Criteria

1. WHEN a documentação Swagger é acessada THEN ela SHALL incluir exemplos de request/response para cada role
2. WHEN testes unitários são executados THEN eles SHALL cobrir todos os casos de uso por role
3. WHEN testes de integração são executados THEN eles SHALL validar o fluxo completo de perfil por role
4. WHEN o README é atualizado THEN ele SHALL documentar as mudanças nos endpoints de signup
5. WHEN exemplos de código são fornecidos THEN eles SHALL mostrar como usar os novos endpoints
6. WHEN erros são documentados THEN eles SHALL incluir códigos de status HTTP e mensagens esperadas
