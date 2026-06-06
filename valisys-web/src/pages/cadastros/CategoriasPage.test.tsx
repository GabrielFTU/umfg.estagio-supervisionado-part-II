import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CategoriasPage } from './CategoriasPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockCategorias = [
  { id: '1', codigo: '001', nome: 'Eletrônicos', descricao: 'Produtos eletrônicos', ativo: true },
  { id: '2', codigo: '002', nome: 'Roupas',      descricao: null,                    ativo: false },
  { id: '3', codigo: '003', nome: 'Alimentos',   descricao: 'Produtos alimentícios', ativo: true },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <CategoriasPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'fake-token');
});

describe('CategoriasPage — carregamento', () => {
  it('exibe spinner enquanto carrega', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    renderPage();
    expect(screen.getByText(/carregando categorias/i)).toBeInTheDocument();
  });

  it('exibe categorias após carregamento bem-sucedido', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockCategorias,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Eletrônicos')).toBeInTheDocument();
      expect(screen.getByText('Roupas')).toBeInTheDocument();
      expect(screen.getByText('Alimentos')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro se a API falhar', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar as categorias/i)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há categorias', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/nenhuma categoria cadastrada/i)).toBeInTheDocument();
    });
  });
});

describe('CategoriasPage — busca', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockCategorias,
    }) as any;
  });

  it('filtra categorias pelo nome', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Eletrônicos'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Eletrônicos' },
    });

    expect(screen.getByText('Eletrônicos')).toBeInTheDocument();
    expect(screen.queryByText('Roupas')).not.toBeInTheDocument();
    expect(screen.queryByText('Alimentos')).not.toBeInTheDocument();
  });

  it('filtra por código', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Eletrônicos'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: '002' },
    });

    expect(screen.getByText('Roupas')).toBeInTheDocument();
    expect(screen.queryByText('Eletrônicos')).not.toBeInTheDocument();
  });

  it('exibe "nenhum resultado" quando busca não encontra nada', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Eletrônicos'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Inexistente' },
    });

    expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });
});

describe('CategoriasPage — navegação', () => {
  it('navega para criação ao clicar em "Nova Categoria"', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();
    await waitFor(() => screen.getByText(/nova categoria/i));

    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/cadastros/categorias/novo');
  });
});

describe('CategoriasPage — desativar com produtos ativos (409)', () => {
  it('exibe alerta ao tentar desativar categoria com produtos ativos', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [mockCategorias[0]],
      })
      .mockResolvedValueOnce({
        ok: false, status: 409,
        json: async () => ({ message: 'A categoria possui produtos ativos e não pode ser desativada.' }),
      }) as any;

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();
    await waitFor(() => screen.getByText('Eletrônicos'));

    const menuBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(menuBtn);

    await waitFor(() => {
      const desativarBtn = screen.getByText('Desativar');
      fireEvent.click(desativarBtn);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('produtos ativos'),
      );
    });

    alertMock.mockRestore();
  });
});
