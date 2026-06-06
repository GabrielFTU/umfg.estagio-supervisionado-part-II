import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnidadesMedidaPage } from './UnidadesMedidaPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockUnidades = [
  {
    id: '1', nome: 'Quilograma', sigla: 'kg',
    grandeza: 1, fatorConversao: 1, ehUnidadeBase: true, ativo: true,
  },
  {
    id: '2', nome: 'Grama', sigla: 'g',
    grandeza: 1, fatorConversao: 0.001, ehUnidadeBase: false, ativo: true,
  },
  {
    id: '3', nome: 'Metro', sigla: 'm',
    grandeza: 2, fatorConversao: 1, ehUnidadeBase: true, ativo: false,
  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <UnidadesMedidaPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'fake-token');
});

describe('UnidadesMedidaPage — carregamento', () => {
  it('exibe spinner enquanto carrega', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    renderPage();
    expect(screen.getByText(/carregando unidades de medida/i)).toBeInTheDocument();
  });

  it('exibe unidades após carregamento bem-sucedido', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockUnidades,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Quilograma')).toBeInTheDocument();
      expect(screen.getByText('Grama')).toBeInTheDocument();
      expect(screen.getByText('Metro')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro se a API falhar', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar as unidades de medida/i)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há unidades', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/nenhuma unidade de medida cadastrada/i)).toBeInTheDocument();
    });
  });
});

describe('UnidadesMedidaPage — exibição de dados', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockUnidades,
    }) as any;
  });

  it('exibe siglas de cada unidade', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

    expect(screen.getByText('kg')).toBeInTheDocument();
    expect(screen.getByText('g')).toBeInTheDocument();
    expect(screen.getByText('m')).toBeInTheDocument();
  });

  it('exibe badges de status corretos', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

    const ativos   = screen.getAllByText('Ativo');
    const inativos = screen.getAllByText('Inativo');
    expect(ativos.length).toBe(2);
    expect(inativos.length).toBe(1);
  });

  it('marca unidades base corretamente', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

    const badges = screen.getAllByText('Sim');
    expect(badges.length).toBe(2);
  });
});

describe('UnidadesMedidaPage — busca', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockUnidades,
    }) as any;
  });

  it('filtra unidades pelo nome', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Metro' },
    });

    expect(screen.getByText('Metro')).toBeInTheDocument();
    expect(screen.queryByText('Quilograma')).not.toBeInTheDocument();
    expect(screen.queryByText('Grama')).not.toBeInTheDocument();
  });

  it('filtra unidades pela sigla', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'kg' },
    });

    expect(screen.getByText('Quilograma')).toBeInTheDocument();
    expect(screen.queryByText('Grama')).not.toBeInTheDocument();
    expect(screen.queryByText('Metro')).not.toBeInTheDocument();
  });

  it('exibe "nenhum resultado" quando busca não encontra nada', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Inexistente' },
    });

    expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });
});

describe('UnidadesMedidaPage — navegação', () => {
  it('navega para criação ao clicar em "Nova Unidade"', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();
    await waitFor(() => screen.getByText(/nova unidade/i));

    fireEvent.click(screen.getByRole('button', { name: /nova unidade/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/cadastros/unidades/novo');
  });
});

describe('UnidadesMedidaPage — desativar com produtos ativos (409)', () => {
  it('exibe alerta ao tentar desativar unidade com produtos ativos', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [mockUnidades[0]],
      })
      .mockResolvedValueOnce({
        ok: false, status: 409,
        json: async () => ({ message: 'A unidade de medida possui produtos ativos e não pode ser desativada.' }),
      }) as any;

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();
    await waitFor(() => screen.getByText('Quilograma'));

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
