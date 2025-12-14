using BlogAppAPI.Models.Domain;
using Microsoft.AspNetCore.Identity;

namespace BlogAppAPI.Repositories
{
    public interface IAuthRepository
    {
        Task<ApplicationUser> LoginAsync(string username, string password);
        Task<IdentityResult> RegisterAsync(ApplicationUser user, string password);
        Task<(string accessToken, RefreshToken refreshToken)> GenerateTokensAsync(ApplicationUser user);
        Task<ApplicationUser> GetUserById(string id);
        Task<ApplicationUser> UpdateUser(ApplicationUser user);
    }
}
