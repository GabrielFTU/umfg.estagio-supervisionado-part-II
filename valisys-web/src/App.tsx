import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { FinanceiroPage } from './pages/financeiro';
import { ComercialPage } from './pages/comercial';
import { PedidosVendaPage } from './pages/comercial/PedidoVenda/PedidosVendaPage';
import { PedidoVendaFormPage } from './pages/comercial/PedidoVenda/PedidoVendaFormPage';
import { ClientesFormPage } from './pages/comercial/Clientes/ClientesFormPage';
import { ClientesPage } from './pages/comercial/Clientes/ClientesPage';
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
import { AppLayout } from './components/layout/AppLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/" replace />;
}

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
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
      <Route
        path="/comercial"
        element={
          <PrivateRoute>
            <AppLayout><ComercialPage /></AppLayout>
          </PrivateRoute>
        }
      />

      <Route path="/comercial/pedidos" element={<PrivateRoute><AppLayout><PedidosVendaPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos/novo" element={<PrivateRoute><AppLayout><PedidoVendaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos/:id/editar" element={<PrivateRoute><AppLayout><PedidoVendaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/pedidos/:id" element={<PrivateRoute><AppLayout><PedidoVendaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes" element={<PrivateRoute><AppLayout><ClientesPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes/novo" element={<PrivateRoute><AppLayout><ClientesFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes/:tipo/:id/editar" element={<PrivateRoute><AppLayout><ClientesFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/comercial/clientes/:tipo/:id" element={<PrivateRoute><AppLayout><ClientesFormPage /></AppLayout></PrivateRoute>} />

      <Route
        path="/cadastros/pessoas"
        element={
          <PrivateRoute>
            <AppLayout><PessoasPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/pessoas/novo"
        element={
          <PrivateRoute>
            <AppLayout><PessoaFormPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/pessoas/:tipo/:id/editar"
        element={
          <PrivateRoute>
            <AppLayout><PessoaFormPage /></AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/cadastros/pessoas/:tipo/:id"
        element={
          <PrivateRoute>
            <AppLayout><PessoaFormPage /></AppLayout>
          </PrivateRoute>
        }
      />

      <Route path="/cadastros/produtos" element={<PrivateRoute><AppLayout><ProdutosPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/produtos/novo" element={<PrivateRoute><AppLayout><ProdutoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/produtos/:id/editar" element={<PrivateRoute><AppLayout><ProdutoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/produtos/:id" element={<PrivateRoute><AppLayout><ProdutoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/categorias" element={<PrivateRoute><AppLayout><CategoriasPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/categorias/novo" element={<PrivateRoute><AppLayout><CategoriaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/categorias/:id/editar" element={<PrivateRoute><AppLayout><CategoriaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/categorias/:id" element={<PrivateRoute><AppLayout><CategoriaFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/fases" element={<PrivateRoute><AppLayout><FasesPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/fases/novo" element={<PrivateRoute><AppLayout><FaseFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/fases/:id/editar" element={<PrivateRoute><AppLayout><FaseFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/fases/:id" element={<PrivateRoute><AppLayout><FaseFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/almoxarifados" element={<PrivateRoute><AppLayout><AlmoxarifadosPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/almoxarifados/novo" element={<PrivateRoute><AppLayout><AlmoxarifadoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/almoxarifados/:id/editar" element={<PrivateRoute><AppLayout><AlmoxarifadoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/almoxarifados/:id" element={<PrivateRoute><AppLayout><AlmoxarifadoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/depositos" element={<PrivateRoute><AppLayout><DepositosPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/depositos/novo" element={<PrivateRoute><AppLayout><DepositoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/depositos/:id/editar" element={<PrivateRoute><AppLayout><DepositoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/depositos/:id" element={<PrivateRoute><AppLayout><DepositoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/unidades" element={<PrivateRoute><AppLayout><UnidadesMedidaPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/unidades/novo" element={<PrivateRoute><AppLayout><UnidadeMedidaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/unidades/:id/editar" element={<PrivateRoute><AppLayout><UnidadeMedidaFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/unidades/:id" element={<PrivateRoute><AppLayout><UnidadeMedidaFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/formas-pagamento" element={<PrivateRoute><AppLayout><FormasPagamentoPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/formas-pagamento/novo" element={<PrivateRoute><AppLayout><FormaPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/formas-pagamento/:id/editar" element={<PrivateRoute><AppLayout><FormaPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/formas-pagamento/:id" element={<PrivateRoute><AppLayout><FormaPagamentoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/finalidades" element={<PrivateRoute><AppLayout><FinalidadesPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/finalidades/novo" element={<PrivateRoute><AppLayout><FinalidadeFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/finalidades/:id/editar" element={<PrivateRoute><AppLayout><FinalidadeFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/finalidades/:id" element={<PrivateRoute><AppLayout><FinalidadeFormPage /></AppLayout></PrivateRoute>} />

      <Route path="/cadastros/condicoes-pagamento" element={<PrivateRoute><AppLayout><CondicoesPagamentoPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/condicoes-pagamento/novo" element={<PrivateRoute><AppLayout><CondicaoPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/condicoes-pagamento/:id/editar" element={<PrivateRoute><AppLayout><CondicaoPagamentoFormPage /></AppLayout></PrivateRoute>} />
      <Route path="/cadastros/condicoes-pagamento/:id" element={<PrivateRoute><AppLayout><CondicaoPagamentoFormPage /></AppLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
