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

            if (type.IsPrimitive || type.IsEnum || type == typeof(Guid) || type == typeof(DateTime)
                || type == typeof(DateOnly) || type == typeof(decimal))
                return;

            foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                         .Where(p => p.CanRead && p.CanWrite))
            {
                try
                {
                    var value = prop.GetValue(obj);
                    if (value is string str)
                    {
                        prop.SetValue(obj, HtmlTagRegex.Replace(str, string.Empty));
                    }
                    else if (value is System.Collections.IEnumerable enumerable && value is not string)
                    {
                        foreach (var item in enumerable)
                            if (item is not null && !item.GetType().IsPrimitive)
                                SanitizeObject(item);
                    }
                    else if (value is not null && !value.GetType().IsPrimitive && value.GetType() != typeof(Guid))
                    {
                        SanitizeObject(value);
                    }
                }
                catch (TargetInvocationException) { }
            }
        }
    }
}
