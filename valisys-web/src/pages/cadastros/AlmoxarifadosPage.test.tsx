import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AlmoxarifadosPage } from './AlmoxarifadosPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockAlmoxarifados = [
  {
    id: '1', nome: 'Almoxarifado Central', descricao: 'Armazém principal',
    localizacao: 'Galpão A', responsavel: 'João Silva',
    contato: '11999990000', email: 'central@emp.com', ativo: true,
  },
  {
    id: '2', nome: 'Almoxarifado Norte', descricao: null,
    localizacao: 'Galpão B', responsavel: 'Maria Souza',
    contato: null, email: null, ativo: false,
  },
  {
    id: '3', nome: 'Almoxarifado Sul', descricao: 'Armazém auxiliar',
    localizacao: 'Zona Industrial', responsavel: 'Pedro Costa',
    contato: null, email: null, ativo: true,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <AlmoxarifadosPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'fake-token');
});

describe('AlmoxarifadosPage — carregamento', () => {
  it('exibe spinner enquanto carrega', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    renderPage();
    expect(screen.getByText(/carregando almoxarifados/i)).toBeInTheDocument();
  });

  it('exibe almoxarifados após carregamento bem-sucedido', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockAlmoxarifados,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Almoxarifado Central')).toBeInTheDocument();
      expect(screen.getByText('Almoxarifado Norte')).toBeInTheDocument();
      expect(screen.getByText('Almoxarifado Sul')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro se a API falhar', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar os almoxarifados/i)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há almoxarifados', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/nenhum almoxarifado cadastrado/i)).toBeInTheDocument();
    });
  });
});

describe('AlmoxarifadosPage — exibição de dados', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockAlmoxarifados,
    }) as any;
  });

  it('exibe localização e responsável de cada almoxarifado', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    expect(screen.getByText('Galpão A')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('exibe badges de status corretos', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    const ativos   = screen.getAllByText('Ativo');
    const inativos = screen.getAllByText('Inativo');
    expect(ativos.length).toBe(2);
    expect(inativos.length).toBe(1);
  });
});

describe('AlmoxarifadosPage — busca', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockAlmoxarifados,
    }) as any;
  });

  it('filtra almoxarifados pelo nome', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Central' },
    });

    expect(screen.getByText('Almoxarifado Central')).toBeInTheDocument();
    expect(screen.queryByText('Almoxarifado Norte')).not.toBeInTheDocument();
    expect(screen.queryByText('Almoxarifado Sul')).not.toBeInTheDocument();
  });

  it('filtra almoxarifados pela localização', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Zona Industrial' },
    });

    expect(screen.getByText('Almoxarifado Sul')).toBeInTheDocument();
    expect(screen.queryByText('Almoxarifado Central')).not.toBeInTheDocument();
  });

  it('filtra almoxarifados pelo responsável', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Maria' },
    });

    expect(screen.getByText('Almoxarifado Norte')).toBeInTheDocument();
    expect(screen.queryByText('Almoxarifado Central')).not.toBeInTheDocument();
  });

  it('exibe "nenhum resultado" quando busca não encontra nada', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Inexistente' },
    });

    expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });
});

describe('AlmoxarifadosPage — navegação', () => {
  it('navega para criação ao clicar em "Novo Almoxarifado"', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();
    await waitFor(() => screen.getByText(/novo almoxarifado/i));

    fireEvent.click(screen.getByRole('button', { name: /novo almoxarifado/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/cadastros/almoxarifados/novo');
  });
});

describe('AlmoxarifadosPage — desativar com depósitos ativos (409)', () => {
  it('exibe alerta ao tentar desativar almoxarifado com depósitos ativos', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [mockAlmoxarifados[0]],
      })
      .mockResolvedValueOnce({
        ok: false, status: 409,
        json: async () => ({ message: 'Não é possível desativar um almoxarifado com depósitos ativos.' }),
      }) as any;

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();
    await waitFor(() => screen.getByText('Almoxarifado Central'));

    const menuBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(menuBtn);

    await waitFor(() => {
      const desativarBtn = screen.getByText('Desativar');
      fireEvent.click(desativarBtn);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('depósitos ativos'),
      );
    });

    alertMock.mockRestore();
  });
});
