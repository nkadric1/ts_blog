using BlogAppAPI.Models.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using BlogAppAPI.Data;

namespace BlogAppAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {

        private readonly UserManager<ApplicationUser> _userManager; // Provided function by ASP.NET for user management operations.
        private readonly IConfiguration _configuration; // For appsettings.json access.
        private readonly SignInManager<ApplicationUser> _signInManager; // For sign in management operations.
        private readonly ApplicationDbContext _appDbContext;

        public AuthRepository(UserManager<ApplicationUser> userManager, IConfiguration configuration, SignInManager<ApplicationUser> signInManager, ApplicationDbContext appDbContext)
        {
            _userManager = userManager;
            _configuration = configuration;
            _signInManager = signInManager;
            _appDbContext=appDbContext;
        }

        public async Task<ApplicationUser> LoginAsync(string username, string password)
        {
            var result = await _signInManager.PasswordSignInAsync(username, password, false, lockoutOnFailure: true);

            if (result.Succeeded)
            {
                return await _userManager.FindByNameAsync(username);
            }

            return null;
        }

        // Method that generates a JWT token.
        public async Task<(string accessToken, RefreshToken refreshToken)> GenerateTokensAsync(ApplicationUser user)
        {
            // CLAIMS
            var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim("id", user.Id)
    };

            // ADD ROLES
            var roles = await _userManager.GetRolesAsync(user);
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            // KEY
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // ACCESS TOKEN (valid 60 min)
            var jwtToken = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials
            );

            string accessToken = new JwtSecurityTokenHandler().WriteToken(jwtToken);

            // REFRESH TOKEN (valid 7 days)
            var refreshToken = new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                UserId = user.Id,
                Created = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddDays(7)
            };

            // RETURN BOTH
            return (accessToken, refreshToken);
        }


        // Method that registers and stores a new user into the database with the provided 'IdentityUser' object and password.
        public async Task<IdentityResult> RegisterAsync(ApplicationUser user, string password)
        {
            
            var createUser = await _userManager.CreateAsync(user, password);

            if (!createUser.Succeeded)
            {
                return createUser;
            }

            var assignRole = await _userManager.AddToRoleAsync(user, "User");

            if (!assignRole.Succeeded)
            {
                return assignRole;
            }

            return createUser;
        }

        //generate Refresh Token
        private RefreshToken GenerateRefreshToken(string userId)
        {
            return new RefreshToken
            {
                Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                UserId = userId,
                Expires = DateTime.UtcNow.AddDays(7),
                Created = DateTime.UtcNow
            };
        }

        public async Task<ApplicationUser> GetUserById(string id)
        {
            return await _appDbContext.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<ApplicationUser> UpdateUser(ApplicationUser user)
        {
            _appDbContext.Users.Update(user);
            await _appDbContext.SaveChangesAsync();
            return user;
        }

    }
}
