import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { FinanceiroPage } from './pages/financeiro';
import { ContasPagarPage } from './pages/financeiro/ContasPagarPage';
import { ContaPagarFormPage } from './pages/financeiro/ContaPagarFormPage';
import { ContasReceberPage } from './pages/financeiro/ContasReceberPage';
import { ContaReceberFormPage } from './pages/financeiro/ContaReceberFormPage';
import { ComercialPage } from './pages/comercial';
import { PedidosVendaPage } from './pages/comercial/PedidoVenda/PedidosVendaPage';
import { PedidoVendaFormPage } from './pages/comercial/PedidoVenda/PedidoVendaFormPage';
import { OrcamentosPage } from './pages/comercial/Orcamento/OrcamentosPage';
import { OrcamentoFormPage } from './pages/comercial/Orcamento/OrcamentoFormPage';
import { ClientesFormPage } from './pages/comercial/Clientes/ClientesFormPage';
import { ClientesPage } from './pages/comercial/Clientes/ClientesPage';
import { CatalogoProdutosPage } from './pages/comercial/CatalogoProdutosPage';
import { PessoasPage } from './pages/cadastros/PessoasPage';
import { PessoaFormPage } from './pages/cadastros/PessoaForm';
import { ProdutosPage } from './pages/cadastros/ProdutosPage';
import { ProdutoFormPage } from './pages/cadastros/ProdutoForm';
import { CategoriasPage } from './pages/cadastros/CategoriasPage';
import { CategoriaFormPage } from './pages/cadastros/CategoriaForm';
import { FasesPage } from './pages/cadastros/FasesPage';
import { FaseFormPage } from './pages/cadastros/FaseForm';
import { AlmoxarifadosPage } from './pages/cadastros/AlmoxarifadosPage';
import { AlmoxarifadoFormPage } from './pages/cadastros/AlmoxarifadoForm';
import { DepositosPage } from './pages/cadastros/DepositosPage';
import { DepositoFormPage } from './pages/cadastros/DepositoForm';
import { UnidadesMedidaPage } from './pages/cadastros/UnidadesMedidaPage';
import { UnidadeMedidaFormPage } from './pages/cadastros/UnidadeMedidaForm';
import { FormasPagamentoPage } from './pages/cadastros/FormasPagamentoPage';
import { FormaPagamentoFormPage } from './pages/cadastros/FormaPagamentoForm';
import { FinalidadesPage } from './pages/cadastros/FinalidadesPage';
import { FinalidadeFormPage } from './pages/cadastros/FinalidadeFormPage';
import { CondicoesPagamentoPage } from './pages/cadastros/CondicoesPagamentoPage';
import { CondicaoPagamentoFormPage } from './pages/cadastros/CondicaoPagamentoFormPage';
import { InventariosPage } from './pages/estoque/InventariosPage';
import { InventarioFormPage } from './pages/estoque/InventarioFormPage';
import { MovimentacoesPage } from './pages/estoque/MovimentacoesPage';
import { MovimentacaoFormPage } from './pages/estoque/MovimentacaoFormPage';
import { OrdensDeProducaoPage } from './pages/producao/OrdensDeProducaoPage';
import { OrdemDeProducaoFormPage } from './pages/producao/OrdemDeProducaoFormPage';
import { FichaTecnicasPage } from './pages/engenharia/FichaTecnicasPage';
import { ProdutosSemFichaPage } from './pages/producao/ProdutosSemFichaPage';
import { FichaTecnicaPainelPage } from './pages/engenharia/FichaTecnicaPainelPage';
import { FichaConsumoPage } from './pages/producao/FichaConsumoPage';
import { SequenciaOperacionalPage } from './pages/producao/SequenciaOperacionalPage';
import { KanbanPage } from './pages/producao/KanbanPage';
import { ConsultaAcaoPage } from './pages/ConsultaAcaoPage';
import { LotesPage } from './pages/producao/LotesPage';
import { LoteFormPage } from './pages/producao/LoteFormPage';
import { RoteiroProducaoPage } from './pages/producao/RoteiroProducaoPage';
import { RoteiroProducaoFormPage } from './pages/producao/RoteiroProducaoFormPage';
import { RelatorioEstoquePage } from './pages/relatorios/RelatorioEstoquePage';
import { RelatorioFinanceiroPage } from './pages/relatorios/RelatorioFinanceiroPage';
import { RelatorioVendasPage } from './pages/relatorios/RelatorioVendasPage';
import { CarteirasPage } from './pages/financeiro/CarteirasPage';
import { CarteiraFormPage } from './pages/financeiro/CarteiraFormPage';
import { CarteiraExtratoPage } from './pages/financeiro/CarteiraExtratoPage';
import { BaixaContaPagarPage } from './pages/financeiro/BaixaContaPagarPage';
import { BaixaContaReceberPage } from './pages/financeiro/BaixaContaReceberPage';
import { ContaPagarComprovantePage } from './pages/financeiro/ContaPagarComprovantePage';
import { FluxoCaixaPage } from './pages/financeiro/FluxoCaixaPage';
import { LogsPage } from './pages/configuracoes/LogsPage';
import { PerfisPage } from './pages/configuracoes/PerfisPage';
import { PerfilFormPage } from './pages/configuracoes/PerfilForm';
import { UsuariosPage } from './pages/configuracoes/UsuariosPage';
import { UsuarioFormPage } from './pages/configuracoes/UsuarioForm';
import { TiposDeOrdemPage } from './pages/cadastros/TiposDeOrdemPage';
import { TiposDeOrdemFormPage } from './pages/cadastros/TiposDeOrdemForm';
import { AppLayout } from './components/layout/AppLayout';
import { getAcessos } from './lib/permissions';

function AccessDenied({ to }: { to: string }) {
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    showToast('Você não tem permissão para acessar esta página.', 'error');
    navigate(to, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function PrivateRoute({ perm, children }: { perm?: string; children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" replace />;
  if (perm) {
    const { acessos, isAdmin } = getAcessos();
    if (!isAdmin && !acessos.includes(perm)) {
      return <AccessDenied to={perm === 'Dashboard.Visualizar' ? '/' : '/dashboard'} />;
    }
  }
  return <>{children}</>;
}

const App = () => (
  <ToastProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute perm="Dashboard.Visualizar">
            <AppLayout><DashboardPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/financeiro"
        element={
          <PrivateRoute>
            <AppLayout><FinanceiroPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route path="/financeiro/contas-pagar" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContasPagarPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-pagar/novo" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaPagarFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-pagar/:id/editar" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaPagarFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-pagar/:id/baixar" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><BaixaContaPagarPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-pagar/:contaId/comprovante/:parcelaId" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaPagarComprovantePage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-pagar/:id" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaPagarFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/financeiro/contas-receber" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContasReceberPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-receber/novo" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaReceberFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-receber/:id/editar" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaReceberFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-receber/:id/baixar" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><BaixaContaReceberPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/contas-receber/:id" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><ContaReceberFormPage /></AppLayout></PrivateRoute>} />

      <Route
        path="/comercial"
        element={
          <PrivateRoute>
            <AppLayout><ComercialPage /></AppLayout>
          </PrivateRoute>
        }
      />

      <Route path="/comercial/orcamentos" element={<PrivateRoute perm="Orcamentos.Visualizar"><AppLayout><OrcamentosPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/orcamentos/novo" element={<PrivateRoute perm="Orcamentos.Criar"><AppLayout><OrcamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/orcamentos/:id/editar" element={<PrivateRoute perm="Orcamentos.Editar"><AppLayout><OrcamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/orcamentos/:id" element={<PrivateRoute perm="Orcamentos.Visualizar"><AppLayout><OrcamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos" element={<PrivateRoute perm="PedidosVenda.Visualizar"><AppLayout><PedidosVendaPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos/novo" element={<PrivateRoute perm="PedidosVenda.Criar"><AppLayout><PedidoVendaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos/:id/editar" element={<PrivateRoute perm="PedidosVenda.Editar"><AppLayout><PedidoVendaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos/:id" element={<PrivateRoute perm="PedidosVenda.Visualizar"><AppLayout><PedidoVendaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/catalogo/produtos" element={<PrivateRoute perm="Produtos.Visualizar"><AppLayout><CatalogoProdutosPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes" element={<PrivateRoute perm="Fornecedores.Visualizar"><AppLayout><ClientesPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes/novo" element={<PrivateRoute perm="Fornecedores.Criar"><AppLayout><ClientesFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes/:tipo/:id/editar" element={<PrivateRoute perm="Fornecedores.Editar"><AppLayout><ClientesFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes/:tipo/:id" element={<PrivateRoute perm="Fornecedores.Visualizar"><AppLayout><ClientesFormPage /></AppLayout></PrivateRoute>} />

      <Route
        path="/cadastros/pessoas"
        element={
          <PrivateRoute perm="Fornecedores.Visualizar">
            <AppLayout><PessoasPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/pessoas/novo"
        element={
          <PrivateRoute perm="Fornecedores.Criar">
            <AppLayout><PessoaFormPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/pessoas/:tipo/:id/editar"
        element={
          <PrivateRoute perm="Fornecedores.Editar">
            <AppLayout><PessoaFormPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/pessoas/:tipo/:id"
        element={
          <PrivateRoute perm="Fornecedores.Visualizar">
            <AppLayout><PessoaFormPage /></AppLayout>
          </PrivateRoute>
        }
      />

      <Route path="/cadastros/produtos" element={<PrivateRoute perm="Produtos.Visualizar"><AppLayout><ProdutosPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/produtos/novo" element={<PrivateRoute perm="Produtos.Criar"><AppLayout><ProdutoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/produtos/:id/editar" element={<PrivateRoute perm="Produtos.Editar"><AppLayout><ProdutoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/produtos/:id" element={<PrivateRoute perm="Produtos.Visualizar"><AppLayout><ProdutoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/categorias" element={<PrivateRoute perm="Categorias.Visualizar"><AppLayout><CategoriasPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/categorias/novo" element={<PrivateRoute perm="Categorias.Criar"><AppLayout><CategoriaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/categorias/:id/editar" element={<PrivateRoute perm="Categorias.Editar"><AppLayout><CategoriaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/categorias/:id" element={<PrivateRoute perm="Categorias.Visualizar"><AppLayout><CategoriaFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/fases" element={<PrivateRoute perm="FasesProducao.Visualizar"><AppLayout><FasesPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/fases/novo" element={<PrivateRoute perm="FasesProducao.Criar"><AppLayout><FaseFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/fases/:id/editar" element={<PrivateRoute perm="FasesProducao.Editar"><AppLayout><FaseFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/fases/:id" element={<PrivateRoute perm="FasesProducao.Visualizar"><AppLayout><FaseFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/almoxarifados" element={<PrivateRoute perm="Almoxarifados.Visualizar"><AppLayout><AlmoxarifadosPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/almoxarifados/novo" element={<PrivateRoute perm="Almoxarifados.Criar"><AppLayout><AlmoxarifadoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/almoxarifados/:id/editar" element={<PrivateRoute perm="Almoxarifados.Editar"><AppLayout><AlmoxarifadoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/almoxarifados/:id" element={<PrivateRoute perm="Almoxarifados.Visualizar"><AppLayout><AlmoxarifadoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/depositos" element={<PrivateRoute perm="Depositos.Visualizar"><AppLayout><DepositosPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/depositos/novo" element={<PrivateRoute perm="Depositos.Criar"><AppLayout><DepositoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/depositos/:id/editar" element={<PrivateRoute perm="Depositos.Editar"><AppLayout><DepositoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/depositos/:id" element={<PrivateRoute perm="Depositos.Visualizar"><AppLayout><DepositoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/unidades" element={<PrivateRoute perm="UnidadesMedida.Visualizar"><AppLayout><UnidadesMedidaPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/unidades/novo" element={<PrivateRoute perm="UnidadesMedida.Criar"><AppLayout><UnidadeMedidaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/unidades/:id/editar" element={<PrivateRoute perm="UnidadesMedida.Editar"><AppLayout><UnidadeMedidaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/unidades/:id" element={<PrivateRoute perm="UnidadesMedida.Visualizar"><AppLayout><UnidadeMedidaFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/formas-pagamento" element={<PrivateRoute perm="FormasPagamento.Visualizar"><AppLayout><FormasPagamentoPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/formas-pagamento/novo" element={<PrivateRoute perm="FormasPagamento.Criar"><AppLayout><FormaPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/formas-pagamento/:id/editar" element={<PrivateRoute perm="FormasPagamento.Editar"><AppLayout><FormaPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/formas-pagamento/:id" element={<PrivateRoute perm="FormasPagamento.Visualizar"><AppLayout><FormaPagamentoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/finalidades" element={<PrivateRoute perm="Finalidades.Visualizar"><AppLayout><FinalidadesPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/finalidades/novo" element={<PrivateRoute perm="Finalidades.Criar"><AppLayout><FinalidadeFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/finalidades/:id/editar" element={<PrivateRoute perm="Finalidades.Editar"><AppLayout><FinalidadeFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/finalidades/:id" element={<PrivateRoute perm="Finalidades.Visualizar"><AppLayout><FinalidadeFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/condicoes-pagamento" element={<PrivateRoute perm="CondicoesPagamento.Visualizar"><AppLayout><CondicoesPagamentoPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/condicoes-pagamento/novo" element={<PrivateRoute perm="CondicoesPagamento.Criar"><AppLayout><CondicaoPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/condicoes-pagamento/:id/editar" element={<PrivateRoute perm="CondicoesPagamento.Editar"><AppLayout><CondicaoPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/condicoes-pagamento/:id" element={<PrivateRoute perm="CondicoesPagamento.Visualizar"><AppLayout><CondicaoPagamentoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/tipos-ordem" element={<PrivateRoute perm="TiposOrdem.Visualizar"><AppLayout><TiposDeOrdemPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/tipos-ordem/novo" element={<PrivateRoute perm="TiposOrdem.Criar"><AppLayout><TiposDeOrdemFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/tipos-ordem/:id/editar" element={<PrivateRoute perm="TiposOrdem.Editar"><AppLayout><TiposDeOrdemFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/tipos-ordem/:id" element={<PrivateRoute perm="TiposOrdem.Visualizar"><AppLayout><TiposDeOrdemFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/estoque/inventario" element={<PrivateRoute perm="Inventarios.Visualizar"><AppLayout><InventariosPage /></AppLayout></PrivateRoute>} />
      <Route path="/estoque/inventario/novo" element={<PrivateRoute perm="Inventarios.Criar"><AppLayout><InventarioFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/estoque/inventario/:id/editar" element={<PrivateRoute perm="Inventarios.Editar"><AppLayout><InventarioFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/estoque/inventario/:id" element={<PrivateRoute perm="Inventarios.Visualizar"><AppLayout><InventarioFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/estoque/movimentacoes" element={<PrivateRoute perm="Movimentacoes.Visualizar"><AppLayout><MovimentacoesPage /></AppLayout></PrivateRoute>} />
      <Route path="/estoque/movimentacoes/novo" element={<PrivateRoute perm="Movimentacoes.Criar"><AppLayout><MovimentacaoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/producao/ordens" element={<PrivateRoute perm="OrdensProducao.Visualizar"><AppLayout><OrdensDeProducaoPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/ordens/novo" element={<PrivateRoute perm="OrdensProducao.Criar"><AppLayout><OrdemDeProducaoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/ordens/:id/editar" element={<PrivateRoute perm="OrdensProducao.Editar"><AppLayout><OrdemDeProducaoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/ordens/:id" element={<PrivateRoute perm="OrdensProducao.Visualizar"><AppLayout><OrdemDeProducaoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/kanban" element={<PrivateRoute perm="OrdensProducao.Visualizar"><AppLayout><KanbanPage /></AppLayout></PrivateRoute>} />
      <Route path="/scan" element={<PrivateRoute><AppLayout><ConsultaAcaoPage /></AppLayout></PrivateRoute>} />
      <Route path="/lotes" element={<PrivateRoute perm="Lotes.Visualizar"><AppLayout><LotesPage /></AppLayout></PrivateRoute>} />
      <Route path="/lotes/novo" element={<PrivateRoute perm="Lotes.Criar"><AppLayout><LoteFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/lotes/:id/editar" element={<PrivateRoute perm="Lotes.Editar"><AppLayout><LoteFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/lotes/:id" element={<PrivateRoute perm="Lotes.Visualizar"><AppLayout><LoteFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/roteiros" element={<PrivateRoute perm="Roteiros.Visualizar"><AppLayout><RoteiroProducaoPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/roteiros/novo" element={<PrivateRoute perm="Roteiros.Criar"><AppLayout><RoteiroProducaoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/roteiros/:id/editar" element={<PrivateRoute perm="Roteiros.Editar"><AppLayout><RoteiroProducaoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/producao/roteiros/:id" element={<PrivateRoute perm="Roteiros.Visualizar"><AppLayout><RoteiroProducaoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/engenharia/fichas-tecnicas" element={<PrivateRoute perm="FichasTecnicas.Visualizar"><AppLayout><FichaTecnicasPage /></AppLayout></PrivateRoute>} />
      <Route path="/engenharia/fichas-tecnicas/novo" element={<PrivateRoute perm="FichasTecnicas.Criar"><AppLayout><ProdutosSemFichaPage /></AppLayout></PrivateRoute>} />
      <Route path="/engenharia/fichas-tecnicas/:id" element={<PrivateRoute perm="FichasTecnicas.Visualizar"><AppLayout><FichaTecnicaPainelPage /></AppLayout></PrivateRoute>} />
      <Route path="/engenharia/fichas-tecnicas/:id/consumo" element={<PrivateRoute perm="FichasTecnicas.Visualizar"><AppLayout><FichaConsumoPage /></AppLayout></PrivateRoute>} />
      <Route path="/engenharia/fichas-tecnicas/:id/sequencia-operacional" element={<PrivateRoute perm="FichasTecnicas.Visualizar"><AppLayout><SequenciaOperacionalPage /></AppLayout></PrivateRoute>} />

      <Route path="/relatorios/estoque" element={<PrivateRoute perm="Relatorios.Visualizar"><AppLayout><RelatorioEstoquePage /></AppLayout></PrivateRoute>} />
      <Route path="/relatorios/financeiro" element={<PrivateRoute perm="Relatorios.Visualizar"><AppLayout><RelatorioFinanceiroPage /></AppLayout></PrivateRoute>} />
      <Route path="/relatorios/vendas" element={<PrivateRoute perm="Relatorios.Visualizar"><AppLayout><RelatorioVendasPage /></AppLayout></PrivateRoute>} />

      <Route path="/financeiro/fluxo-caixa" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><FluxoCaixaPage /></AppLayout></PrivateRoute>} />

      <Route path="/financeiro/carteira" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><CarteirasPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/carteira/nova" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><CarteiraFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/carteira/:id/editar" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><CarteiraFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/carteira/:id/extrato" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><CarteiraExtratoPage /></AppLayout></PrivateRoute>} />
      <Route path="/financeiro/carteira/:id" element={<PrivateRoute perm="Financeiro.Visualizar"><AppLayout><CarteiraFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/configuracoes/Logs" element={<PrivateRoute perm="Logs.Visualizar"><AppLayout><LogsPage /></AppLayout></PrivateRoute>} />

      <Route path="/configuracoes/perfis" element={<PrivateRoute perm="Perfis.Visualizar"><AppLayout><PerfisPage /></AppLayout></PrivateRoute>} />
      <Route path="/configuracoes/perfis/novo" element={<PrivateRoute perm="Perfis.Criar"><AppLayout><PerfilFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/configuracoes/perfis/:id/editar" element={<PrivateRoute perm="Perfis.Editar"><AppLayout><PerfilFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/configuracoes/perfis/:id" element={<PrivateRoute perm="Perfis.Visualizar"><AppLayout><PerfilFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/configuracoes/usuarios" element={<PrivateRoute perm="Usuarios.Visualizar"><AppLayout><UsuariosPage /></AppLayout></PrivateRoute>} />
      <Route path="/configuracoes/usuarios/novo" element={<PrivateRoute perm="Usuarios.Criar"><AppLayout><UsuarioFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/configuracoes/usuarios/:id/editar" element={<PrivateRoute perm="Usuarios.Editar"><AppLayout><UsuarioFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/configuracoes/usuarios/:id" element={<PrivateRoute perm="Usuarios.Visualizar"><AppLayout><UsuarioFormPage /></AppLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
  </ToastProvider>
);

export default App;
