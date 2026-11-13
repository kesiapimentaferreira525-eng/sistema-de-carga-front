import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MATERIALS,totalCarga,totalFatura,volumesPorUnidade} from '../src/app/core/calculations.js';
test('HU01: total é quantidade × preço unitário',()=>{assert.equal(totalCarga(12.5,80),1000); assert.equal(totalCarga(3,0.1),0.3);});
test('HU01: todos os oito materiais do documento estão disponíveis',()=>assert.deepEqual(MATERIALS,['Rachão','Rachinha','Rachão de Face','Rachão de rebolo','Areia','Brita','Pó','Barro']));
test('fatura consolida subtotal menos desconto',()=>assert.equal(totalFatura(1000,75),925));
test('HU05: não somar toneladas e metros cúbicos como se fossem iguais',()=>assert.deepEqual(volumesPorUnidade([{unidade:'t',quantidade:10},{unidade:'m³',quantidade:4},{unidade:'t',quantidade:5}]),{t:15,'m³':4}));
