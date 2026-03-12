# Implementation Plan

- [x] 1. Criar DTOs de response específicos por role
  - Criar AdminProfileResponseDto em auth/application/use-cases/get-current-user/
  - Criar DoctorProfileResponseDto estendendo AdminProfileResponseDto
  - Adicionar decoradores @ApiProperty com exemplos
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3_

- [x] 2. Criar DTOs de update específicos por role
  - Criar UpdateAdminProfileDto em auth/application/use-cases/update-profile/
  - Criar UpdateDoctorProfileDto estendendo UpdateAdminProfileDto
  - Adicionar validações com class-validator (name, phone, crm, specialty)
  - Adicionar decoradores @ApiProperty
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.4, 6.6_

- [x] 3. Modificar IUserDbRepository para suportar eager loading condicional
  - Atualizar método findById para aceitar parâmetro opcional includeDoctor: boolean
  - Documentar comportamento do parâmetro
  - _Requirements: 1.3, 5.2_

- [x] 4. Implementar eager loading condicional no TypeORMUserDbRepository
  - Modificar método findById para carregar relação doctor apenas quando includeDoctor=true
  - Usar QueryBuilder ou relations condicionalmente
  - Testar que doctor não é carregado quando includeDoctor=false
  - _Requirements: 1.3, 5.2_

- [x] 5. Atualizar GetCurrentUserUseCase
  - Modificar assinatura do método execute para aceitar userId e role
  - Chamar userDbRepository.findById com includeDoctor baseado na role
  - Implementar lógica para retornar AdminProfileResponseDto ou DoctorProfileResponseDto
  - Lançar UserNotFoundError se usuário não existe
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2_

- [x] 6. Atualizar UpdateProfileUseCase
  - Modificar assinatura do método execute para aceitar userId, role e dto
  - Injetar IDoctorRepository no construtor
  - Implementar lógica para atualizar apenas campos permitidos por role
  - Para ADMIN: atualizar apenas users table (name, phone)
  - Para DOCTOR: atualizar users table + doctors table (crm, specialty)
  - Retornar DTO específico baseado na role
  - Lançar UserNotFoundError se usuário não existe
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 5.3_

- [x] 7. Atualizar AuthController
  - Modificar método getCurrentUser para passar role do JWT para o use case
  - Modificar método updateProfile para passar role do JWT para o use case
  - Atualizar decoradores Swagger com exemplos para cada role
  - Adicionar @ApiResponse com exemplos diferentes para ADMIN e DOCTOR
  - Remover completamente o método signUp
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1, 4.4, 4.5, 6.5_

- [ ] 8. Atualizar INotificationRepository interface
  - Adicionar método sendWelcomeAdminEmail com parâmetros: email, name, temporaryPassword, loginUrl
  - Manter método sendWelcomeDoctorEmail existente
  - Documentar propósito de cada método
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Criar templates de email para ADMIN
  - Criar welcome-admin-email.html em users/infrastructure/templates/
  - Criar welcome-admin-email.txt em users/infrastructure/templates/
  - Incluir placeholders: {{name}}, {{email}}, {{temporaryPassword}}, {{loginUrl}}
  - Adicionar informações sobre permissões administrativas
  - Usar design consistente com template de doctor
  - _Requirements: 3.3, 9.1, 9.2, 9.3, 9.6_

- [ ] 10. Atualizar EmailTemplateService
  - Adicionar método renderWelcomeAdminEmail
  - Implementar lógica de substituição de variáveis
  - Retornar objeto com html e text
  - Reutilizar método loadTemplate existente
  - _Requirements: 3.3, 9.4_

- [ ] 11. Atualizar ConsoleNotificationRepository
  - Implementar método sendWelcomeAdminEmail
  - Logar conteúdo formatado no console
  - Incluir separadores visuais claros
  - Manter consistência com formato de doctor
  - _Requirements: 3.6, 4.3_

- [ ] 12. Atualizar SESNotificationRepository
  - Implementar método sendWelcomeAdminEmail
  - Usar EmailTemplateService.renderWelcomeAdminEmail
  - Enviar email via AWS SES
  - Tratar erros e logar falhas
  - _Requirements: 3.7, 4.4_

- [ ] 13. Atualizar CreateAdminUseCase
  - Modificar chamada de notificação para usar sendWelcomeAdminEmail
  - Passar parâmetros corretos: email, name, temporaryPassword, loginUrl
  - Manter tratamento de erro existente (não bloquear criação se email falhar)
  - _Requirements: 3.1, 3.3, 3.5_

- [ ] 14. Atualizar CreateDoctorUseCase
  - Verificar que usa sendWelcomeDoctorEmail com todos os parâmetros
  - Garantir que crm e specialty são passados
  - Manter tratamento de erro existente
  - _Requirements: 3.2, 3.4, 3.5_

- [ ] 15. Configurar exports no UsersModule
  - Adicionar NOTIFICATION_REPOSITORY_TOKEN aos exports
  - Verificar que USER_DB_REPOSITORY_TOKEN e DOCTOR_REPOSITORY_TOKEN já estão exportados
  - _Requirements: 5.4, 5.5_

- [ ] 16. Configurar imports no AuthModule
  - Adicionar UsersModule aos imports
  - Remover SignUpUseCase dos providers
  - Verificar que GetCurrentUserUseCase e UpdateProfileUseCase têm acesso aos repositórios
  - _Requirements: 5.4, 4.5, 8.1_

- [x] 17. Remover arquivos relacionados ao SignUp
  - Deletar auth/application/use-cases/sign-up/sign-up.use-case.ts
  - Deletar auth/application/use-cases/sign-up/sign-up.dto.ts
  - Deletar auth/application/use-cases/sign-up/sign-up-response.dto.ts
  - Deletar pasta auth/application/use-cases/sign-up/ se vazia
  - Remover imports não utilizados
  - _Requirements: 4.5, 4.6, 8.1, 8.2, 8.5_

- [ ] 18. Remover testes de SignUp
  - Deletar testes relacionados ao SignUpUseCase
  - Deletar testes do endpoint POST /auth/sign-up no AuthController
  - Atualizar testes E2E para não incluir signup
  - _Requirements: 4.7, 8.1_

- [ ] 19. Criar testes unitários para GetCurrentUserUseCase
  - Testar retorno de AdminProfileResponseDto para role ADMIN
  - Testar retorno de DoctorProfileResponseDto para role DOCTOR
  - Testar que doctor é incluído apenas para role DOCTOR
  - Testar lançamento de UserNotFoundError
  - Mock do IUserDbRepository
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 10.2_

- [ ] 20. Criar testes unitários para UpdateProfileUseCase
  - Testar atualização de name e phone para ADMIN
  - Testar atualização de name, phone, crm, specialty para DOCTOR
  - Testar que campos de doctor são ignorados para ADMIN
  - Testar lançamento de UserNotFoundError
  - Mock dos repositórios
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 10.2_

- [ ] 21. Criar testes unitários para EmailTemplateService
  - Testar renderWelcomeAdminEmail substitui todas as variáveis
  - Testar retorno de html e text
  - Verificar que templates existem
  - _Requirements: 9.4, 10.2_

- [ ] 22. Criar testes unitários para NotificationRepositories
  - Testar ConsoleNotificationRepository.sendWelcomeAdminEmail loga corretamente
  - Testar SESNotificationRepository.sendWelcomeAdminEmail envia via SES
  - Mock do SESClient
  - _Requirements: 3.6, 3.7, 10.2_

- [ ] 23. Criar testes de integração para GET /auth/me
  - Testar retorno 401 sem JWT
  - Testar retorno 404 se usuário não existe
  - Testar retorno de dados de ADMIN sem campos de doctor
  - Testar retorno de dados de DOCTOR com crm e specialty
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 10.3_

- [ ] 24. Criar testes de integração para PATCH /auth/profile
  - Testar atualização de name e phone para ADMIN
  - Testar atualização de todos os campos para DOCTOR
  - Testar que campos não permitidos são ignorados
  - Testar retorno 400 para dados inválidos
  - Testar retorno de dados atualizados
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 10.3_

- [ ] 25. Criar testes de integração para criação de usuários
  - Testar que POST /users envia email com template de admin
  - Testar que POST /doctors envia email com template de doctor
  - Verificar conteúdo dos emails (mock ou console)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.3_

- [ ] 26. Criar testes E2E para fluxo completo
  - Fluxo ADMIN: criar → receber email → login → GET /me → PATCH /profile
  - Fluxo DOCTOR: criar → receber email → login → GET /me → PATCH /profile com CRM
  - Verificar que POST /auth/sign-up não existe
  - _Requirements: 1.1-1.6, 2.1-2.9, 3.1-3.8, 4.1, 10.3_

- [x] 27. Atualizar documentação Swagger
  - Verificar que todos os endpoints têm exemplos corretos
  - Verificar que POST /auth/sign-up não aparece
  - Adicionar descrições claras para cada campo dos DTOs
  - Documentar diferenças entre ADMIN e DOCTOR
  - _Requirements: 4.4, 6.5, 6.6, 10.1_

- [ ] 28. Atualizar README
  - Remover referências ao signup público
  - Documentar novos endpoints de perfil
  - Adicionar exemplos de request/response para cada role
  - Documentar templates de email
  - _Requirements: 4.4, 8.4, 10.4, 10.5_

- [ ] 29. Executar verificação de diagnósticos
  - Rodar getDiagnostics em todos os arquivos modificados
  - Corrigir erros de TypeScript
  - Corrigir warnings de linting
  - Verificar imports não utilizados
  - _Requirements: 8.5_

- [ ] 30. Validação final e cleanup
  - Executar todos os testes (unit, integration, e2e)
  - Verificar que nenhum arquivo de signup permanece
  - Verificar que todos os imports estão corretos
  - Verificar que documentação está atualizada
  - Fazer commit com mensagem descritiva
  - _Requirements: 8.1-8.6, 10.1-10.6_
