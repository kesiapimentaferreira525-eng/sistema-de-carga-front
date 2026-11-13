import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pagamentoRequest} from '../src/app/core/contracts.js';
test('documento complementar: pagamento usa PUT /pagar com data na query e corpo vazio',()=>assert.deepEqual(pagamentoRequest('/api',701,'2026-10-23'),{method:'PUT',url:'/api/faturas/701/pagar',body:{},params:{dataPagamento:'2026-10-23'}}));
