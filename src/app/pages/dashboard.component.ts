import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, Subscription, timer, exhaustMap } from 'rxjs';
import { ApiService,mensagemErro } from '../core/api.service';
import { Carga,Fatura } from '../core/models';
import { volumesPorUnidade } from '../core/calculations.js';
@Component({standalone:true,imports:[CommonModule,RouterLink],template:`
<div class="page-heading"><div><p class="eyebrow">VISÃO GERAL</p><h1>Painel de operação</h1><p>Cargas e faturamento</p></div><a class="button" routerLink="/cargas">＋ Registrar carga</a></div>
@if(error){<div class="alert" role="alert">{{error}} <button class="text-button" (click)="carregar()">Tentar novamente</button></div>}
@if(loading){<p role="status">Carregando indicadores…</p>} @if(!loading && !error){
<div class="metrics"><article><span>Total faturado</span><strong>{{total | currency:'BRL'}}</strong><small>{{faturas.length}} faturas</small></article><article><span>Pendente de pagamento</span><strong>{{pendente | currency:'BRL'}}</strong><small>{{pendentes}} faturas pendentes</small></article><article><span>Volume transportado</span>@for(v of volumes | keyvalue;track v.key){<strong class="volume">{{v.value | number:'1.0-3'}} <small>{{v.key}}</small></strong>} @empty {<strong>—</strong>}<small>{{cargas.length}} cargas registradas</small></article></div>
<section><div class="section-heading"><h2>Últimas cargas</h2><a routerLink="/cargas">Ver diário →</a></div><div class="table-wrap"><table><thead><tr><th>Material</th><th>Cliente</th><th>Placa</th><th>Data</th><th class="numeric">Total</th></tr></thead><tbody>@for(c of recentes;track c.id){<tr><td><b>{{c.material}}</b></td><td>{{c.nomeCliente}}</td><td>{{c.placa}}</td><td>{{c.dataServico | date:'dd/MM/yyyy'}}</td><td class="numeric">{{c.valorTotal | currency:'BRL'}}</td></tr>} @empty {<tr><td colspan="5" class="empty">Nenhuma carga registrada.</td></tr>}</tbody></table></div></section>}
`})
export class DashboardComponent implements OnInit,OnDestroy {
 private api=inject(ApiService); private refresh?: Subscription; cargas:Carga[]=[]; faturas:Fatura[]=[]; loading=true; error='';
 ngOnInit(){this.carregar(); this.refresh=timer(60000,60000).pipe(exhaustMap(()=>forkJoin({cargas:this.api.cargas(),faturas:this.api.faturas()}))).subscribe({next:r=>{this.cargas=r.cargas;this.faturas=r.faturas;},error:e=>{this.error=mensagemErro(e);}});}
 ngOnDestroy(){this.refresh?.unsubscribe();}
 carregar(){this.loading=true; this.error='';forkJoin({cargas:this.api.cargas(),faturas:this.api.faturas()}).subscribe({next:r=>{this.cargas=r.cargas;this.faturas=r.faturas;this.loading=false;},error:e=>{this.error=mensagemErro(e);this.loading=false;}});}
 get total(){return this.faturas.reduce((s,f)=>s+Number(f.totalFaturado),0);}
 get pendente(){return this.faturas.filter(f=>f.statusPagamento?.toUpperCase()!=='PAGO').reduce((s,f)=>s+Number(f.totalFaturado),0);}
 get pendentes(){return this.faturas.filter(f=>f.statusPagamento?.toUpperCase()!=='PAGO').length;}
 get volumes():Record<string,number>{return volumesPorUnidade(this.cargas);}
 get recentes(){return [...this.cargas].sort((a,b)=>b.dataServico.localeCompare(a.dataServico)).slice(0,6);}
}
