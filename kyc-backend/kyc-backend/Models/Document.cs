namespace kyc_backend.Models;

/// <summary>
/// Represents a scanned or uploaded document for a KYC customer.
/// Type values: CIN_Front | CIN_Back | Passport | UtilityBill | ProofOfAddress
/// Status values: Pending | Verified | Rejected
/// </summary>
public class Document
{
    public int Id { get; set; }

    /// <summary>Foreign key to the owning Customer</summary>
    public int CustomerId { get; set; }

    /// <summary>Document type: CIN_Front, CIN_Back, Passport, UtilityBill, ProofOfAddress</summary>
    public string Type { get; set; } = string.Empty;

    /// <summary>Relative path to the stored file on disk (e.g. uploads/documents/file.jpg)</summary>
    public string Path { get; set; } = string.Empty;

    /// <summary>Verification status: Pending | Verified | Rejected</summary>
    public string Status { get; set; } = "Pending";

    /// <summary>Extracted text from OCR (stub — populated by OcrService)</summary>
    public string? OcrText { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Customer? Customer { get; set; }
}
