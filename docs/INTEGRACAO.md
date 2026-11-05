# Assistente IA — Base de integração

Backend inicial de demonstração para integrar IA à plataforma de corretor. **Não conecta ao sistema existente nem modifica o banco de dados.**

## Executar

1. Instale Node.js 20+.
2. Copie `.env.example` para `.env` e configure `OPENAI_API_KEY` e `APP_API_TOKEN`.
3. Carregue as variáveis de ambiente e execute `node --env-file=.env src/server.js` (Node 20.6+).
4. Teste `GET http://localhost:3001/health`.
5. Envie POST `/api/assistant` a partir de um backend autenticado, com header `Authorization: Bearer <APP_API_TOKEN>` e JSON:

```json
{ "message": "Agende uma visita amanhã às 15h", "context": { "timezone": "America/Sao_Paulo" } }
```

A resposta inclui `reply`, `proposed_action` e `executed: false`. A ação **não é executada**.

## Antes de colocar em produção

- Integrar ao código-fonte real, verificar sessão e permissões do usuário e isolar dados por corretor/tenant.
- Nunca enviar `APP_API_TOKEN` ao navegador: endpoint atual é somente servidor-servidor.
- Validar parâmetros e identidade do cliente, exigir confirmação para gravações, registrar auditoria.
- Adicionar limites por usuário, gestão de custos, tratamento LGPD e testes de segurança.
- Implementar gravações via serviços internos, jamais por comando livre da IA.
- Configurar `OPENAI_API_KEY` na hospedagem do backend, nunca no código GitHub ou frontend.

## Próxima etapa

Importar código da plataforma existente e adaptar a rota ao backend/autenticação/banco já utilizados. Entrada por voz pode ser adicionada no frontend posteriormente.
