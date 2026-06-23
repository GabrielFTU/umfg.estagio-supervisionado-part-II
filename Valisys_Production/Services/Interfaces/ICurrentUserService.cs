namespace Valisys_Production.Services.Interfaces
{
    public interface ICurrentUserService
    {
        Guid UserId { get; }
        bool IsAdmin { get; }
        bool HasPermission(string permission);
    }
}
