// Rótulos de exibição em pt-BR para valores que ficam armazenados em inglês
// (o status do projeto aceita ambos os idiomas no tipo; os filtros também).
const PROJECT_STATUS_PT: Record<string, string> = {
  'In progress': 'Em andamento',
  'In review': 'Em revisão',
  Planning: 'Planejamento',
  Shipped: 'Entregue',
};

export function statusLabel(status: string): string {
  return PROJECT_STATUS_PT[status] || status;
}
