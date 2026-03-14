using kyc_backend.Data;
using kyc_backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ─── Database (Entity Framework Core + SQL Server) ───────────────────────────
builder.Services.AddDbContext<KycDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── Application Services ────────────────────────────────────────────────────
builder.Services.AddScoped<IFileStorageService, FileStorageService>();
builder.Services.AddScoped<IOcrService, OcrService>();
builder.Services.AddScoped<IFacialVerificationService, FacialVerificationService>();
builder.Services.AddScoped<IScoringService, ScoringService>();

// ─── CORS (allow all origins for development / Android emulator access) ──────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// ─── Controllers & Swagger ───────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title       = "KYC Digital Onboarding API",
        Version     = "v1",
        Description = "REST API for Know Your Customer (KYC) digital onboarding — handles personal info, document upload, selfie verification, digital signatures, and dossier submission."
    });
});

var app = builder.Build();

// ─── Auto-apply EF Core migrations on startup (dev convenience) ──────────────
// Remove this block in production — use explicit `dotnet ef database update`
using (var scope = app.Services.CreateScope())
{
    var db     = scope.ServiceProvider.GetRequiredService<KycDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        db.Database.Migrate();
        logger.LogInformation("✅ Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex,
            "❌ Could not connect to SQL Server. " +
            "Make sure MSSQL$SQLEXPRESS is running (run as Admin: Start-Service 'MSSQL`$SQLEXPRESS'). " +
            "The API will start but all DB operations will fail.");
    }
}

// ─── HTTP Pipeline ────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "KYC API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at the root
    });
}

// Serve uploaded files as static content (e.g. GET /uploads/documents/xxx.jpg)
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();


app.Run();
