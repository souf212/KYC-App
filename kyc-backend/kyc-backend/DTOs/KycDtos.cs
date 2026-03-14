namespace kyc_backend.DTOs;

// ─── Request DTOs ────────────────────────────────────────────────────────────

/// <summary>Payload for POST /api/kyc/customer</summary>
public class CreateCustomerRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string CIN { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}

// ─── Response DTOs ───────────────────────────────────────────────────────────

/// <summary>Response for POST /api/kyc/customer</summary>
public class CustomerResponse
{
    public int CustomerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>Response for POST /api/kyc/document</summary>
public class UploadDocumentResponse
{
    public int DocumentId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? OcrText { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>Response for POST /api/kyc/selfie</summary>
public class SelfieResponse
{
    public int BiometricId { get; set; }
    public double FacialScore { get; set; }
    public double LivenessScore { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>Response for POST /api/kyc/signature</summary>
public class SignatureResponse
{
    public int SignatureId { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>Response for POST /api/kyc/submit</summary>
public class SubmitResponse
{
    public int CustomerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Decision { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
