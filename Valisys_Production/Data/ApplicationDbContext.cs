using Microsoft.EntityFrameworkCore;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;

namespace Valisys_Production.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        private static readonly Guid AdminProfileId = Guid.Parse("C0DE0000-0000-0000-0000-000000000001");
        private static readonly Guid UnitId = Guid.Parse("C0DE0000-0000-0000-0000-000000000002");
        private static readonly Guid KgId = Guid.Parse("C0DE0000-0000-0000-0000-000000000003");
        private static readonly Guid Phase1Id = Guid.Parse("C0DE0000-0000-0000-0000-000000000004");
        private static readonly Guid SampleCategoryId = Guid.Parse("C0DE0000-0000-0000-0000-000000000006");
        private static readonly Guid SampleTipoOrdemDeProducaoId = Guid.Parse("C0DE0000-0000-0000-0000-000000000008");
        private static readonly Guid SampleAlmoxarifadoId = Guid.Parse("C0DE0000-0000-0000-0000-000000000009");
        private static readonly Guid AdminUserId = Guid.Parse("C0DE0000-0000-0000-0000-000000000000");

        // ─── Pessoa ───────────────────────────────────────────────────────────
        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<PessoaFisica> PessoasFisicas { get; set; }
        public DbSet<PessoaJuridica> PessoasJuridicas { get; set; }

        public DbSet<Fornecedor> Fornecedores { get; set; }
        public DbSet<Almoxarifado> Almoxarifados { get; set; }
        public DbSet<Deposito> Depositos { get; set; }
        public DbSet<Produto> Produtos { get; set; }
        public DbSet<ProdutoFornecedor> ProdutoFornecedores { get; set; }
        public DbSet<ProdutoVariacao> ProdutoVariacoes { get; set; }
        public DbSet<Lote> Lotes { get; set; }
        public DbSet<OrdemDeProducao> OrdensDeProducao { get; set; }
        public DbSet<Movimentacao> Movimentacoes { get; set; }
        public DbSet<SolicitacaoProducao> SolicitacoesProducao { get; set; }
        public DbSet<SolicitacaoProducaoItem> SolicitacaoProducaoItens { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Perfil> Perfis { get; set; }
        public DbSet<FaseProducao> FasesProducao { get; set; }
        public DbSet<CategoriaProduto> CategoriasProduto { get; set; }
        public DbSet<UnidadeMedida> UnidadesMedida { get; set; }
        public DbSet<TipoOrdemDeProducao> TiposDeOrdemDeProducao { get; set; }
        public DbSet<FichaTecnica> FichasTecnicas { get; set; }
        public DbSet<FichaTecnicaItem> FichaTecnicaItens { get; set; }
        public DbSet<FichaTecnicaSequencia> FichaTecnicaSequencias { get; set; }
        public DbSet<RoteiroProducao> RoteirosProducao { get; set; }
        public DbSet<RoteiroProducaoEtapa> RoteiroProducaoEtapas { get; set; }
        public DbSet<LogSistema> LogsSistema { get; set; }
        public DbSet<ContaReceber> ContasReceber { get; set; }
        public DbSet<ParcelaReceber> ParcelasReceber { get; set; }
        public DbSet<ContaPagar> ContasPagar { get; set; }
        public DbSet<ParcelaPagar> ParcelasPagar { get; set; }
        public DbSet<PedidoVenda> PedidosVenda { get; set; }
        public DbSet<ItemPedido> ItensPedido { get; set; }
        public DbSet<Orcamento> Orcamentos { get; set; }
        public DbSet<ItemOrcamento> ItensOrcamento { get; set; }
        public DbSet<FormaPagamento> FormasPagamento { get; set; }
        public DbSet<FormaPagamentoVendedor> FormaPagamentoVendedores { get; set; }
        public DbSet<Finalidade> Finalidades { get; set; }
        public DbSet<CondicaoPagamento> CondicoesPagamento { get; set; }
        public DbSet<ParcelaCondicao> ParcelasCondicao { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ─── Pessoa TPT ───────────────────────────────────────────────────
            // Pessoas → tabela base, PessoasFisicas / PessoasJuridicas → tabelas filhas (TPT)
            modelBuilder.Entity<Pessoa>().UseTptMappingStrategy();

            modelBuilder.Entity<Pessoa>()
                .OwnsOne(p => p.Endereco, e =>
                {
                    e.Property(a => a.Uf).HasMaxLength(2);
                    e.Property(a => a.Cep).HasMaxLength(9);
                });

            modelBuilder.Entity<Pessoa>()
                .HasIndex(p => p.PapelPessoa);

            modelBuilder.Entity<PessoaFisica>()
                .HasIndex(pf => pf.Cpf)
                .IsUnique();

            modelBuilder.Entity<PessoaJuridica>()
                .HasIndex(pj => pj.Cnpj)
                .IsUnique();

            // ─────────────────────────────────────────────────────────────────

            modelBuilder.Entity<Produto>()
                .HasIndex(p => p.CodigoInternoProduto)
                .IsUnique();

            modelBuilder.Entity<Produto>()
                .Navigation(p => p.Fornecedores).HasField("_fornecedores");

            modelBuilder.Entity<Produto>()
                .Navigation(p => p.Variacoes).HasField("_variacoes");

            modelBuilder.Entity<ProdutoFornecedor>()
                .HasOne(pf => pf.Produto)
                .WithMany()
                .HasForeignKey(pf => pf.ProdutoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProdutoVariacao>()
                .HasOne(pv => pv.Produto)
                .WithMany()
                .HasForeignKey(pv => pv.ProdutoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CategoriaProduto>()
                .HasIndex(c => c.CodigoInterno)
                .IsUnique()
                .HasFilter("\"CodigoInterno\" IS NOT NULL");

            modelBuilder.Entity<LogSistema>()
                .HasOne(l => l.Usuario)
                .WithMany()
                .HasForeignKey(l => l.UsuarioId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<OrdemDeProducao>()
                .HasOne(o => o.SolicitacaoProducao)
                .WithOne(s => s.OrdemDeProducao)
                .HasForeignKey<OrdemDeProducao>(o => o.SolicitacaoProducaoId)
                .IsRequired(false);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.OrdemDeProducao)
                .WithMany()
                .HasForeignKey(m => m.OrdemDeProducaoId)
                .IsRequired(false);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.AlmoxarifadoOrigem)
                .WithMany()
                .HasForeignKey(m => m.AlmoxarifadoOrigemId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.AlmoxarifadoDestino)
                .WithMany()
                .HasForeignKey(m => m.AlmoxarifadoDestinoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.Usuario)
                .WithMany()
                .HasForeignKey(m => m.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<SolicitacaoProducao>()
                .HasOne(s => s.Encarregado)
                .WithMany()
                .HasForeignKey(s => s.EncarregadoId)
                .IsRequired(false);

            modelBuilder.Entity<FichaTecnica>()
                .HasOne(f => f.Produto)
                .WithMany()
                .HasForeignKey(f => f.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FichaTecnica>()
                .Navigation(f => f.Sequencias).HasField("_sequencias");

            modelBuilder.Entity<FichaTecnicaItem>()
                .HasOne(i => i.FichaTecnica)
                .WithMany(f => f.Itens)
                .HasForeignKey(i => i.FichaTecnicaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FichaTecnicaItem>()
                .HasOne(i => i.ProdutoComponente)
                .WithMany()
                .HasForeignKey(i => i.ProdutoComponenteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FichaTecnicaItem>()
                .HasOne(i => i.FaseProducao)
                .WithMany()
                .HasForeignKey(i => i.FaseProducaoId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FichaTecnicaItem>()
                .HasOne(i => i.Cor)
                .WithMany()
                .HasForeignKey(i => i.CorId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<FichaTecnicaSequencia>()
                .HasOne(s => s.FichaTecnica)
                .WithMany(f => f.Sequencias)
                .HasForeignKey(s => s.FichaTecnicaId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FichaTecnicaSequencia>()
                .HasOne(s => s.FaseProducao)
                .WithMany()
                .HasForeignKey(s => s.FaseProducaoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoteiroProducao>()
                .HasOne(r => r.Produto)
                .WithMany()
                .HasForeignKey(r => r.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RoteiroProducaoEtapa>()
                .HasOne(e => e.RoteiroProducao)
                .WithMany(r => r.Etapas)
                .HasForeignKey(e => e.RoteiroProducaoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RoteiroProducaoEtapa>()
                .HasOne(e => e.FaseProducao)
                .WithMany()
                .HasForeignKey(e => e.FaseProducaoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Perfil>()
                .Property(p => p.Acessos)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );

            modelBuilder.Entity<ParcelaReceber>()
                .HasOne(p => p.ContaReceber)
                .WithMany(c => c.Parcelas)
                .HasForeignKey(p => p.ContaReceberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ContaReceber>()
                .Navigation(c => c.Parcelas)
                .HasField("_parcelas");

            modelBuilder.Entity<ContaReceber>()
                .HasOne(c => c.Pessoa)
                .WithMany()
                .HasForeignKey(c => c.PessoaId)
                .IsRequired(false);

            modelBuilder.Entity<ContaReceber>()
                .HasOne(c => c.PedidoVenda)
                .WithMany()
                .HasForeignKey(c => c.PedidoVendaId)
                .IsRequired(false);

            modelBuilder.Entity<ParcelaPagar>()
                .HasOne(p => p.ContaPagar)
                .WithMany(c => c.Parcelas)
                .HasForeignKey(p => p.ContaPagarId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ContaPagar>()
                .Navigation(c => c.Parcelas)
                .HasField("_parcelas");

            modelBuilder.Entity<ContaPagar>()
                .HasOne(c => c.Fornecedor)
                .WithMany()
                .HasForeignKey(c => c.FornecedorId)
                .IsRequired(false);

            modelBuilder.Entity<LimiteCredito>()
                .HasOne(l => l.Pessoa)
                .WithOne(p => p.LimiteCredito)
                .HasForeignKey<LimiteCredito>(l => l.PessoaId);

            // ─── Forma de Pagamento ───────────────────────────────────────────

            modelBuilder.Entity<FormaPagamento>()
                .Navigation(f => f.Vendedores).HasField("_vendedores");

            modelBuilder.Entity<FormaPagamento>()
                .HasIndex(f => f.Codigo).IsUnique();

            modelBuilder.Entity<FormaPagamentoVendedor>()
                .HasOne(v => v.Vendedor)
                .WithMany()
                .HasForeignKey(v => v.VendedorId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FormaPagamentoVendedor>()
                .HasOne<FormaPagamento>()
                .WithMany(f => f.Vendedores)
                .HasForeignKey(v => v.FormaPagamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<FormaPagamentoVendedor>()
                .HasIndex(v => new { v.FormaPagamentoId, v.VendedorId })
                .IsUnique();

            // ─── Finalidade ───────────────────────────────────────────────────

            modelBuilder.Entity<Finalidade>()
                .HasIndex(f => f.Codigo).IsUnique();

            modelBuilder.Entity<Finalidade>()
                .HasIndex(f => f.Nome).IsUnique();

            // ─── Condição de Pagamento ────────────────────────────────────────

            modelBuilder.Entity<CondicaoPagamento>()
                .HasIndex(c => c.Codigo).IsUnique();

            modelBuilder.Entity<CondicaoPagamento>()
                .HasIndex(c => c.Nome).IsUnique();

            modelBuilder.Entity<CondicaoPagamento>()
                .Navigation(c => c.Parcelas).HasField("_parcelas");

            modelBuilder.Entity<ParcelaCondicao>()
                .HasOne(p => p.CondicaoPagamento)
                .WithMany(c => c.Parcelas)
                .HasForeignKey(p => p.CondicaoPagamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParcelaCondicao>()
                .Property(p => p.Percentual)
                .HasPrecision(8, 4);

            // ─── Pedido de Venda ──────────────────────────────────────────────

            modelBuilder.Entity<PedidoVenda>()
                .Navigation(p => p.Itens).HasField("_itens");

            modelBuilder.Entity<PedidoVenda>()
                .HasIndex(p => p.Codigo)
                .IsUnique();

            modelBuilder.Entity<PedidoVenda>()
                .HasOne(p => p.Cliente)
                .WithMany()
                .HasForeignKey(p => p.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PedidoVenda>()
                .HasOne(p => p.Representante)
                .WithMany()
                .HasForeignKey(p => p.RepresentanteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ItemPedido>()
                .HasOne(i => i.Produto)
                .WithMany()
                .HasForeignKey(i => i.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ItemPedido>()
                .HasOne<PedidoVenda>()
                .WithMany(p => p.Itens)
                .HasForeignKey(i => i.PedidoVendaId)
                .OnDelete(DeleteBehavior.Cascade);

            // ─── Orçamento ────────────────────────────────────────────────────

            modelBuilder.Entity<Orcamento>()
                .Navigation(o => o.Itens).HasField("_itens");

            modelBuilder.Entity<Orcamento>()
                .HasIndex(o => o.Codigo)
                .IsUnique();

            modelBuilder.Entity<Orcamento>()
                .HasOne(o => o.Cliente)
                .WithMany()
                .HasForeignKey(o => o.ClienteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Orcamento>()
                .HasOne(o => o.Representante)
                .WithMany()
                .HasForeignKey(o => o.RepresentanteId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ItemOrcamento>()
                .HasOne(i => i.Produto)
                .WithMany()
                .HasForeignKey(i => i.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ItemOrcamento>()
                .HasOne<Orcamento>()
                .WithMany(o => o.Itens)
                .HasForeignKey(i => i.OrcamentoId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed Data
            var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var adminPerfil = new Perfil("Administrador");
            adminPerfil.InicializarParaSeed(AdminProfileId, seedDate);
            modelBuilder.Entity<Perfil>().HasData(adminPerfil);

            var adminUsuario = new Usuario("Administrador Master", "admin@valisys.com",
                "$2a$12$ceV2TtMQV.UXqYGXoyMt.eV9s2YcTh0SVykcjMPxxDxjci9hoYzeG", AdminProfileId);
            adminUsuario.InicializarParaSeed(AdminUserId, seedDate);
            modelBuilder.Entity<Usuario>().HasData(adminUsuario);

            var almoxarifadoGeral = new Almoxarifado("Almoxarifado Geral", "Almoxarifado principal",
                "Galpão 1", "Sistema", "(67) 99999-9999", "almoxarifado@empresa.com");
            almoxarifadoGeral.InicializarParaSeed(SampleAlmoxarifadoId, seedDate);
            modelBuilder.Entity<Almoxarifado>().HasData(almoxarifadoGeral);

            var unidades = new (Guid Id, string Nome, string Sigla, GrandezaUnidade Grandeza, decimal Fator, bool EhBase)[]
            {
                (UnitId,                                         "Unidade",            "UN",  GrandezaUnidade.Unidade,     1m,          true),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000020"), "Peça",           "PC",  GrandezaUnidade.Unidade,     1m,          false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000021"), "Caixa",          "CX",  GrandezaUnidade.Unidade,     1m,          false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000022"), "Kit",            "KIT", GrandezaUnidade.Unidade,     1m,          false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000023"), "Dúzia",          "DZ",  GrandezaUnidade.Unidade,     12m,         false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000024"), "Milheiro",       "MIL", GrandezaUnidade.Unidade,     1000m,       false),
                (KgId,                                           "Kilograma",          "KG",  GrandezaUnidade.Massa,       1m,          true),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000099"), "Grama",          "G",   GrandezaUnidade.Massa,       0.001m,      false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000031"), "Miligrama",      "MG",  GrandezaUnidade.Massa,       0.000001m,   false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000032"), "Tonelada",       "TON", GrandezaUnidade.Massa,       1000m,       false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000012"), "Metro",          "M",   GrandezaUnidade.Comprimento, 1m,          true),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000040"), "Centímetro",     "CM",  GrandezaUnidade.Comprimento, 0.01m,       false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000041"), "Milímetro",      "MM",  GrandezaUnidade.Comprimento, 0.001m,      false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000042"), "Quilômetro",     "KM",  GrandezaUnidade.Comprimento, 1000m,       false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000050"), "Litro",          "L",   GrandezaUnidade.Volume,      1m,          true),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000051"), "Mililitro",      "ML",  GrandezaUnidade.Volume,      0.001m,      false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000052"), "Metro Cúbico",   "M3",  GrandezaUnidade.Volume,      1000m,       false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000060"), "Metro Quadrado", "M2",  GrandezaUnidade.Area,        1m,          true),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000061"), "Centímetro Quadrado", "CM2", GrandezaUnidade.Area,  0.0001m,     false),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000070"), "Hora",           "H",   GrandezaUnidade.Tempo,       1m,          true),
                (Guid.Parse("C0DE0000-0000-0000-0000-000000000071"), "Minuto",         "MIN", GrandezaUnidade.Tempo,       0.0166667m,  false),
            };

            var unidadesSeeded = unidades.Select(u =>
            {
                var um = new UnidadeMedida(u.Nome, u.Sigla, u.Grandeza, u.Fator, u.EhBase);
                um.InicializarParaSeed(u.Id, seedDate);
                return um;
            }).ToArray();
            modelBuilder.Entity<UnidadeMedida>().HasData(unidadesSeeded);

            var tipoOrdem = new TipoOrdemDeProducao("Normal", "NOR", "Ordem de Produção Padrão");
            tipoOrdem.InicializarParaSeed(SampleTipoOrdemDeProducaoId, seedDate);
            modelBuilder.Entity<TipoOrdemDeProducao>().HasData(tipoOrdem);
        }
    }
}
