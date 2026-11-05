# Conectar o assistente ao aplicativo existente

## Situação

O código da plataforma publicada ainda não foi importado para este repositório. Este pacote é uma base independente, não um deploy funcional na aplicação existente.

## Fluxo recomendado

```text
Navegador com sessão do corretor
   -> endpoint autenticado da plataforma (/api/assistente)
      -> verifica identidade + permissões + limites
      -> busca contexto mínimo autorizado (tenant/corretor)
      -> servidor da plataforma chama backend da IA /api/assistant
         com APP_API_TOKEN como segredo servidor-servidor
      <- {reply, proposed_action, executed:false}
   <- navegador mostra resposta e permite revisar proposta
```

**Nunca** chame o backend de demonstração diretamente do navegador, pois o token não deve aparecer no JavaScript público. Não use segredo em VITE_*, NEXT_PUBLIC_* ou variáveis injetadas no frontend.

## Contrato do endpoint de IA

POST /api/assistant

Cabeçalhos:
- Authorization: Bearer <APP_API_TOKEN>
- Content-Type: application/json

Corpo:

```json
{
  "message": "Marque uma visita amanhã às 15h com João",
  "context": {
    "timezone": "America/Sao_Paulo",
    "today": "2026-11-05",
    "lead": { "name": "João" }
  }
}
```

Resposta de demonstração:

```json
{
  "reply": "Posso preparar uma visita, mas preciso do imóvel.",
  "proposed_action": null,
  "executed": false
}
```

O servidor deve validar novamente qualquer `proposed_action`: tipo, campos, autorização, disponibilidade e confirmação do usuário. A IA não define autorização nem substitui regras de negócio.

## Incorporar o componente React

O arquivo `frontend/AssistenteIA.jsx` é independente. Exemplo de conexão (a rota é ilustrativa e deve existir no backend da plataforma):

```jsx
import AssistenteIA from './AssistenteIA';

function MeuPainel() {
  async function sendMessage(message) {
    const response = await fetch('/api/assistente', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error('Falha de comunicação');
    return response.json();
  }
  return <AssistenteIA sendMessage={sendMessage} onProposedAction={action => {
    // Abrir modal de revisão no aplicativo real.
    console.info('Proposta a revisar', action.type);
  }} />;
}
```

A entrada de voz usa Web Speech API quando suportada. A gravação é transcrita no navegador, pode utilizar serviços do fornecedor do navegador e depende de autorização do microfone. Não é gravação/armazenamento de áudio no servidor deste projeto.

## Checklist para ativação

- [ ] Exportar código-fonte atual da plataforma para a branch de desenvolvimento.
- [ ] Identificar framework, autenticação, banco e hospedagem.
- [ ] Criar endpoint autenticado de proxy no backend existente.
- [ ] Integrar componente na tela Minha Semana e no layout global.
- [ ] Mapear operações reais com validação e confirmação.
- [ ] Configurar segredos na hospedagem, limites de custo e auditoria.
- [ ] Testar com usuários e dados fictícios antes de liberar produção.

Não enviar planilhas com dados pessoais de leads à IA sem base legal e política de minimização.
