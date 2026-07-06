using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using P = Valisys_Production.Infrastructure.Authorization.Permissions;

namespace Valisys_Production.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        private static readonly Guid AdminProfileId    = Guid.Parse("C0DE0000-0000-0000-0000-000000000001");
        private static readonly Guid GerenteProfileId  = Guid.Parse("C0DE0000-0000-0000-0000-000000000050");
        private static readonly Guid VendedorProfileId = Guid.Parse("C0DE0000-0000-0000-0000-000000000051");
        private static readonly Guid UnitId = Guid.Parse("C0DE0000-0000-0000-0000-000000000002");
        private static readonly Guid KgId = Guid.Parse("C0DE0000-0000-0000-0000-000000000003");
        private static readonly Guid Phase1Id = Guid.Parse("C0DE0000-0000-0000-0000-000000000004");
        private static readonly Guid SampleCategoryId = Guid.Parse("C0DE0000-0000-0000-0000-000000000006");
        private static readonly Guid SampleTipoOrdemDeProducaoId = Guid.Parse("C0DE0000-0000-0000-0000-000000000008");
        private static readonly Guid SampleAlmoxarifadoId = Guid.Parse("C0DE0000-0000-0000-0000-000000000009");
        private static readonly Guid AdminUserId = Guid.Parse("C0DE0000-0000-0000-0000-000000000000");

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
        public DbSet<Notificacao> Notificacoes { get; set; }
        public DbSet<ContaReceber> ContasReceber { get; set; }
        public DbSet<ParcelaReceber> ParcelasReceber { get; set; }
        public DbSet<BaixaParcelaReceber> BaixasParcelaReceber { get; set; }
        public DbSet<ContaPagar> ContasPagar { get; set; }
        public DbSet<ParcelaPagar> ParcelasPagar { get; set; }
        public DbSet<BaixaParcelaPagar> BaixasParcelaPagar { get; set; }
        public DbSet<PedidoVenda> PedidosVenda { get; set; }
        public DbSet<ItemPedido> ItensPedido { get; set; }
        public DbSet<Orcamento> Orcamentos { get; set; }
        public DbSet<ItemOrcamento> ItensOrcamento { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<FormaPagamento> FormasPagamento { get; set; }
        public DbSet<FormaPagamentoVendedor> FormaPagamentoVendedores { get; set; }
        public DbSet<Finalidade> Finalidades { get; set; }
        public DbSet<CondicaoPagamento> CondicoesPagamento { get; set; }
        public DbSet<ParcelaCondicao> ParcelasCondicao { get; set; }
        public DbSet<RegraRecorrencia> RegrasRecorrencia { get; set; }
        public DbSet<Carteira> Carteiras { get; set; }
        public DbSet<MovimentacaoCarteira> MovimentacoesCarteira { get; set; }
        public DbSet<Inventario> Inventarios { get; set; }
        public DbSet<ItemInventario> ItensInventario { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

            modelBuilder.Entity<Produto>()
                .HasIndex(p => p.CodigoInternoProduto)
                .IsUnique();

            modelBuilder.Entity<Produto>()
                .Navigation(p => p.Fornecedores).HasField("_fornecedores");

            modelBuilder.Entity<Produto>()
                .Navigation(p => p.Variacoes).HasField("_variacoes");

            modelBuilder.Entity<ProdutoFornecedor>()
                .HasOne(pf => pf.Produto)
                .WithMany(p => p.Fornecedores)
                .HasForeignKey(pf => pf.ProdutoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProdutoVariacao>()
                .HasOne(pv => pv.Produto)
                .WithMany(p => p.Variacoes)
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
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.AlmoxarifadoDestino)
                .WithMany()
                .HasForeignKey(m => m.AlmoxarifadoDestinoId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.Usuario)
                .WithMany()
                .HasForeignKey(m => m.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.DepositoOrigem)
                .WithMany()
                .HasForeignKey(m => m.DepositoOrigemId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.DepositoDestino)
                .WithMany()
                .HasForeignKey(m => m.DepositoDestinoId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Movimentacao>()
                .HasOne(m => m.PedidoVenda)
                .WithMany()
                .HasForeignKey(m => m.PedidoVendaId)
                .IsRequired(false)
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
                .Navigation(f => f.Itens).HasField("_itens");

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
                )
                .Metadata.SetValueComparer(new ValueComparer<List<string>>(
                    (c1, c2) => c1.SequenceEqual(c2),
                    c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                    c => c.ToList()
                ));

            modelBuilder.Entity<ParcelaReceber>()
                .HasOne(p => p.ContaReceber)
                .WithMany(c => c.Parcelas)
                .HasForeignKey(p => p.ContaReceberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParcelaReceber>()
                .HasOne(p => p.Carteira)
                .WithMany()
                .HasForeignKey(p => p.CarteiraId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParcelaReceber>()
                .HasIndex(p => new { p.ContaReceberId, p.NumeroParcela })
                .IsUnique();

            modelBuilder.Entity<ParcelaReceber>()
                .Navigation(p => p.Baixas)
                .HasField("_baixas");

            modelBuilder.Entity<BaixaParcelaReceber>()
                .HasOne(b => b.ParcelaReceber)
                .WithMany(p => p.Baixas)
                .HasForeignKey(b => b.ParcelaReceberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BaixaParcelaReceber>()
                .HasOne(b => b.Carteira)
                .WithMany()
                .HasForeignKey(b => b.CarteiraId)
                .OnDelete(DeleteBehavior.Restrict);

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

            modelBuilder.Entity<ContaReceber>()
                .HasOne(c => c.FormaPagamento)
                .WithMany()
                .HasForeignKey(c => c.FormaPagamentoId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            modelBuilder.Entity<ParcelaPagar>()
                .HasOne(p => p.ContaPagar)
                .WithMany(c => c.Parcelas)
                .HasForeignKey(p => p.ContaPagarId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ParcelaPagar>()
                .HasOne(p => p.Carteira)
                .WithMany()
                .HasForeignKey(p => p.CarteiraId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParcelaPagar>()
                .HasIndex(p => new { p.ContaPagarId, p.NumeroParcela })
                .IsUnique();

            modelBuilder.Entity<ParcelaPagar>()
                .Navigation(p => p.Baixas)
                .HasField("_baixas");

            modelBuilder.Entity<BaixaParcelaPagar>()
                .HasOne(b => b.ParcelaPagar)
                .WithMany(p => p.Baixas)
                .HasForeignKey(b => b.ParcelaPagarId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BaixaParcelaPagar>()
                .HasOne(b => b.Carteira)
                .WithMany()
                .HasForeignKey(b => b.CarteiraId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ContaPagar>()
                .Navigation(c => c.Parcelas)
                .HasField("_parcelas");

            modelBuilder.Entity<ContaPagar>()
                .HasOne(c => c.Fornecedor)
                .WithMany()
                .HasForeignKey(c => c.FornecedorId)
                .IsRequired(false);

            modelBuilder.Entity<ContaPagar>()
                .HasOne(c => c.FormaPagamento)
                .WithMany()
                .HasForeignKey(c => c.FormaPagamentoId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            modelBuilder.Entity<ContaPagar>()
                .HasOne(c => c.RegraRecorrencia)
                .WithMany()
                .HasForeignKey(c => c.RegraRecorrenciaId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            modelBuilder.Entity<MovimentacaoCarteira>()
                .HasOne(m => m.Carteira)
                .WithMany()
                .HasForeignKey(m => m.CarteiraId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovimentacaoCarteira>()
                .HasOne<ContaPagar>()
                .WithMany()
                .HasForeignKey(m => m.ContaPagarId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovimentacaoCarteira>()
                .HasOne<ContaReceber>()
                .WithMany()
                .HasForeignKey(m => m.ContaReceberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovimentacaoCarteira>()
                .HasOne<ParcelaPagar>()
                .WithMany()
                .HasForeignKey(m => m.ParcelaPagarId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovimentacaoCarteira>()
                .HasOne<ParcelaReceber>()
                .WithMany()
                .HasForeignKey(m => m.ParcelaReceberId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MovimentacaoCarteira>()
                .HasIndex(m => m.CarteiraId);

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

            modelBuilder.Entity<Finalidade>()
                .HasIndex(f => f.Codigo).IsUnique();

            modelBuilder.Entity<Finalidade>()
                .HasIndex(f => f.Nome).IsUnique();

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

            modelBuilder.Entity<Inventario>()
                .Navigation(i => i.Itens).HasField("_itens");

            modelBuilder.Entity<Inventario>()
                .HasIndex(i => i.Numero)
                .IsUnique();

            modelBuilder.Entity<Inventario>()
                .HasOne(i => i.Deposito)
                .WithMany()
                .HasForeignKey(i => i.DepositoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Inventario>()
                .HasOne(i => i.UsuarioAbertura)
                .WithMany()
                .HasForeignKey(i => i.UsuarioAberturaId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ItemInventario>()
                .HasOne(i => i.Produto)
                .WithMany()
                .HasForeignKey(i => i.ProdutoId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ItemInventario>()
                .HasOne<Inventario>()
                .WithMany(i => i.Itens)
                .HasForeignKey(i => i.InventarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasOne(r => r.Usuario)
                .WithMany()
                .HasForeignKey(r => r.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(r => r.Token)
                .IsUnique();

            modelBuilder.Entity<RefreshToken>()
                .HasIndex(r => new { r.UsuarioId, r.IsRevoked });


            modelBuilder.Entity<Usuario>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Orcamento>()
                .HasIndex(o => o.ClienteId);

            modelBuilder.Entity<Orcamento>()
                .HasIndex(o => o.Status);

            modelBuilder.Entity<Orcamento>()
                .HasIndex(o => o.DataEmissao);

            modelBuilder.Entity<Orcamento>()
                .HasIndex(o => o.RepresentanteId);

            modelBuilder.Entity<PedidoVenda>()
                .HasIndex(p => p.ClienteId);

            modelBuilder.Entity<PedidoVenda>()
                .HasIndex(p => p.Status);

            modelBuilder.Entity<LogSistema>()
                .HasIndex(l => l.DataHora);

            modelBuilder.Entity<LogSistema>()
                .HasIndex(l => l.UsuarioId);

            modelBuilder.Entity<ContaReceber>()
                .HasIndex(c => c.PessoaId);

            modelBuilder.Entity<ContaReceber>()
                .HasIndex(c => c.Status);

            modelBuilder.Entity<ContaReceber>()
                .HasIndex(c => c.Codigo).IsUnique();

            modelBuilder.Entity<ContaPagar>()
                .HasIndex(c => c.FornecedorId);

            modelBuilder.Entity<ContaPagar>()
                .HasIndex(c => c.Status);

            modelBuilder.Entity<ContaPagar>()
                .HasIndex(c => c.Codigo).IsUnique();

            modelBuilder.HasSequence<long>("conta_pagar_codigo_seq").StartsAt(1).IncrementsBy(1);
            modelBuilder.HasSequence<long>("conta_receber_codigo_seq").StartsAt(1).IncrementsBy(1);

            var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

            var adminPerfil = new Perfil("Administrador");
            adminPerfil.InicializarParaSeed(AdminProfileId, seedDate);

            var vendedorAcessos = new List<string>
            {
                P.Dashboard.Visualizar,
                P.Produtos.Visualizar,
                P.Fornecedores.Visualizar,
                P.Orcamentos.Visualizar, P.Orcamentos.Criar, P.Orcamentos.Editar,
                P.Orcamentos.Enviar, P.Orcamentos.Aprovar, P.Orcamentos.Cancelar, P.Orcamentos.ConverterEmPedido,
                P.PedidosVenda.Visualizar, P.PedidosVenda.Criar, P.PedidosVenda.Editar,
                P.PedidosVenda.Confirmar, P.PedidosVenda.Cancelar, P.PedidosVenda.Concluir,
            };
            var vendedorPerfil = new Perfil("Vendedor", vendedorAcessos);
            vendedorPerfil.InicializarParaSeed(VendedorProfileId, seedDate);

            var gerenteAcessos = new List<string>
            {
                P.Dashboard.Visualizar,
                // Cadastros básicos
                P.Almoxarifados.Visualizar, P.Almoxarifados.Criar, P.Almoxarifados.Editar, P.Almoxarifados.Inativar,
                P.Categorias.Visualizar, P.Categorias.Criar, P.Categorias.Editar, P.Categorias.Inativar,
                P.CondicoesPagamento.Visualizar, P.CondicoesPagamento.Criar, P.CondicoesPagamento.Editar, P.CondicoesPagamento.Inativar,
                P.Depositos.Visualizar, P.Depositos.Criar, P.Depositos.Editar, P.Depositos.Excluir,
                P.FasesProducao.Visualizar, P.FasesProducao.Criar, P.FasesProducao.Editar, P.FasesProducao.Excluir,
                P.Finalidades.Visualizar, P.Finalidades.Criar, P.Finalidades.Editar, P.Finalidades.Inativar,
                P.FormasPagamento.Visualizar, P.FormasPagamento.Criar, P.FormasPagamento.Editar, P.FormasPagamento.Inativar,
                P.TiposOrdem.Visualizar, P.TiposOrdem.Criar, P.TiposOrdem.Editar, P.TiposOrdem.Excluir,
                P.UnidadesMedida.Visualizar, P.UnidadesMedida.Criar, P.UnidadesMedida.Editar, P.UnidadesMedida.Excluir,
                // Cadastros avançados
                P.Fornecedores.Visualizar, P.Fornecedores.Criar, P.Fornecedores.Editar, P.Fornecedores.Inativar,
                P.Produtos.Visualizar, P.Produtos.Criar, P.Produtos.Editar, P.Produtos.Inativar,
                // Comercial
                P.Orcamentos.Visualizar, P.Orcamentos.Criar, P.Orcamentos.Editar,
                P.Orcamentos.Enviar, P.Orcamentos.Aprovar, P.Orcamentos.Cancelar, P.Orcamentos.ConverterEmPedido,
                P.PedidosVenda.Visualizar, P.PedidosVenda.Criar, P.PedidosVenda.Editar,
                P.PedidosVenda.Confirmar, P.PedidosVenda.Cancelar, P.PedidosVenda.Concluir,
                // Engenharia
                P.FichasTecnicas.Visualizar, P.FichasTecnicas.Criar, P.FichasTecnicas.Editar, P.FichasTecnicas.Inativar,
                P.Roteiros.Visualizar, P.Roteiros.Criar, P.Roteiros.Editar, P.Roteiros.Excluir,
                // Estoque
                P.Estoque.Visualizar,
                P.Movimentacoes.Visualizar, P.Movimentacoes.Criar, P.Movimentacoes.Editar, P.Movimentacoes.Excluir,
                P.Inventarios.Visualizar, P.Inventarios.Criar, P.Inventarios.Editar, P.Inventarios.Finalizar, P.Inventarios.Cancelar,
                // Financeiro
                P.Financeiro.Visualizar,
                // Produção
                P.Lotes.Visualizar, P.Lotes.Criar, P.Lotes.Editar, P.Lotes.Cancelar,
                P.OrdensProducao.Visualizar, P.OrdensProducao.Criar, P.OrdensProducao.Editar,
                P.OrdensProducao.Cancelar, P.OrdensProducao.Finalizar, P.OrdensProducao.AvancarFase, P.OrdensProducao.Estornar,
                P.Solicitacoes.Visualizar, P.Solicitacoes.Criar, P.Solicitacoes.Aprovar, P.Solicitacoes.Cancelar,
                // Relatórios
                P.Relatorios.Visualizar,
            };
            var gerentePerfil = new Perfil("Gerente", gerenteAcessos);
            gerentePerfil.InicializarParaSeed(GerenteProfileId, seedDate);

            modelBuilder.Entity<Perfil>().HasData(adminPerfil, vendedorPerfil, gerentePerfil);

            var adminUsuario = new Usuario("Administrador Master", "admin@valisys.com",
                "$2a$12$ANrNWbumb63JFxo..Ar6A.3iQJhEqJUqR5kqjklRZoZHs3uM7C4k2", AdminProfileId);
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

            var tipoOrdem = new TipoOrdemDeProducao("Normal", "Ordem de Produção Padrão");
            tipoOrdem.DefinirCodigo(1);
            tipoOrdem.InicializarParaSeed(SampleTipoOrdemDeProducaoId, seedDate);
            modelBuilder.Entity<TipoOrdemDeProducao>().HasData(tipoOrdem);
        }
    }
}
