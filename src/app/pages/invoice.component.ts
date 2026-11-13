import { Component,inject,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute,RouterLink } from '@angular/router';
import { ApiService,mensagemErro } from '../core/api.service';
import { Fatura } from '../core/models';
import { dataLocal } from '../core/calculations.js';
@Component({standalone:true,imports:[CommonModule,FormsModule,RouterLink],styles:[`
.print-actions{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
.print-actions small{color:#66756e}
.invoice-print-brand{display:none;align-items:center;gap:13px;margin:0 0 20px;color:#172b45;font-size:15px;font-weight:800;letter-spacing:.045em}
.invoice-print-brand .brand-mark{display:grid;width:42px;height:42px;place-items:center;border-radius:12px;background:linear-gradient(145deg,#287ac0,#123b68);color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.invoice-print-brand svg{width:28px;height:28px;fill:currentColor}
.invoice-print-brand small{display:block;margin-top:4px;color:#74869c;font-size:9px;font-weight:700;letter-spacing:.13em}
.invoice-title{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 12px}
.invoice-bank{margin:0;max-width:60%;overflow-wrap:anywhere}
.invoice-bank h3{margin:0 0 12px}
.bank-data{white-space:pre-line;overflow-wrap:anywhere}
.bank-data-missing{font-weight:600}
@media print{.invoice-print-brand{display:flex}.invoice-bank{break-inside:avoid}.invoice-bottom{break-inside:avoid}}
`],template:`
<div class="page-heading no-print"><div><a routerLink="/faturas">← Faturas</a><h1>Detalhes da fatura</h1></div><div class="print-actions"><button class="button" (click)="imprimir()" [disabled]="!fatura" aria-label="Imprimir fatura ou salvar como PDF">⎙ Imprimir / Salvar como PDF</button><small>Na janela de impressão, escolha “Salvar como PDF”.</small></div></div>
@if(error){<div class="alert" role="alert">{{error}} <button class="text-button" (click)="carregar()">Tentar novamente</button></div>} @if(success){<div class="success no-print" role="status">{{success}}</div>}
@if(loading){<p role="status">Carregando fatura…</p>}
@if(fatura){<div class="invoice-print-brand"><span class="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" focusable="false"><path d="M3 9.5h15a1.5 1.5 0 0 1 1.5 1.5v3h4.2l4.3 4.8V24h-2.7a4 4 0 0 1-7.6 0h-6.8a4 4 0 0 1-7.6 0H2V11a1.5 1.5 0 0 1 1-1.5Zm16.5 7v4h6v-1.1L22.4 16h-2.9ZM7.1 22a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm14.4 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z"/></svg></span><span>CNC TRANSPORTE<small>GESTÃO OPERACIONAL</small></span></div>}
@if(fatura;as f){<article class="invoice"><div class="invoice-heading"><div><p class="eyebrow">GESTÃO DE CARGAS & MATERIAIS</p><h2 class="invoice-title">CNC transportes | Fatura de Cobrança</h2></div><div><strong>Nº {{f.numeroFatura}}</strong><span class="badge" [class.paid]="f.statusPagamento.toUpperCase()==='PAGO'">{{f.statusPagamento}}</span></div></div><div class="invoice-meta"><div><p class="eyebrow">CLIENTE</p><h3>{{f.nomeCliente}}</h3><p>CNPJ: {{f.cnpjCliente}}</p><p>{{f.enderecoCliente}}</p><p>{{f.emailCliente}}</p></div><div><p>Emissão: <b>{{f.dataFatura | date:'dd/MM/yyyy'}}</b></p><p>Vencimento: <b>{{f.dataVencimento | date:'dd/MM/yyyy'}}</b></p>@if(f.dataPagamento){<p>Pagamento: <b>{{f.dataPagamento | date:'dd/MM/yyyy'}}</b></p>}@if(f.cargas?.length){<p>Período: {{periodo}}</p>}</div></div>
<div class="table-wrap"><table><thead><tr><th>Material</th><th>Placa / Ticket</th><th>Data</th><th>UND</th><th class="numeric">QNT</th><th class="numeric">PU</th><th class="numeric">Total</th></tr></thead><tbody>@for(c of f.cargas ?? [];track c.id){<tr><td>{{c.material}}</td><td>{{c.placa}} / {{c.ticket}}</td><td>{{c.dataServico | date:'dd/MM/yyyy'}}</td><td>{{c.unidade}}</td><td class="numeric">{{c.quantidade | number:'1.0-3'}}</td><td class="numeric">{{c.valorUnitario | currency:'BRL'}}</td><td class="numeric">{{c.valorTotal | currency:'BRL'}}</td></tr>} @empty {<tr><td colspan="7">A API não retornou a relação de cargas desta fatura.</td></tr>}</tbody></table></div><div class="invoice-bottom"><section class="invoice-bank"><h3>Dados bancários e PIX</h3>@if(f.agencia?.trim() || f.conta?.trim() || f.pix?.trim()){ @if(f.agencia?.trim()){<p class="bank-data"><b>Agência:</b> {{f.agencia}}</p>} @if(f.conta?.trim()){<p class="bank-data"><b>Conta:</b> {{f.conta}}</p>} @if(f.pix?.trim()){<p class="bank-data"><b>PIX:</b> {{f.pix}}</p>} } @else if(f.dadosBancarios?.trim()){<p class="bank-data">{{f.dadosBancarios}}</p>} @else {<p class="bank-data bank-data-missing">Dados bancários e chave PIX não informados nesta fatura.</p>}</section><dl><div><dt>Subtotal</dt><dd>{{f.subtotal | currency:'BRL'}}</dd></div><div><dt>Desconto</dt><dd>{{f.desconto | currency:'BRL'}}</dd></div><div class="grand-total"><dt>Total</dt><dd>{{f.totalFaturado | currency:'BRL'}}</dd></div></dl></div></article>
@if(f.statusPagamento.toUpperCase()!=='PAGO'){<section class="payment no-print"><div><h2>Registrar pagamento</h2><p>Fatura {{f.numeroFatura}}</p></div><label>Data do pagamento<input type="date" [(ngModel)]="dataPagamento" [max]="hoje"></label><button class="button" (click)="pagar()" [disabled]="saving||!dataPagamento||dataPagamento>hoje">{{saving?'Registrando…':'Confirmar pagamento'}}</button></section>}}
`})
export class InvoiceComponent implements OnInit {
 private api=inject(ApiService);private route=inject(ActivatedRoute);fatura?:Fatura;loading=true;saving=false;error='';success='';hoje=dataLocal();dataPagamento=this.hoje;
 ngOnInit(){this.carregar();}carregar(){const id=Number(this.route.snapshot.paramMap.get('id'));if(!Number.isInteger(id)||id<=0){this.error='Número de fatura inválido.';this.loading=false;return;}this.loading=true;this.error='';this.api.fatura(id).subscribe({next:f=>{this.fatura=f;this.loading=false;},error:e=>{this.loading=false;this.error=mensagemErro(e);}});}
 pagar(){if(!this.fatura||this.saving||!this.dataPagamento||this.dataPagamento>this.hoje)return;this.saving=true;this.error='';this.api.pagar(this.fatura.id,this.dataPagamento).subscribe({next:()=>{this.saving=false;this.success='Pagamento registrado com sucesso.';this.carregar();},error:e=>{this.saving=false;this.error=mensagemErro(e);}});}
 imprimir(){window.print();}get periodo(){const datas=(this.fatura?.cargas??[]).map(c=>c.dataServico.slice(0,10)).sort();const format=(d:string)=>d.split('-').reverse().join('/');return datas.length?`${format(datas[0]??'')} a ${format(datas[datas.length-1]??'')}`:'';}
}
