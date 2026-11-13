import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { pagamentoRequest } from './contracts.js';
import { environment } from '../../environments/environment';
import { Carga, CargaRequest, Fatura, FaturaRequest } from './models';

type ListaPayload<T> = T[] | { content?: T[]; data?: T[]; items?: T[] } | null | undefined;

function lista<T>(res: ListaPayload<T>): T[] {
  if (Array.isArray(res)) return res;
  if (!res) return [];
  const payload = res.content ?? res.data ?? res.items;
  return Array.isArray(payload) ? payload : [];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  cargas() { return this.http.get<ListaPayload<Carga>>(`${this.base}/cargas`).pipe(map(lista<Carga>)); }
  cargasDisponiveis() { return this.http.get<ListaPayload<Carga>>(`${this.base}/cargas/disponiveis`).pipe(map(lista<Carga>)); }
  deletarCarga(id: number) { return this.http.delete<void>(`${this.base}/cargas/${id}`); }
  criarCarga(body: CargaRequest) { return this.http.post<Carga>(`${this.base}/cargas`, body); }
  faturas() { return this.http.get<ListaPayload<Fatura>>(`${this.base}/faturas`).pipe(map(lista<Fatura>)); }
  fatura(id: number) { return this.http.get<Fatura>(`${this.base}/faturas/${id}`); }
  criarFatura(body: FaturaRequest) { return this.http.post<Fatura>(`${this.base}/faturas`, body); }
  pagar(id: number, dataPagamento: string) {
    const req = pagamentoRequest(this.base, id, dataPagamento);
    return this.http.put<Fatura>(req.url, req.body, { params: req.params });
  }
}

export function mensagemErro(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Não foi possível concluir a operação.';
  if (error.status === 0) return 'API indisponível. Confira se o Java está rodando e se o endereço configurado está correto.';
  if (error.status === 401 || error.status === 403) return 'A API exige autorização. Confira o contrato de acesso do seu backend.';
  const endpoint = error.url?.split('?')[0];
  if (error.status === 404) return `Endpoint não encontrado${endpoint ? `: ${endpoint}` : ''}. Confira o mapeamento da rota no backend.`;
  if (error.status === 405) return `O backend não aceita o método HTTP solicitado${endpoint ? ` em ${endpoint}` : ' nesta rota'}. Confira o método e a rota no controller Java.`;
  if (error.status >= 500) return `Erro interno do backend (${error.status}). Confira os logs do Java e a configuração do banco de dados.`;
  if (error.error && typeof error.error === 'object' && 'message' in error.error && typeof (error.error as { message?: unknown }).message === 'string') {
    return (error.error as { message: string }).message;
  }
  if (typeof error.error === 'string' && error.error.trim()) return error.error;
  return `A API recusou a operação (${error.status}). Confira os dados e tente novamente.`;
}
