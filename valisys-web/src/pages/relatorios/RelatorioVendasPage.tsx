import { ShoppingCart, Package, Users } from 'lucide-react';
import { ReportPage, useOptions, type ReportDef, type Opt } from './reportEngine';

const STATUS_PEDIDO: Opt[] = [
  { id: 'Rascunho',   nome: 'Rascunho' },
  { id: 'Confirmado', nome: 'Confirmado' },
  { id: 'Concluido',  nome: 'Concluído' },
  { id: 'Cancelado',  nome: 'Cancelado' },
];

export function RelatorioVendasPage() {
  const [clientes]   = useOptions('/api/Pessoas?papel=Cliente', (p: any) => ({ id: p.id, nome: p.nome }));
  const [categorias] = useOptions('/api/CategoriasProduto',     (c: any) => ({ id: c.id, nome: c.nome }));

  const reports: ReportDef[] = [
    {
      id: 'pedidos',
      label: 'Pedidos de Venda',
      desc: 'Pedidos emitidos por período',
      icon: ShoppingCart,
      endpoint: '/api/relatorios/comercial/pedidos',
      filters: [
        { key: 'status',     label: 'Status',   type: 'select', options: STATUS_PEDIDO },
        { key: 'clienteId',  label: 'Cliente',   type: 'select', options: clientes },
        { key: 'dataInicio', label: 'Emissão de',  type: 'date' },
        { key: 'dataFim',    label: 'Emissão até', type: 'date' },
      ],
      columns: [
        { key: 'codigo',          label: 'Código' },
        { key: 'clienteNome',     label: 'Cliente' },
        { key: 'dataEmissao',     label: 'Emissão', format: 'date' },
        { key: 'quantidadeItens', label: 'Itens', align: 'right', format: 'qty' },
        { key: 'total',           label: 'Total', align: 'right', format: 'currency' },
        { key: 'status',          label: 'Status', align: 'center', format: 'badge' },
      ],
    },
    {
      id: 'vendas-por-produto',
      label: 'Vendas por Produto',
      desc: 'Quantidade e valor vendido por item',
      icon: Package,
      endpoint: '/api/relatorios/comercial/vendas-por-produto',
      filters: [
        { key: 'categoriaId', label: 'Categoria', type: 'select', options: categorias },
        { key: 'dataInicio',  label: 'De',  type: 'date' },
        { key: 'dataFim',     label: 'Até', type: 'date' },
      ],
      columns: [
        { key: 'produtoNome',   label: 'Produto' },
        { key: 'produtoCodigo', label: 'Código' },
        { key: 'categoriaNome', label: 'Categoria' },
        { key: 'quantidade',    label: 'Quantidade', align: 'right', format: 'qty' },
        { key: 'valorTotal',    label: 'Valor Total', align: 'right', format: 'currency' },
      ],
    },
    {
      id: 'vendas-por-cliente',
      label: 'Vendas por Cliente',
      desc: 'Total vendido e ticket médio',
      icon: Users,
      endpoint: '/api/relatorios/comercial/vendas-por-cliente',
      filters: [
        { key: 'dataInicio', label: 'De',  type: 'date' },
        { key: 'dataFim',    label: 'Até', type: 'date' },
      ],
      columns: [
        { key: 'clienteNome',       label: 'Cliente' },
        { key: 'quantidadePedidos', label: 'Pedidos',      align: 'right', format: 'qty' },
        { key: 'valorTotal',        label: 'Valor Total',  align: 'right', format: 'currency' },
        { key: 'ticketMedio',       label: 'Ticket Médio', align: 'right', format: 'currency' },
      ],
    },
  ];

  return <ReportPage breadcrumbLabel="Vendas" slug="vendas" reports={reports} />;
}
