import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule,FormBuilder,Validators } from '@angular/forms';
import { ApiService,mensagemErro } from '../core/api.service';
import { Carga } from '../core/models';
import { MATERIALS,totalCarga,dataLocal } from '../core/calculations.js';
@Component({standalone:true,imports:[CommonModule,FormsModule,ReactiveFormsModule],styles:[`
.page-actions{display:flex;gap:10px;flex-wrap:wrap}
.print-only{display:none}
@media print{.print-only{display:block}.table-wrap{overflow:visible;border:0}}
`],template:`
<div class="page-heading"><div><p class="eyebrow no-print">OPERAÇÃO</p><h1>Diário de cargas</h1><p class="no-print">Registro e conferência de transportes</p></div><div class="page-actions no-print"><button class="secondary-button" (click)="imprimir()" [disabled]="loading || !!error" aria-label="Imprimir relatório de viagens ou salvar como PDF">⎙ Imprimir relatório / Salvar em PDF</button><button class="button" (click)="aberto=!aberto">{{aberto ? 'Fechar formulário' : '＋ Registrar carga'}}</button></div></div>
@if(error){<div class="alert no-print" role="alert">{{error}} <button class="text-button" (click)="carregar()">Atualizar</button></div>} @if(success){<div class="success no-print" role="status">{{success}}</div>}
@if(aberto){<section class="form-section no-print"><h2>Nova carga</h2><form [formGroup]="form" (ngSubmit)="salvar()"><div class="form-grid">
<label>Material<select formControlName="material">@for(m of materiais;track m){<option [value]="m">{{m}}</option>}</select></label>
<label>Data do serviço<input type="date" formControlName="dataServico"></label>
<label>Placa<input formControlName="placa" placeholder="ABC1D23" maxlength="8"></label><label>Ticket<input formControlName="ticket"></label>
<label>Unidade<select formControlName="unidade"><option value="t">Toneladas (t)</option><option value="m³">Metros cúbicos (m³)</option><option value="un">Unidades (un)</option></select></label>
<label>Quantidade<input type="number" step="0.001" min="0.001" formControlName="quantidade"></label><label>Preço unitário (R$)<input type="number" step="0.01" min="0" formControlName="valorUnitario"></label>
<label>CNPJ do cliente<input formControlName="cnpjCliente" placeholder="00.000.000/0000-00"></label><label class="span-2">Nome do cliente<input formControlName="nomeCliente"></label>
</div><div class="form-footer"><div><span>Total da carga</span><strong>{{total | currency:'BRL'}}</strong></div><button class="button" type="submit" [disabled]="form.invalid || saving">{{saving?'Salvando…':'Salvar carga'}}</button></div><p class="field-note">Preencha todos os campos. Placa: ABC1234 ou ABC1D23. CNPJ: 14 dígitos.</p></form></section>}
<section><div class="filters no-print"><label>De<input type="date" [(ngModel)]="de"></label><label>Até<input type="date" [(ngModel)]="ate"></label><label>Placa<input [(ngModel)]="placa" placeholder="Buscar placa"></label><label>Material<select [(ngModel)]="material"><option value="">Todos os materiais</option>@for(m of materiais;track m){<option [value]="m">{{m}}</option>}</select></label><button class="secondary-button" (click)="limpar()">Limpar</button></div>
@if(loading){<p class="no-print" role="status">Carregando cargas…</p>}
@if(!loading && !error){
<div class="section-heading"><h2>{{filtradas.length}} cargas</h2><label class="sort-label no-print">Ordenar<select [(ngModel)]="ordem"><option value="desc">Mais recentes</option><option value="asc">Mais antigas</option><option value="total">Maior valor</option></select></label></div>
<div class="print-only"><h1>Relatório de viagens</h1></div>
<div class="table-wrap"><table><thead><tr><th>Item</th><th>Material / Cliente</th><th>Placa</th><th>Data</th><th>Ticket</th><th>UND</th><th class="numeric">QNT</th><th class="numeric">PU</th><th class="numeric">Total</th><th class="no-print">Ações</th></tr></thead><tbody>@for(c of filtradas;track c.id;let i=$index){<tr><td>{{i+1}}</td><td><b>{{c.material}}</b><small class="cell-sub">{{c.nomeCliente}}</small></td><td>{{c.placa}}</td><td>{{c.dataServico | date:'dd/MM/yyyy'}}</td><td>{{c.ticket}}</td><td>{{c.unidade}}</td><td class="numeric">{{c.quantidade | number:'1.0-3'}}</td><td class="numeric">{{c.valorUnitario | currency:'BRL'}}</td><td class="numeric">{{c.valorTotal | currency:'BRL'}}</td><td class="no-print"><button class="secondary-button" [disabled]="deleting===c.id" (click)="excluir(c)" [attr.aria-label]="'Excluir carga ' + c.ticket" title="Excluir carga">⌫</button></td></tr>} @empty {<tr><td colspan="10" class="empty">Nenhuma carga encontrada.</td></tr>}</tbody><tfoot><tr><td colspan="8">Total do período filtrado</td><td class="numeric">{{soma | currency:'BRL'}}</td><td class="no-print"></td></tr></tfoot></table></div>}
</section>
`})
export class CargasComponent implements OnInit {
 private api=inject(ApiService); private fb=inject(FormBuilder); materiais=MATERIALS; cargas:Carga[]=[]; aberto=false; saving=false; deleting:number|null=null; loading=true; error='';success=''; de='';ate='';placa='';material='';ordem='desc';
 form=this.fb.nonNullable.group({material:['Rachão',Validators.required],dataServico:[dataLocal(),Validators.required],placa:['',[Validators.required,Validators.pattern(/^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$/)]],ticket:['',Validators.required],unidade:['t',Validators.required],quantidade:[1,[Validators.required,Validators.min(0.001)]],valorUnitario:[0,[Validators.required,Validators.min(0)]],cnpjCliente:['',[Validators.required,Validators.pattern(/^(\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/)]],nomeCliente:['',Validators.required]});
 ngOnInit(){this.carregar();} get total(){const v=this.form.getRawValue();return totalCarga(v.quantidade,v.valorUnitario);}
 carregar(){this.loading=true;this.error='';this.api.cargas().subscribe({next:r=>{this.cargas=r;this.loading=false;},error:e=>{this.error=mensagemErro(e);this.loading=false;}});}
 salvar(){if(this.form.invalid||this.saving)return;this.saving=true;this.error='';this.success='';const v=this.form.getRawValue();this.api.criarCarga({...v,placa:v.placa.toUpperCase().replace('-',''),cnpjCliente:v.cnpjCliente.replace(/\D/g,'')}).subscribe({next:()=>{this.saving=false;this.aberto=false;this.success='Carga registrada com sucesso.';this.form.reset({material:'Rachão',dataServico:dataLocal(),unidade:'t',quantidade:1,valorUnitario:0});this.carregar();},error:e=>{this.error=mensagemErro(e);this.saving=false;}});}
 excluir(c:Carga){if(this.deleting!==null||!window.confirm(`Excluir a carga do ticket ${c.ticket}? Esta ação não pode ser desfeita.`))return;this.deleting=c.id;this.error='';this.api.deletarCarga(c.id).subscribe({next:()=>{this.deleting=null;this.success='Carga excluída com sucesso.';this.carregar();},error:e=>{this.deleting=null;this.error=mensagemErro(e);}});}
 imprimir(){window.print();}
 limpar(){this.de='';this.ate='';this.placa='';this.material='';}
 get filtradas(){return this.cargas.filter(c=>(!this.de||c.dataServico.slice(0,10)>=this.de)&&(!this.ate||c.dataServico.slice(0,10)<=this.ate)&&c.placa.toLowerCase().includes(this.placa.toLowerCase())&&(!this.material||c.material===this.material)).sort((a,b)=>this.ordem==='total'?b.valorTotal-a.valorTotal:this.ordem==='asc'?a.dataServico.localeCompare(b.dataServico):b.dataServico.localeCompare(a.dataServico));}
 get soma(){return this.filtradas.reduce((s,c)=>s+Number(c.valorTotal),0);}
}
