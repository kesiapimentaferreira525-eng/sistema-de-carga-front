# CNC Transporte — Gestão de cargas

## Executar no Windows
1. Inicie seu backend Java em **http://localhost:8081**. O proxy de desenvolvimento já está configurado para essa porta; se ela mudar, altere `target` em `proxy.conf.json`.
2. Abra **http://localhost:4200**. Sem o Java, a tela mostra API indisponível — não inventa registros.

## Telas
- Painel: total faturado, pendente, volumes separados por unidade e últimas cargas; atualização a cada minuto enquanto aberto.
- Diário: registro, cálculo quantidade × preço, exclusão com confirmação, filtros por período/placa/material, ordenação e total filtrado.
- Faturas: seleção de cargas sem vínculo por CNPJ e período, desconto, cliente, emissão, vencimento, agência, conta e PIX.
- Detalhes: cargas, totais, datas, dados bancários, registro de pagamento, impressão/Salvar como PDF pelo navegador.
- PWA: manifest, ícones e service worker de produção. Instalação depende de HTTPS (ou localhost) e suporte do navegador. Apenas a interface é armazenada offline; lançamentos e pagamentos exigem conexão com Java.

## Contrato da API
Chamadas ajustadas ao contrato: POST/GET cargas, GET cargas disponíveis, DELETE carga, POST fatura com `numeroFatura` e `idsCargas`, e **PUT /api/faturas/{id}/pagar?dataPagamento=AAAA-MM-DD** com corpo `{}`. A API em `localhost:8081` foi verificada: os GET de cargas, cargas disponíveis e faturas respondem HTTP 200. O GET de faturas retornou lista vazia no momento da verificação. Os fluxos de escrita e o detalhe de uma fatura existente dependem de dados e do contrato completo do backend. Confira `API-CONTRATO.md`. Login não está incluído porque o contrato não especifica autenticação; nunca use tokens ou senhas fixos no código.

Não há dados bancários, CNPJs ou valores de produção inventados. Preencha os dados reais na emissão. CNPJ é validado pelo formato de 14 dígitos (não consulta Receita). O Java deve validar regras e valores; o cálculo na tela é indicativo e não substitui BigDecimal no backend.

## Produção e PWA
```powershell
npm test
npm run build
```
Publique o conteúdo de `dist/cargas-front/browser`. Configure o servidor para encaminhar `/api` ao Java e retornar `index.html` nas rotas de navegação. Alternativamente altere `apiUrl` em `src/environments/environment.production.ts` para a URL HTTPS pública do Java e configure CORS lá. **O proxy de desenvolvimento não existe na hospedagem de produção.** A base `/api` não deve ser redirecionada ao index.html. Sem HTTPS, PWA não instala fora de localhost. Limpe/desinstale service worker antigo se trocar hospedagem.

## Testes
`npm test` verifica materiais, cálculo de carga, desconto e separação de volumes. A compilação valida os templates Angular. Fluxos de interface conferidos com uma API de teste local; não comprovam compatibilidade com o Java real. O ZIP não contém node_modules, build ou metadados de repositório.
