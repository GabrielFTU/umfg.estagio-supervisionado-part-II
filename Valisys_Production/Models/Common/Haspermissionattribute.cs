namespace Valisys_Production.Infrastructure.Authorization
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
    public sealed class HasPermissionAttribute : Attribute
    {
        public string Permission { get; }

        public HasPermissionAttribute(string permission)
        {
            Permission = permission;
        }
    }
}