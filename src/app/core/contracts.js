export function pagamentoRequest(base, id, dataPagamento) {
 return {method:'PUT',url:`${base}/faturas/${id}/pagar`,body:{},params:{dataPagamento}};
}
