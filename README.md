# Althel ERP

Sistema ERP desenvolvido em ASP.NET Core 8 (backend) e React 18 (frontend), com banco PostgreSQL.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Para quê |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ | Stack completa ou banco local |
| [.NET SDK](https://dotnet.microsoft.com/download/dotnet/8.0) | 8.0 | Backend nativo (modo dev local) |
| [Node.js](https://nodejs.org/) | 20 LTS | Frontend nativo (modo dev local) |
| `make` | qualquer | Atalhos de linha de comando |

> **Windows:** o `make` não vem por padrão. Instale via `winget install GnuWin32.Make` ou use [Git Bash](https://gitforwindows.org/) / [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install).

---

## Configuração inicial (obrigatória)

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd althel-erp     # ou o nome da pasta

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env
```

Abra `.env` e preencha:

```dotenv
DB_PASSWORD=uma_senha_forte    # senha do PostgreSQL
JWT_SECRET=<64 bytes em base64>  # gere com: openssl rand -base64 64
```

Os campos AWS (`AWS_ACCESS_KEY`, etc.) são opcionais — deixe em branco para desabilitar uploads de imagem.

---

## Modo 1 — Stack completa com Docker

Inicia banco + backend + frontend como containers. Não requer .NET ou Node instalados.

```bash
make stack          # builda imagens e sobe tudo
make stack-logs     # acompanha os logs
make stack-down     # para e remove os containers
```

| Serviço   | URL                         |
|-----------|-----------------------------|
| Frontend  | http://localhost:5173       |
| Backend   | http://localhost:5019/api   |
| Banco     | localhost:5433              |

---

## Modo 2 — Desenvolvimento local (hot-reload)

Banco no Docker, backend e frontend nativos. Recomendado para desenvolvimento.

```bash
# Terminal 1 — sobe o banco e aguarda ficar pronto
make dev

# Terminal 2 — backend com reload automático
make backend

# Terminal 3 — frontend com HMR
make frontend
```

Na primeira execução aplique as migrations:

```bash
make migrate
```

| Serviço   | URL                         |
|-----------|-----------------------------|
| Frontend  | http://localhost:5173       |
| Backend   | http://localhost:5019/api   |
| Banco     | localhost:5433              |

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DB_USER` | Não (padrão: `postgres`) | Usuário PostgreSQL |
| `DB_PASSWORD` | **Sim** | Senha PostgreSQL |
| `DB_NAME` | Não (padrão: `ValisysProduction`) | Nome do banco |
| `JWT_SECRET` | **Sim** | Chave para assinar tokens JWT (≥ 32 chars) |
| `AWS_ACCESS_KEY` | Não | Chave de acesso AWS |
| `AWS_SECRET_KEY` | Não | Chave secreta AWS |
| `AWS_BUCKET_NAME` | Não | Nome do bucket S3 |
| `AWS_REGION` | Não (padrão: `sa-east-1`) | Região AWS |

> O arquivo `.env` é **ignorado pelo git** — nunca comite credenciais reais.

---

## Comandos disponíveis

```
make help         Lista todos os comandos
make setup        Cria .env a partir de .env.example
make dev          Sobe o banco e exibe instruções de dev local
make db-up        Sobe só o banco PostgreSQL (porta 5433)
make db-down      Para o banco
make backend      Roda o backend em modo watch
make frontend     Roda o frontend em modo watch
make migrate      Aplica migrations do EF Core
make stack        Sobe a stack completa via Docker
make stack-down   Para a stack completa
make stack-logs   Exibe logs dos containers
make test         Roda os testes do backend
make build        Publica o backend em modo Release
make clean        Remove artefatos de build (bin/obj/dist)
```

---

## Estrutura do projeto

```
.
├── Valisys_Production/    # Backend ASP.NET Core 8
│   ├── Controllers/
│   ├── Services/
│   ├── Repositories/
│   ├── Models/
│   ├── DTOs/
│   ├── Data/              # ApplicationDbContext + Migrations
│   └── Dockerfile
├── valisys-web/           # Frontend React 18
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml     # Stack completa
├── docker-compose.dev.yml # Só o banco (modo dev local)
├── .env.example           # Template de variáveis (sem senhas)
└── Makefile               # Atalhos de linha de comando
```

---

## Migrations

Para criar uma nova migration após alterar os models:

```bash
cd Valisys_Production
dotnet ef migrations add NomeDaMigration
```


```bash
make migrate
cd Valisys_Production && dotnet ef database update
```



