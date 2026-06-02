import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { FinanceiroPage } from './pages/financeiro';
import { ComercialPage } from './pages/comercial';
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
