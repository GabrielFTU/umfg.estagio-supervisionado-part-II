# ──────────────────────────────────────────────────────────────────────────────
#  Althel ERP  –  Comandos de desenvolvimento
#  Uso: make <comando>
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: help setup dev stack stack-down stack-logs \
        db-up db-down migrate seed \
        backend frontend \
        build clean test

# Exibe a ajuda (padrão ao rodar só "make")
help:
	@echo ""
	@echo "  Althel ERP — comandos disponíveis"
	@echo ""
	@echo "  SETUP"
	@echo "    make setup        Copia .env.example → .env (se não existir)"
	@echo ""
	@echo "  DESENVOLVIMENTO LOCAL (banco no Docker, app nativo)"
	@echo "    make dev          Sobe o banco e abre backend + frontend"
	@echo "    make db-up        Sobe só o banco PostgreSQL"
	@echo "    make db-down      Para e remove o banco"
	@echo "    make backend      Roda o backend (.NET) em modo watch"
	@echo "    make frontend     Roda o frontend (React) em modo watch"
	@echo "    make migrate      Aplica as migrations do EF Core"
	@echo ""
	@echo "  STACK COMPLETA (Docker)"
	@echo "    make stack        Builda e sobe tudo (db + backend + frontend)"
	@echo "    make stack-down   Para e remove todos os containers"
	@echo "    make stack-logs   Exibe logs da stack"
	@echo ""
	@echo "  OUTROS"
	@echo "    make test         Roda os testes do backend"
	@echo "    make build        Publica o backend em Release"
	@echo "    make clean        Remove artefatos gerados (bin/obj/dist)"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────

setup:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✔  .env criado a partir de .env.example — edite as senhas antes de continuar."; \
	else \
		echo "ℹ  .env já existe, nada foi alterado."; \
	fi

# ── Desenvolvimento local ─────────────────────────────────────────────────────

db-up:
	docker compose -f docker-compose.dev.yml up -d
	@echo "✔  Banco disponível em localhost:5433"

db-down:
	docker compose -f docker-compose.dev.yml down

migrate:
	cd Valisys_Production && dotnet ef database update

backend:
	cd Valisys_Production && dotnet watch run

frontend:
	cd valisys-web && npm run dev

# Sobe o banco e abre backend + frontend em background
dev: db-up
	@echo "Aguardando banco ficar saudável..."
	@docker compose -f docker-compose.dev.yml exec db \
		sh -c 'until pg_isready -U "$${POSTGRES_USER}"; do sleep 1; done'
	@echo "✔  Banco pronto. Inicie backend e frontend em terminais separados:"
	@echo "     make backend"
	@echo "     make frontend"

# ── Stack completa (Docker) ───────────────────────────────────────────────────

stack:
	docker compose up --build -d

stack-down:
	docker compose down

stack-logs:
	docker compose logs -f

# ── Outros ───────────────────────────────────────────────────────────────────

test:
	cd Valisys_Production.Tests && dotnet test --logger "console;verbosity=normal"

build:
	cd Valisys_Production && dotnet publish -c Release -o ./publish

clean:
	find . -type d \( -name bin -o -name obj \) -not -path "*/node_modules/*" \
		-exec rm -rf {} + 2>/dev/null || true
	rm -rf valisys-web/dist valisys-web/.rsbuild
