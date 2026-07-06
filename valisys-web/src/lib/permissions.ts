// Espelha Valisys_Production/Models/Common/Permissions.cs — mantenha sincronizado ao criar novas permissões no backend.

export interface PermissionAction {
  value: string;
  label: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  actions: PermissionAction[];
}

export interface PermissionSection {
  label: string;
  groups: PermissionGroup[];
}

const acoes = {
  ver: (mod: string): PermissionAction => ({ value: `${mod}.Visualizar`, label: 'Visualizar' }),
  criar: (mod: string): PermissionAction => ({ value: `${mod}.Criar`, label: 'Criar' }),
  editar: (mod: string): PermissionAction => ({ value: `${mod}.Editar`, label: 'Editar' }),
  inativar: (mod: string): PermissionAction => ({ value: `${mod}.Inativar`, label: 'Inativar' }),
  excluir: (mod: string): PermissionAction => ({ value: `${mod}.Excluir`, label: 'Excluir' }),
  cancelar: (mod: string): PermissionAction => ({ value: `${mod}.Cancelar`, label: 'Cancelar' }),
};

export const PERMISSION_SECTIONS: PermissionSection[] = [
  {
    label: 'Geral',
    groups: [
      { key: 'Dashboard', label: 'Dashboard', actions: [acoes.ver('Dashboard')] },
      { key: 'Relatorios', label: 'Relatórios', actions: [acoes.ver('Relatorios')] },
      { key: 'Logs', label: 'Logs do Sistema', actions: [acoes.ver('Logs')] },
    ],
  },
  {
    label: 'Cadastros Básicos',
    groups: [
      { key: 'Almoxarifados', label: 'Almoxarifados', actions: [acoes.ver('Almoxarifados'), acoes.criar('Almoxarifados'), acoes.editar('Almoxarifados'), acoes.inativar('Almoxarifados')] },
      { key: 'Categorias', label: 'Categorias de Produto', actions: [acoes.ver('Categorias'), acoes.criar('Categorias'), acoes.editar('Categorias'), acoes.inativar('Categorias')] },
      { key: 'CondicoesPagamento', label: 'Condições de Pagamento', actions: [acoes.ver('CondicoesPagamento'), acoes.criar('CondicoesPagamento'), acoes.editar('CondicoesPagamento'), acoes.inativar('CondicoesPagamento')] },
      { key: 'Depositos', label: 'Depósitos', actions: [acoes.ver('Depositos'), acoes.criar('Depositos'), acoes.editar('Depositos'), acoes.excluir('Depositos')] },
      { key: 'FasesProducao', label: 'Fases de Produção', actions: [acoes.ver('FasesProducao'), acoes.criar('FasesProducao'), acoes.editar('FasesProducao'), acoes.excluir('FasesProducao')] },
      { key: 'Finalidades', label: 'Finalidades de Pedido', actions: [acoes.ver('Finalidades'), acoes.criar('Finalidades'), acoes.editar('Finalidades'), acoes.inativar('Finalidades')] },
      { key: 'FormasPagamento', label: 'Formas de Pagamento', actions: [acoes.ver('FormasPagamento'), acoes.criar('FormasPagamento'), acoes.editar('FormasPagamento'), acoes.inativar('FormasPagamento')] },
      { key: 'TiposOrdem', label: 'Tipos de Ordem', actions: [acoes.ver('TiposOrdem'), acoes.criar('TiposOrdem'), acoes.editar('TiposOrdem'), acoes.excluir('TiposOrdem')] },
      { key: 'UnidadesMedida', label: 'Unidades de Medida', actions: [acoes.ver('UnidadesMedida'), acoes.criar('UnidadesMedida'), acoes.editar('UnidadesMedida'), acoes.excluir('UnidadesMedida')] },
    ],
  },
  {
    label: 'Cadastros Avançados',
    groups: [
      { key: 'Fornecedores', label: 'Pessoas / Fornecedores', actions: [acoes.ver('Fornecedores'), acoes.criar('Fornecedores'), acoes.editar('Fornecedores'), acoes.inativar('Fornecedores')] },
      { key: 'Produtos', label: 'Produtos', actions: [acoes.ver('Produtos'), acoes.criar('Produtos'), acoes.editar('Produtos'), acoes.inativar('Produtos')] },
    ],
  },
  {
    label: 'Comercial',
    groups: [
      {
        key: 'Orcamentos', label: 'Orçamentos', actions: [
          acoes.ver('Orcamentos'), acoes.criar('Orcamentos'), acoes.editar('Orcamentos'),
          { value: 'Orcamentos.Enviar', label: 'Enviar' },
          { value: 'Orcamentos.Aprovar', label: 'Aprovar' },
          acoes.cancelar('Orcamentos'),
          { value: 'Orcamentos.ConverterEmPedido', label: 'Converter em Pedido' },
        ],
      },
      {
        key: 'PedidosVenda', label: 'Pedidos de Venda', actions: [
          acoes.ver('PedidosVenda'), acoes.criar('PedidosVenda'), acoes.editar('PedidosVenda'),
          { value: 'PedidosVenda.Confirmar', label: 'Confirmar' },
          acoes.cancelar('PedidosVenda'),
          { value: 'PedidosVenda.Concluir', label: 'Concluir' },
        ],
      },
    ],
  },
  {
    label: 'Estoque',
    groups: [
      { key: 'Estoque', label: 'Inventário', actions: [acoes.ver('Estoque')] },
      { key: 'Movimentacoes', label: 'Movimentações', actions: [acoes.ver('Movimentacoes'), acoes.criar('Movimentacoes'), acoes.editar('Movimentacoes'), acoes.excluir('Movimentacoes')] },
    ],
  },
  {
    label: 'Financeiro',
    groups: [
      { key: 'Financeiro', label: 'Contas a Pagar / Receber / Carteira', actions: [acoes.ver('Financeiro')] },
    ],
  },
  {
    label: 'Engenharia',
    groups: [
      { key: 'FichasTecnicas', label: 'Fichas Técnicas', actions: [acoes.ver('FichasTecnicas'), acoes.criar('FichasTecnicas'), acoes.editar('FichasTecnicas'), acoes.inativar('FichasTecnicas')] },
      { key: 'Roteiros', label: 'Roteiros de Produção', actions: [acoes.ver('Roteiros'), acoes.criar('Roteiros'), acoes.editar('Roteiros'), acoes.excluir('Roteiros')] },
    ],
  },
  {
    label: 'Produção',
    groups: [
      { key: 'Lotes', label: 'Lotes', actions: [acoes.ver('Lotes'), acoes.criar('Lotes'), acoes.editar('Lotes'), acoes.cancelar('Lotes')] },
      {
        key: 'OrdensProducao', label: 'Ordens de Produção', actions: [
          acoes.ver('OrdensProducao'), acoes.criar('OrdensProducao'), acoes.editar('OrdensProducao'),
          acoes.cancelar('OrdensProducao'),
          { value: 'OrdensProducao.Finalizar', label: 'Finalizar' },
          { value: 'OrdensProducao.AvancarFase', label: 'Avançar Fase' },
          { value: 'OrdensProducao.Estornar', label: 'Estornar' },
        ],
      },
      { key: 'Solicitacoes', label: 'Solicitações', actions: [acoes.ver('Solicitacoes'), acoes.criar('Solicitacoes'), { value: 'Solicitacoes.Aprovar', label: 'Aprovar' }, acoes.cancelar('Solicitacoes')] },
    ],
  },
  {
    label: 'Sistema',
    groups: [
      { key: 'Usuarios', label: 'Usuários', actions: [acoes.ver('Usuarios'), acoes.criar('Usuarios'), acoes.editar('Usuarios'), acoes.excluir('Usuarios')] },
      { key: 'Perfis', label: 'Perfis de Acesso', actions: [acoes.ver('Perfis'), acoes.criar('Perfis'), acoes.editar('Perfis'), acoes.excluir('Perfis')] },
    ],
  },
];

export const ALL_PERMISSION_VALUES: string[] = PERMISSION_SECTIONS
  .flatMap(s => s.groups)
  .flatMap(g => g.actions)
  .map(a => a.value);

export const TOTAL_PERMISSION_COUNT = ALL_PERMISSION_VALUES.length;

export function getAcessos(): { acessos: string[]; isAdmin: boolean } {
  try {
    const user = JSON.parse(localStorage.getItem('user') ?? '{}');
    return {
      acessos: Array.isArray(user.acessos) ? user.acessos : [],
      isAdmin: user.perfilNome === 'Administrador',
    };
  } catch {
    return { acessos: [], isAdmin: false };
  }
}

export function canAccess(permissions: string[] | undefined, acessos: string[], isAdmin: boolean): boolean {
  if (isAdmin) return true;
  if (!permissions || permissions.length === 0) return true;
  return permissions.some(p => acessos.includes(p));
}
