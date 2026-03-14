namespace kyc_backend.Models;

/// <summary>
/// Stores the digital signature image for a KYC customer.
/// The signature is captured as a base64 PNG on the mobile device and stored as an image file.
/// </summary>
public class Signature
{
    public int Id { get; set; }

    /// <summary>Foreign key to the owning Customer</summary>
    public int CustomerId { get; set; }

    /// <summary>Relative path to the stored signature image file</summary>
    public string SignaturePath { get; set; } = string.Empty;

    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Customer? Customer { get; set; }
}
