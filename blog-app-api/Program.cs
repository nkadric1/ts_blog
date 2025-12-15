using BlogAppAPI.Data;
using BlogAppAPI.Models.Domain;
using BlogAppAPI.Repositories;
using BlogAppAPI.Repositories.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

// --------------------------------------------------
// 1?? Default ASP.NET konfiguracija
// --------------------------------------------------
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

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
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


// --------------------------------------------------
// 2?? Database konekcija
// --------------------------------------------------
// builder.Services.AddDbContext<ApplicationDbContext>(options =>
// {
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
// });
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));


// --------------------------------------------------
// 3?? Identity i korisnici
// --------------------------------------------------
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();
// --------------------------------------------------
// 4?? Repozitoriji
// --------------------------------------------------
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IBlogRepository, BlogRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IBlogImageRepository, BlogImageRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// --------------------------------------------------
// 5?? JWT Autentikacija
// --------------------------------------------------
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
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization();

// --------------------------------------------------
// 6?? CORS (dozvoli sve za testiranje lokalno)
// --------------------------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
       policy.WithOrigins(
        "https://localhost:4200",
        "https://main.d1ahgoahd4te6v.amplifyapp.com"
      )
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();

    });
});


// --------------------------------------------------
// 7?? Build aplikacije
// --------------------------------------------------
var app = builder.Build();

// --------------------------------------------------
// 8?? Seed podataka (role i admin korisnik)
// --------------------------------------------------
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

    // var adminUser = new ApplicationUser
    // {
    //     UserName = "admin",
    //     Email = "admin@example.com",
    //     EmailConfirmed = true
    // };
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
        // ensure the user has Admin role if already exists
        if (!await userManager.IsInRoleAsync(existingAdmin, "Admin"))
        {
            await userManager.AddToRoleAsync(existingAdmin, "Admin");
        }
    }
}

// --------------------------------------------------
// 9?? Middleware pipeline
// --------------------------------------------------
app.UseCors("AllowFrontend");   // MUST be before auth

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")),
    RequestPath = ""
}); 
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
