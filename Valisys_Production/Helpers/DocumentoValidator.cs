using System.Text.RegularExpressions;

namespace Valisys_Production.Helpers
{
    public static class DocumentoValidator
    {
        public static bool EhCpfValido(string? cpf)
        {
            var d = SomenteDigitos(cpf);
            if (d.Length != 11 || TodosDigitosIguais(d)) return false;

            var soma = 0;
            for (var i = 0; i < 9; i++) soma += (d[i] - '0') * (10 - i);
            var resto = 11 - (soma % 11);
            var d1 = resto >= 10 ? 0 : resto;
            if (d1 != d[9] - '0') return false;

            soma = 0;
            for (var i = 0; i < 10; i++) soma += (d[i] - '0') * (11 - i);
            resto = 11 - (soma % 11);
            var d2 = resto >= 10 ? 0 : resto;
            return d2 == d[10] - '0';
        }

        public static bool EhCnpjValido(string? cnpj)
        {
            var d = SomenteDigitos(cnpj);
            if (d.Length != 14 || TodosDigitosIguais(d)) return false;

            int[] pesos1 = { 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };
            int[] pesos2 = { 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2 };

            var soma = 0;
            for (var i = 0; i < 12; i++) soma += (d[i] - '0') * pesos1[i];
            var resto = soma % 11;
            var d1 = resto < 2 ? 0 : 11 - resto;
            if (d1 != d[12] - '0') return false;

            soma = 0;
            for (var i = 0; i < 13; i++) soma += (d[i] - '0') * pesos2[i];
            resto = soma % 11;
            var d2 = resto < 2 ? 0 : 11 - resto;
            return d2 == d[13] - '0';
        }

        private static string SomenteDigitos(string? valor)
            => Regex.Replace(valor ?? string.Empty, @"\D", "");

        private static bool TodosDigitosIguais(string digitos)
        {
            for (var i = 1; i < digitos.Length; i++)
                if (digitos[i] != digitos[0]) return false;
            return true;
        }
    }
}
