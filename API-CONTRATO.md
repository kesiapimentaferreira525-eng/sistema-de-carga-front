# Contrato da API — documentos enviados

Base: `/api`. Desenvolvimento usa proxy para localhost:8081. Alterar caminhos e payloads no ApiService se os controllers reais forem diferentes.

| Operação | Método e caminho |
|---|---|
| Listar cargas | GET /api/cargas |
| Registrar carga | POST /api/cargas |
| Cargas disponíveis | GET /api/cargas/disponiveis |
| Excluir carga | DELETE /api/cargas/{id} |
| Listar faturas | GET /api/faturas |
| Consultar fatura e suas cargas | GET /api/faturas/{id} |
| Emitir fatura | POST /api/faturas |
| Registrar pagamento | PUT /api/faturas/{id}/pagar?dataPagamento=AAAA-MM-DD |

**Confirmados no documento complementar:** salvar/listar cargas, disponíveis, exclusão, emissão e pagamento. O documento não especifica autenticação, enums e respostas completas; confirme no Java.

**Verificação do backend em `localhost:8081` (13/11/2026):** `GET /api/cargas`, `GET /api/cargas/disponiveis` e `GET /api/faturas` responderam HTTP 200. A listagem de faturas estava vazia. As respostas de detalhe e operações de escrita não foram testadas para evitar criar, excluir ou pagar dados reais.

Listagens aceitam array JSON ou `{ "content": [...] }`. Se usa paginação, fornecer todos os registros necessários ou adaptar para paginação server-side: esta versão filtra os itens recebidos, não percorre páginas automaticamente.

POST carga:
```json
{"material":"Areia","placa":"ABC1D23","dataServico":"2026-11-13","ticket":"123","unidade":"t","quantidade":10,"valorUnitario":80,"cnpjCliente":"00000000000000","nomeCliente":"Nome real"}
```
Resposta: mesmos campos mais `id` e `valorTotal`. Material e unidade são strings conforme a tela; se Java usa enums como RACHAO_DE_FACE ou M3, mapear no serviço. O frontend consulta `/cargas/disponiveis` para a seleção na fatura.

POST fatura:
```json
{"numeroFatura":"PERIODO: 1","cnpjCliente":"00000000000000","nomeCliente":"Nome real","enderecoCliente":"Endereço real","emailCliente":"cliente@example.com","dataFatura":"2026-11-13","dataVencimento":"2026-11-30","desconto":0,"agencia":"1234","conta":"56789-0","pix":"chave-pix-real","dadosBancarios":"Agência: 1234\nConta: 56789-0\nPIX: chave-pix-real","idsCargas":[1,2]}
```
`GET /api/faturas` e `GET /api/faturas/{id}` retornam `id`, `numeroFatura`, os campos do cliente e datas, `subtotal`, `desconto`, `totalFaturado`, `agencia`, `conta`, `pix`, `dadosBancarios` e `statusPagamento` (`PENDENTE`/`PAGO`); no detalhe, `dataPagamento` é opcional e `cargas` é um array de cargas. O frontend envia os campos estruturados e também mantém `dadosBancarios` com os valores formatados para compatibilidade. Na leitura, os campos estruturados têm precedência; faturas antigas sem eles continuam exibindo `dadosBancarios`.

`agencia`, `conta` e `pix` são preenchidos na emissão com os dados reais e devem ser persistidos e retornados pelo `GET /api/faturas/{id}`. `dadosBancarios` também é enviado e mantido para compatibilidade; quando os campos estruturados não estiverem presentes, a tela de detalhes imprime esse campo como fallback. Se nenhum campo estiver disponível, o frontend informa que os dados bancários/PIX não foram cadastrados; não há valores padrão fictícios.

PUT pagamento: `/api/faturas/1/pagar?dataPagamento=2026-11-13`, corpo JSON `{}`.
Resposta pode ser fatura ou 204: a tela busca o detalhe novamente após sucesso. O Java deve validar autorização, impedir faturamento duplicado e recalcular valores. IDs devem ser números. Datas esperadas em ISO `YYYY-MM-DD`; moeda em números JSON, nunca strings formatadas. Erros podem trazer `{ "message": "Motivo" }`.

Os dados dos exemplos são ilustrativos e não são semeados na aplicação. Não use CNPJ de exemplo em produção.
