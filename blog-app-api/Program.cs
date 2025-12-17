using BlogAppAPI.Data;
using BlogAppAPI.Models.Domain;
using BlogAppAPI.Repositories;
using BlogAppAPI.Repositories.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
	c.EnableAnnotations();

	c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
	{
		Name = "Authorization",
		Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
		Scheme = "Bearer",
		BearerFormat = "JWT",
		In = Microsoft.OpenApi.Models.ParameterLocation.Header,
		Description = "Unesi JWT token u format: Bearer {token}"
	});

	c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement{
	{
		new Microsoft.OpenApi.Models.OpenApiSecurityScheme
		{
			Reference = new Microsoft.OpenApi.Models.OpenApiReference
			{
				Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
				Id = "Bearer"
			}
		},
		new string[] {}
		}
	});
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
	// (opciono) možeš pojačati/olakšati password pravila
	// options.Password.RequiredLength = 8;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBlogRepository, BlogRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IBlogImageRepository, BlogImageRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();


builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer = true,
		ValidateAudience = true,
		ValidateLifetime = true,
		ValidateIssuerSigningKey = true,
		ValidIssuer = builder.Configuration["Jwt:Issuer"],
		ValidAudience = builder.Configuration["Jwt:Audience"],
		IssuerSigningKey = new SymmetricSecurityKey(
	Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? string.Empty))
	};
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		policy
			.WithOrigins(
				"https://main.d1cs4sdtdtvkzb.amplifyapp.com",
				"http://localhost:4200",
				"http://localhost:3000"
			)
			.AllowAnyHeader()
			.AllowAnyMethod();
		// JWT u Authorization headeru → AllowCredentials NE treba
	});
});

// --------------------------------------------------
// 7) Forwarded headers (ako koristiš NGINX/reverse proxy)
// --------------------------------------------------
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
	options.ForwardedHeaders =
	ForwardedHeaders.XForwardedFor |
	ForwardedHeaders.XForwardedProto;

// Ako znaš proxy IP/Networks, dodaj ovdje KnownProxies/KnownNetworks radi sigurnosti.
// options.KnownProxies.Add(IPAddress.Parse("x.x.x.x"));
});


var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
	var services = scope.ServiceProvider;

var context = services.GetRequiredService<ApplicationDbContext>();
	var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
	var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

	context.Database.Migrate();

	var roles = new[] { "Admin", "User" };
	foreach (var role in roles)
	{
		if (!await roleManager.RoleExistsAsync(role))
		{
			await roleManager.CreateAsync(new IdentityRole(role));
		}
	}

	var adminUser = new ApplicationUser
	{
		UserName = "admin",
		Email = "admin@example.com",
		EmailConfirmed = true,
		FullName = "Admin User",
		Bio = "System Administrator",
		ProfileImageUrl = "default.png"
	};

	var existingAdmin = await userManager.FindByNameAsync(adminUser.UserName);

	if (existingAdmin == null)
	{
		await userManager.CreateAsync(adminUser, "Admin@123");
		await userManager.AddToRoleAsync(adminUser, "Admin");
	}
	else
	{
		if (!await userManager.IsInRoleAsync(existingAdmin, "Admin"))
		{
			await userManager.AddToRoleAsync(existingAdmin, "Admin");
		}
	}

}

app.UseForwardedHeaders();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

app.UseStaticFiles(new StaticFileOptions
{
	FileProvider = new PhysicalFileProvider(
Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
	RequestPath = ""
});


app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
