import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { FinanceiroPage } from './pages/financeiro';
import { ComercialPage } from './pages/comercial';
import { PessoasPage } from './pages/cadastros/PessoasPage';
import { PessoaFormPage } from './pages/cadastros/PessoaForm';
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
