namespace kyc_backend.Models;

/// <summary>
/// Stores biometric data (selfie + facial verification scores) for a KYC customer.
/// FacialScore: 0-100, measures similarity between selfie and ID document photo.
/// LivenessScore: 0-100, measures anti-spoofing liveness detection confidence.
/// </summary>
public class Biometric
{
    public int Id { get; set; }

    /// <summary>Foreign key to the owning Customer</summary>
    public int CustomerId { get; set; }

    /// <summary>Relative path to the stored selfie file</summary>
    public string SelfiePath { get; set; } = string.Empty;

    /// <summary>
    /// Face similarity score (0-100).
    /// Stub: random value. Replace with Azure Face API / DeepFace / AWS Rekognition.
    /// </summary>
    public double FacialScore { get; set; }

    /// <summary>
    /// Liveness detection score (0-100).
    /// Stub: random value. Replace with a real liveness detection API.
    /// </summary>
    public double LivenessScore { get; set; }

    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Customer? Customer { get; set; }
}
