using BlogAppAPI.Data;
using BlogAppAPI.Models.Domain;
using BlogAppAPI.Models.DTO;
using BlogAppAPI.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BlogAppAPI.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
		private readonly IAuthRepository _authRepository;
		private readonly ApplicationDbContext _context;
		private readonly UserManager<ApplicationUser> _userManager;

		public AuthController(
			IAuthRepository authRepository,
			ApplicationDbContext context,
			UserManager<ApplicationUser> userManager)
		{
			_authRepository = authRepository;
			_context = context;
			_userManager = userManager;
		}

		[AllowAnonymous]
		[HttpPost("Login")]
		public async Task<IActionResult> Login([FromBody] UserLoginDto user)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var foundUser = await _authRepository.LoginAsync(user.Username, user.Password);

			if (foundUser == null)
				return Unauthorized("Invalid username or password.");

			var (accessToken, refreshToken) =
				await _authRepository.GenerateTokensAsync(foundUser);

			_context.RefreshTokens.Add(refreshToken);
			await _context.SaveChangesAsync();

			SetRefreshTokenCookie(refreshToken);

			return Ok(new { token = accessToken });
		}

		[AllowAnonymous]
		[HttpPost("Register")]
		public async Task<IActionResult> Register([FromBody] UserCreateDto user)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			var newUser = new ApplicationUser
			{
				UserName = user.Username,
				Email = user.Email,
				FullName = user.FullName,
				Bio = string.IsNullOrWhiteSpace(user.Bio) ? "" : user.Bio,
				ProfileImageUrl = string.IsNullOrWhiteSpace(user.ProfileImageUrl)
					? "default.png"
					: user.ProfileImageUrl
			};

			var result = await _authRepository.RegisterAsync(newUser, user.Password);

			if (!result.Succeeded)
				return BadRequest(result.Errors.Select(e => e.Description));

			var (accessToken, refreshToken) =
				await _authRepository.GenerateTokensAsync(newUser);

			_context.RefreshTokens.Add(refreshToken);
			await _context.SaveChangesAsync();

			SetRefreshTokenCookie(refreshToken);

			return Ok(new { token = accessToken });
		}

		[AllowAnonymous]
		[HttpPost("Refresh")]
		public async Task<IActionResult> Refresh()
		{
			var refreshToken = Request.Cookies["refreshToken"];

			if (refreshToken == null)
				return Unauthorized("Missing refresh token");

			var storedToken = await _context.RefreshTokens
				.FirstOrDefaultAsync(x => x.Token == refreshToken);

			if (storedToken == null || !storedToken.IsActive)
				return Unauthorized("Invalid refresh token");

			var user = await _userManager.Users
				.FirstOrDefaultAsync(u => u.Id == storedToken.UserId);

			if (user == null)
				return Unauthorized();

			storedToken.Revoked = DateTime.UtcNow;

			var (newAccessToken, newRefreshToken) =
				await _authRepository.GenerateTokensAsync(user);

			_context.RefreshTokens.Add(newRefreshToken);
			await _context.SaveChangesAsync();

			SetRefreshTokenCookie(newRefreshToken);

			return Ok(new { token = newAccessToken });
		}

		[Authorize]
		[HttpPost("Logout")]
		public async Task<IActionResult> Logout()
		{
			var refreshToken = Request.Cookies["refreshToken"];

			if (refreshToken != null)
			{
				var storedToken = await _context.RefreshTokens
					.FirstOrDefaultAsync(x => x.Token == refreshToken);

				if (storedToken != null)
				{
					storedToken.Revoked = DateTime.UtcNow;
					await _context.SaveChangesAsync();
				}

				Response.Cookies.Delete("refreshToken");
			}

			return Ok("Logged out.");
		}

		[Authorize]
		[HttpGet("profile")]
		public async Task<IActionResult> GetProfile()
		{
            var userId = User.FindFirstValue("id");

			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			var user = await _authRepository.GetUserById(userId);

			if (user == null)
				return NotFound();

			var dto = new UserProfileDto
			{
				Id = user.Id,
				Email = user.Email,
				FullName = user.FullName,
				Bio = user.Bio,
				ProfileImageUrl = user.ProfileImageUrl
			};

			return Ok(dto);
		}

		[Authorize]
		[HttpPut("profile")]
		public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileDto model)
		{
            var userId = User.FindFirstValue("id");

			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			var user = await _authRepository.GetUserById(userId);

			if (user == null)
				return NotFound();

			user.FullName = model.FullName;
			user.Bio = model.Bio;
			user.ProfileImageUrl = model.ProfileImageUrl;

			await _authRepository.UpdateUser(user);

			return Ok(new { message = "Profile updated successfully" });
		}


		private void SetRefreshTokenCookie(RefreshToken token)
        {
            Response.Cookies.Append("refreshToken", token.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None, //none is must for amplify
                Expires = token.Expires
            });
        }

	}
}