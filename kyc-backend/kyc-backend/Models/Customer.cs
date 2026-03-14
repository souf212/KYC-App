namespace kyc_backend.Models;

/// <summary>
/// Represents a KYC applicant (customer) in the system.
/// Status values: Pending | UnderReview | Approved | Rejected
/// </summary>
public class Customer
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    /// <summary>CIN = Carte d'Identité Nationale (national ID number)</summary>
    public string CIN { get; set; } = string.Empty;

    public DateTime BirthDate { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    /// <summary>KYC lifecycle status: Pending → UnderReview → Approved/Rejected</summary>
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public Biometric? Biometric { get; set; }
    public Signature? Signature { get; set; }
}
