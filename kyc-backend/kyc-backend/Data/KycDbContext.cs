using kyc_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace kyc_backend.Data;

/// <summary>
/// EF Core database context for the KYC application.
/// Manages all four entity types and their relationships.
/// </summary>
public class KycDbContext : DbContext
{
    public KycDbContext(DbContextOptions<KycDbContext> options) : base(options) { }

    public DbSet<Customer> Customers { get; set; }
    public DbSet<Document> Documents { get; set; }
    public DbSet<Biometric> Biometrics { get; set; }
    public DbSet<Signature> Signatures { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Customer
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(c => c.LastName).IsRequired().HasMaxLength(100);
            entity.Property(c => c.CIN).IsRequired().HasMaxLength(20);
            entity.Property(c => c.Phone).IsRequired().HasMaxLength(20);
            entity.Property(c => c.Address).IsRequired().HasMaxLength(500);
            entity.Property(c => c.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
        });

        // Document → Customer (many-to-one)
        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Type).IsRequired().HasMaxLength(50);
            entity.Property(d => d.Path).IsRequired().HasMaxLength(500);
            entity.Property(d => d.Status).IsRequired().HasMaxLength(50).HasDefaultValue("Pending");
            entity.HasOne(d => d.Customer)
                  .WithMany(c => c.Documents)
                  .HasForeignKey(d => d.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Biometric → Customer (one-to-one)
        modelBuilder.Entity<Biometric>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.SelfiePath).IsRequired().HasMaxLength(500);
            entity.HasOne(b => b.Customer)
                  .WithOne(c => c.Biometric)
                  .HasForeignKey<Biometric>(b => b.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Signature → Customer (one-to-one)
        modelBuilder.Entity<Signature>(entity =>
        {
            entity.HasKey(s => s.Id);
            entity.Property(s => s.SignaturePath).IsRequired().HasMaxLength(500);
            entity.HasOne(s => s.Customer)
                  .WithOne(c => c.Signature)
                  .HasForeignKey<Signature>(s => s.CustomerId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
