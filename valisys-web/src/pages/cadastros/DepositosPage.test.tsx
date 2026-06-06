import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DepositosPage } from './DepositosPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockDepositos = [
  {
    id: '1', almoxarifadoId: 'a1', almoxarifadoNome: 'Almoxarifado Central',
    codigoIdentificador: 1, nome: 'Setor A', descricao: 'Setor principal', ativo: true,
  },
  {
    id: '2', almoxarifadoId: 'a1', almoxarifadoNome: 'Almoxarifado Central',
    codigoIdentificador: 2, nome: 'Setor B', descricao: null, ativo: false,
  },
  {
    id: '3', almoxarifadoId: 'a2', almoxarifadoNome: 'Almoxarifado Norte',
    codigoIdentificador: 1, nome: 'Prateleira 01', descricao: 'Produtos inflamáveis', ativo: true,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <DepositosPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'fake-token');
});

describe('DepositosPage — carregamento', () => {
  it('exibe spinner enquanto carrega', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    renderPage();
    expect(screen.getByText(/carregando depósitos/i)).toBeInTheDocument();
  });

  it('exibe depósitos após carregamento bem-sucedido', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockDepositos,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Setor A')).toBeInTheDocument();
      expect(screen.getByText('Setor B')).toBeInTheDocument();
      expect(screen.getByText('Prateleira 01')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro se a API falhar', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar os depósitos/i)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há depósitos', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/nenhum depósito cadastrado/i)).toBeInTheDocument();
    });
  });
});

describe('DepositosPage — exibição de dados', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockDepositos,
    }) as any;
  });

  it('exibe almoxarifado de cada depósito', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    expect(screen.getAllByText('Almoxarifado Central').length).toBeGreaterThan(0);
    expect(screen.getByText('Almoxarifado Norte')).toBeInTheDocument();
  });

  it('exibe badges de status corretos', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    const ativos   = screen.getAllByText('Ativo');
    const inativos = screen.getAllByText('Inativo');
    expect(ativos.length).toBe(2);
    expect(inativos.length).toBe(1);
  });

  it('exibe código identificador de cada depósito', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    expect(screen.getAllByText('#1').length).toBeGreaterThan(0);
    expect(screen.getByText('#2')).toBeInTheDocument();
  });
});

describe('DepositosPage — busca', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockDepositos,
    }) as any;
  });

  it('filtra depósitos pelo nome', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Prateleira' },
    });

    expect(screen.getByText('Prateleira 01')).toBeInTheDocument();
    expect(screen.queryByText('Setor A')).not.toBeInTheDocument();
    expect(screen.queryByText('Setor B')).not.toBeInTheDocument();
  });

  it('filtra depósitos pelo almoxarifado', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Norte' },
    });

    expect(screen.getByText('Prateleira 01')).toBeInTheDocument();
    expect(screen.queryByText('Setor A')).not.toBeInTheDocument();
  });

  it('exibe "nenhum resultado" quando busca não encontra nada', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Inexistente' },
    });

    expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });
});

describe('DepositosPage — navegação', () => {
  it('navega para criação ao clicar em "Novo Depósito"', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();
    await waitFor(() => screen.getByText(/novo depósito/i));

    fireEvent.click(screen.getByRole('button', { name: /novo depósito/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/cadastros/depositos/novo');
  });
});

describe('DepositosPage — desativar com lotes ativos (409)', () => {
  it('exibe alerta ao tentar desativar depósito com lotes ativos no almoxarifado', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [mockDepositos[0]],
      })
      .mockResolvedValueOnce({
        ok: false, status: 409,
        json: async () => ({ message: 'Não é possível desativar o depósito pois o almoxarifado possui lotes ativos.' }),
      }) as any;

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();
    await waitFor(() => screen.getByText('Setor A'));

    const menuBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(menuBtn);

    await waitFor(() => {
      const desativarBtn = screen.getByText('Desativar');
      fireEvent.click(desativarBtn);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('lotes ativos'),
      );
    });

    alertMock.mockRestore();
  });
});
