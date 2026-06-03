using AutoMapper;
using Valisys_Production.DTOs;
using Valisys_Production.Models;
using Valisys_Production.Models.Enums;
using System.Linq;

namespace Valisys_Production.Helpers
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // Pessoa Física
            CreateMap<PessoaFisica, PessoaFisicaReadDto>()
                .ForMember(dest => dest.Endereco, opt => opt.MapFrom(src =>
                    src.Endereco == null ? null : new EnderecoDto
                    {
                        Cep = src.Endereco.Cep,
                        Logradouro = src.Endereco.Logradouro,
                        Numero = src.Endereco.Numero,
                        Complemento = src.Endereco.Complemento,
                        Bairro = src.Endereco.Bairro,
                        Cidade = src.Endereco.Cidade,
                        Uf = src.Endereco.Uf,
                        CodigoIbge = src.Endereco.CodigoIbge,
                    }));

            // Pessoa Jurídica
            CreateMap<PessoaJuridica, PessoaJuridicaReadDto>()
                .ForMember(dest => dest.RazaoSocial, opt => opt.MapFrom(src => src.Nome))
                .ForMember(dest => dest.Endereco, opt => opt.MapFrom(src =>
                    src.Endereco == null ? null : new EnderecoDto
                    {
                        Cep = src.Endereco.Cep,
                        Logradouro = src.Endereco.Logradouro,
                        Numero = src.Endereco.Numero,
                        Complemento = src.Endereco.Complemento,
                        Bairro = src.Endereco.Bairro,
                        Cidade = src.Endereco.Cidade,
                        Uf = src.Endereco.Uf,
                        CodigoIbge = src.Endereco.CodigoIbge,
                    }));

            // Almoxarifado
            CreateMap<Almoxarifado, AlmoxarifadoReadDto>();

            // Categoria Produto
            CreateMap<CategoriaProduto, CategoriaProdutoReadDto>()
                .ForMember(dest => dest.Codigo, opt => opt.MapFrom(src => src.CodigoInterno));

            // Fase Produção
            CreateMap<FaseProducao, FaseProducaoReadDto>();

            // Fornecedor
            CreateMap<Fornecedor, FornecedorReadDto>();

            // Lote
            CreateMap<Lote, LoteReadDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ProdutoNome, opt => opt.MapFrom(src => src.Produto != null ? src.Produto.Nome : "N/A"))
                .ForMember(dest => dest.AlmoxarifadoNome, opt => opt.MapFrom(src => src.Almoxarifado != null ? src.Almoxarifado.Nome : "N/A"))
                .ForMember(dest => dest.Ativo, opt => opt.MapFrom(src =>
                    src.Status == StatusLote.Pendente ||
                    src.Status == StatusLote.EmProducao))
                .ForMember(dest => dest.EmUso, opt => opt.MapFrom(src => src.OrdensDeProducao != null && src.OrdensDeProducao.Any()));

            // Movimentação
            CreateMap<Movimentacao, MovimentacaoReadDto>()
                .ForMember(dest => dest.ProdutoNome, opt => opt.MapFrom(src => src.Produto.Nome))
                .ForMember(dest => dest.AlmoxarifadoOrigemNome, opt => opt.MapFrom(src => src.AlmoxarifadoOrigem.Nome))
                .ForMember(dest => dest.AlmoxarifadoDestinoNome, opt => opt.MapFrom(src => src.AlmoxarifadoDestino.Nome))
                .ForMember(dest => dest.UsuarioNome, opt => opt.MapFrom(src => src.Usuario.Nome));

            // Ordem de Produção
            CreateMap<OrdemDeProducao, OrdemDeProducaoReadDto>()
                .ForMember(dest => dest.ProdutoNome, opt => opt.MapFrom(src => src.Produto.Nome))
                .ForMember(dest => dest.AlmoxarifadoNome, opt => opt.MapFrom(src => src.Almoxarifado.Nome))
                .ForMember(dest => dest.FaseAtualNome, opt => opt.MapFrom(src => src.FaseAtual.Nome))
                .ForMember(dest => dest.LoteNumero, opt => opt.MapFrom(src => src.Lote != null ? src.Lote.CodigoLote : null))
                .ForMember(dest => dest.RoteiroCodigo, opt => opt.MapFrom(src => src.RoteiroProducao != null ? src.RoteiroProducao.Codigo : null));

            // Perfil
            CreateMap<Perfil, PerfilReadDto>();

            // Produto
            CreateMap<Produto, ProdutoReadDto>()
                .ForMember(dest => dest.Codigo, opt => opt.MapFrom(src => src.CodigoInternoProduto.ToString()))
                .ForMember(dest => dest.Classificacao, opt => opt.MapFrom(src => src.Classificacao.ToString()))
                .ForMember(dest => dest.ClassificacaoId, opt => opt.MapFrom(src => (int)src.Classificacao))
                .ForMember(dest => dest.EstoqueMinimo, opt => opt.Ignore())
                .ForMember(dest => dest.CategoriaProdutoNome, opt => opt.MapFrom(src => src.CategoriaProduto.Nome))
                .ForMember(dest => dest.UnidadeMedidaSigla, opt => opt.MapFrom(src => src.UnidadeMedida.Sigla))
                .ForMember(dest => dest.AlmoxarifadoEstoqueId, opt => opt.Ignore())
                .ForMember(dest => dest.AlmoxarifadoEstoqueNome, opt => opt.Ignore());

            // Solicitação de Produção
            CreateMap<SolicitacaoProducao, SolicitacaoProducaoReadDto>()
                .ForMember(dest => dest.Codigo, opt => opt.MapFrom(src => src.CodigoSolicitacao))
                .ForMember(dest => dest.QuantidadeSolicitada, opt => opt.MapFrom(src => src.Quantidade))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.ProdutoNome, opt => opt.MapFrom(src => src.Produto.Nome))
                .ForMember(dest => dest.UsuarioSolicitanteId, opt => opt.MapFrom(src => src.EncarregadoId))
                .ForMember(dest => dest.UsuarioSolicitanteNome, opt => opt.MapFrom(src => src.Encarregado.Nome))
                .ForMember(dest => dest.UsuarioAprovadorNome, opt => opt.MapFrom(src => src.UsuarioAprovacao != null ? src.UsuarioAprovacao.Nome : null));

            // Tipo de Ordem de Produção
            CreateMap<TipoOrdemDeProducao, TipoOrdemDeProducaoReadDto>();

            // Unidade de Medida
            CreateMap<UnidadeMedida, UnidadeMedidaReadDto>();

            // Usuário
            CreateMap<Usuario, UsuarioReadDto>()
                .ForMember(dest => dest.PerfilNome, opt => opt.MapFrom(src => src.Perfil != null ? src.Perfil.Nome : "Sem Perfil"))
                .ForMember(dest => dest.Acessos, opt => opt.MapFrom(src => src.Perfil.Acessos));

            // Ficha Técnica
            CreateMap<FichaTecnica, FichaTecnicaReadDto>()
                .ForMember(dest => dest.ProdutoNome, opt => opt.MapFrom(src => src.Produto.Nome))
                .ForMember(dest => dest.Codigo, opt => opt.MapFrom(src => src.CodigoFicha))
                .ForMember(dest => dest.Ativa, opt => opt.MapFrom(src => src.Ativo));

            CreateMap<FichaTecnicaItem, FichaTecnicaItemReadDto>()
                .ForMember(dest => dest.ProdutoComponenteNome, opt => opt.MapFrom(src => src.ProdutoComponente.Nome))
                .ForMember(dest => dest.ProdutoComponenteCodigo, opt => opt.MapFrom(src => src.ProdutoComponente.CodigoInternoProduto))
                .ForMember(dest => dest.UnidadeMedida, opt => opt.MapFrom(src => src.ProdutoComponente.UnidadeMedida.Sigla));

            // Roteiro de Produção
            CreateMap<RoteiroProducao, RoteiroProducaoReadDto>()
                .ForMember(dest => dest.ProdutoNome, opt => opt.MapFrom(src => src.Produto.Nome))
                .ForMember(dest => dest.TempoTotal, opt => opt.MapFrom(src => src.Etapas != null ? src.Etapas.Sum(e => e.TempoDias) : 0));

            CreateMap<RoteiroProducaoEtapa, RoteiroEtapaReadDto>()
                .ForMember(dest => dest.FaseProducaoNome, opt => opt.MapFrom(src => src.FaseProducao.Nome));

            // Conta a Receber
            CreateMap<ContaReceber, ContaReceberReadDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Parcelas, opt => opt.MapFrom(src => src.Parcelas));

            CreateMap<ParcelaReceber, ParcelaReceberReadDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.FormaPagamento, opt => opt.MapFrom(src =>
                    src.FormaPagamento.HasValue ? src.FormaPagamento.ToString() : null));

            // Conta a Pagar
            CreateMap<ContaPagar, ContaPagarReadDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.FornecedorNome, opt => opt.MapFrom(src =>
                    src.Fornecedor != null ? src.Fornecedor.Nome : null))
                .ForMember(dest => dest.Parcelas, opt => opt.MapFrom(src => src.Parcelas));

            CreateMap<ParcelaPagar, ParcelaPagarReadDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.FormaPagamento, opt => opt.MapFrom(src =>
                    src.FormaPagamento.HasValue ? src.FormaPagamento.ToString() : null));
        }
    }
}
