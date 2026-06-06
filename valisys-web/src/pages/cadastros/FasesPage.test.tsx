import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FasesPage } from './FasesPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockFases = [
  { id: '1', nome: 'Corte',      ordem: 1, tempoPadraoDias: 2, ativo: true  },
  { id: '2', nome: 'Montagem',   ordem: 2, tempoPadraoDias: 0, ativo: false },
  { id: '3', nome: 'Acabamento', ordem: 3, tempoPadraoDias: 5, ativo: true  },
];

function renderPage() {
  return render(
    <MemoryRouter>
      <FasesPage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem('token', 'fake-token');
});

describe('FasesPage — carregamento', () => {
  it('exibe spinner enquanto carrega', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;
    renderPage();
    expect(screen.getByText(/carregando fases de produção/i)).toBeInTheDocument();
  });

  it('exibe fases após carregamento bem-sucedido', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockFases,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Corte')).toBeInTheDocument();
      expect(screen.getByText('Montagem')).toBeInTheDocument();
      expect(screen.getByText('Acabamento')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro se a API falhar', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/não foi possível carregar as fases de produção/i)).toBeInTheDocument();
    });
  });

  it('exibe estado vazio quando não há fases', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/nenhuma fase cadastrada/i)).toBeInTheDocument();
    });
  });
});

describe('FasesPage — exibição de dados', () => {
  it('exibe tempo padrão em dias corretamente', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockFases,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('2 dias')).toBeInTheDocument();
      expect(screen.getByText('5 dias')).toBeInTheDocument();
    });
  });

  it('exibe "—" quando tempo padrão é zero', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockFases,
    }) as any;

    renderPage();

    await waitFor(() => screen.getByText('Montagem'));
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('exibe número da ordem como badge', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockFases,
    }) as any;

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});

describe('FasesPage — busca', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => mockFases,
    }) as any;
  });

  it('filtra fases pelo nome', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Corte'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Corte' },
    });

    expect(screen.getByText('Corte')).toBeInTheDocument();
    expect(screen.queryByText('Montagem')).not.toBeInTheDocument();
    expect(screen.queryByText('Acabamento')).not.toBeInTheDocument();
  });

  it('exibe "nenhum resultado" quando busca não encontra nada', async () => {
    renderPage();
    await waitFor(() => screen.getByText('Corte'));

    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), {
      target: { value: 'Inexistente' },
    });

    expect(screen.getByText(/nenhum resultado encontrado/i)).toBeInTheDocument();
  });
});

describe('FasesPage — navegação', () => {
  it('navega para criação ao clicar em "Nova Fase"', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true, status: 200, json: async () => [],
    }) as any;

    renderPage();
    await waitFor(() => screen.getByText(/nova fase/i));

    fireEvent.click(screen.getByRole('button', { name: /nova fase/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/cadastros/fases/novo');
  });
});

describe('FasesPage — desativar com dependências ativas (409)', () => {
  it('exibe alerta ao tentar desativar fase com dependências ativas', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true, status: 200,
        json: async () => [mockFases[0]],
      })
      .mockResolvedValueOnce({
        ok: false, status: 409,
        json: async () => ({ detail: 'A fase está sendo utilizada em roteiros de produção ou ordens em andamento.' }),
      }) as any;

    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderPage();
    await waitFor(() => screen.getByText('Corte'));

    const menuBtn = screen.getByRole('button', { name: '' });
    fireEvent.click(menuBtn);

    await waitFor(() => {
      const desativarBtn = screen.getByText('Desativar');
      fireEvent.click(desativarBtn);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        expect.stringContaining('roteiros de produção ou ordens'),
      );
    });

    alertMock.mockRestore();
  });
});
