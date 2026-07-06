using Microsoft.AspNetCore.Mvc.Filters;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Valisys_Production.Middleware
{
    public class XssSanitizationFilter : IActionFilter
    {
        private static readonly Regex HtmlTagRegex =
            new Regex(@"<[^>]*(>|$)", RegexOptions.Compiled | RegexOptions.Singleline);

        public void OnActionExecuting(ActionExecutingContext context)
        {
            foreach (var arg in context.ActionArguments.Values)
            {
                if (arg is not null)
                    SanitizeObject(arg);
            }
        }

        public void OnActionExecuted(ActionExecutedContext context) { }

        private static void SanitizeObject(object obj)
        {
            var type = obj.GetType();

            if (type.IsPrimitive || type.IsEnum || type == typeof(string) || type == typeof(Guid)
                || type == typeof(DateTime) || type == typeof(DateOnly) || type == typeof(decimal))
                return;

            // Coleções (List<T>, arrays, etc.) expõem um indexador ("Item[int]") que
            // GetProperties() inclui, mas GetValue(obj) sem índice lança
            // TargetParameterCountException. Trata a coleção antes de refletir propriedades.
            if (obj is System.Collections.IEnumerable enumerable)
            {
                foreach (var item in enumerable)
                    if (item is not null)
                        SanitizeObject(item);
                return;
            }

            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                         .Where(p => p.CanRead && p.CanWrite && p.GetIndexParameters().Length == 0))
            {
                try
                {
                    var value = prop.GetValue(obj);
                    if (value is string str)
                        prop.SetValue(obj, HtmlTagRegex.Replace(str, string.Empty));
                    else if (value is not null)
                        SanitizeObject(value);
                }
                catch (TargetInvocationException) { }
            }
        }
    }
}
