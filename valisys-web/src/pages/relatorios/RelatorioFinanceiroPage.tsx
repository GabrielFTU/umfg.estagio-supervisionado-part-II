import { ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react';
import { ReportPage, useOptions, type ReportDef, type Opt } from './reportEngine';

const STATUS_CONTA: Opt[] = [
  { id: 'Pendente',         nome: 'Pendente' },
  { id: 'ParcialmentePago', nome: 'Parcialmente Pago' },
  { id: 'Pago',             nome: 'Pago' },
  { id: 'Vencido',          nome: 'Vencido' },
  { id: 'Cancelado',        nome: 'Cancelado' },
];

export function RelatorioFinanceiroPage() {
  const [fornecedores] = useOptions('/api/Pessoas?papel=Fornecedor', (p: any) => ({ id: p.id, nome: p.nome }));
  const [clientes]     = useOptions('/api/Pessoas?papel=Cliente',    (p: any) => ({ id: p.id, nome: p.nome }));

  const reports: ReportDef[] = [
    {
      id: 'contas-pagar',
      label: 'Contas a Pagar',
      desc: 'Títulos a pagar por período',
      icon: ArrowUpCircle,
      endpoint: '/api/relatorios/financeiro/contas-pagar',
      filters: [
        { key: 'status',       label: 'Status',      type: 'select', options: STATUS_CONTA },
        { key: 'fornecedorId', label: 'Fornecedor',   type: 'select', options: fornecedores },
        { key: 'dataInicio',   label: 'Vencimento de', type: 'date' },
        { key: 'dataFim',      label: 'Vencimento até', type: 'date' },
      ],
      columns: [
        { key: 'codigo',         label: 'Código' },
        { key: 'descricao',      label: 'Descrição' },
        { key: 'fornecedorNome', label: 'Fornecedor' },
        { key: 'dataVencimento', label: 'Vencimento', format: 'date' },
        { key: 'valorTotal',     label: 'Valor Total', align: 'right', format: 'currency' },
        { key: 'valorPago',      label: 'Pago',        align: 'right', format: 'currency' },
        { key: 'valorAberto',    label: 'Aberto',      align: 'right', format: 'currency' },
        { key: 'status',         label: 'Status', align: 'center', format: 'badge' },
      ],
    },
    {
      id: 'contas-receber',
      label: 'Contas a Receber',
      desc: 'Títulos a receber por período',
      icon: ArrowDownCircle,
      endpoint: '/api/relatorios/financeiro/contas-receber',
      filters: [
        { key: 'status',     label: 'Status',        type: 'select', options: STATUS_CONTA },
        { key: 'clienteId',  label: 'Cliente',        type: 'select', options: clientes },
        { key: 'dataInicio', label: 'Vencimento de',  type: 'date' },
        { key: 'dataFim',    label: 'Vencimento até', type: 'date' },
      ],
      columns: [
        { key: 'codigo',         label: 'Código' },
        { key: 'descricao',      label: 'Descrição' },
        { key: 'clienteNome',    label: 'Cliente' },
        { key: 'dataVencimento', label: 'Vencimento', format: 'date' },
        { key: 'valorTotal',     label: 'Valor Total', align: 'right', format: 'currency' },
        { key: 'valorPago',      label: 'Recebido',    align: 'right', format: 'currency' },
        { key: 'valorAberto',    label: 'Aberto',      align: 'right', format: 'currency' },
        { key: 'status',         label: 'Status', align: 'center', format: 'badge' },
      ],
    },
    {
      id: 'fluxo-caixa',
      label: 'Fluxo de Caixa',
      desc: 'Resumo mensal a pagar x a receber',
      icon: Scale,
      endpoint: '/api/relatorios/financeiro/fluxo-caixa',
      paginate: false,
      filters: [
        { key: 'dataInicio', label: 'De',  type: 'date' },
        { key: 'dataFim',    label: 'Até', type: 'date' },
      ],
      columns: [
        { key: 'periodo',       label: 'Período' },
        { key: 'totalAPagar',   label: 'Total a Pagar',   align: 'right', format: 'currency' },
        { key: 'totalAReceber', label: 'Total a Receber', align: 'right', format: 'currency' },
        { key: 'saldo',         label: 'Saldo',           align: 'right', format: 'currency' },
      ],
    },
  ];

  return <ReportPage breadcrumbLabel="Financeiro" slug="financeiro" reports={reports} />;
}
