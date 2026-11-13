export const MATERIALS = ['Rachão', 'Rachinha', 'Rachão de Face', 'Rachão de rebolo', 'Areia', 'Brita', 'Pó', 'Barro'];
export function totalCarga(quantidade, valorUnitario) { return Math.round((Number(quantidade) * Number(valorUnitario) + Number.EPSILON) * 100) / 100; }
export function totalFatura(subtotal, desconto) { return Math.round((Number(subtotal) - Number(desconto) + Number.EPSILON) * 100) / 100; }
export function volumesPorUnidade(cargas) { return cargas.reduce((totais, c) => ({...totais, [c.unidade]: (totais[c.unidade] || 0) + Number(c.quantidade)}), {}); }
export function dataLocal() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
