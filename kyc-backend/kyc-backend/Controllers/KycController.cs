using kyc_backend.Data;
using kyc_backend.DTOs;
using kyc_backend.Models;
using kyc_backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kyc_backend.Controllers;

/// <summary>
/// Main KYC API controller.
/// Handles the full digital onboarding flow:
///   1. POST /customer  — Register personal info
///   2. POST /document  — Upload identity documents
///   3. POST /selfie    — Upload biometric selfie
///   4. POST /signature — Upload digital signature
///   5. POST /submit    — Finalize dossier and compute status
/// </summary>
[ApiController]
[Route("api/kyc")]
[Produces("application/json")]
public class KycController : ControllerBase
{
    private readonly KycDbContext _db;
    private readonly IFileStorageService _fileStorage;
    private readonly IOcrService _ocr;
    private readonly IFacialVerificationService _facialVerification;
    private readonly IScoringService _scoring;
    private readonly ILogger<KycController> _logger;

    public KycController(
        KycDbContext db,
        IFileStorageService fileStorage,
        IOcrService ocr,
        IFacialVerificationService facialVerification,
        IScoringService scoring,
        ILogger<KycController> logger)
    {
        _db = db;
        _fileStorage = fileStorage;
        _ocr = ocr;
        _facialVerification = facialVerification;
        _scoring = scoring;
        _logger = logger;
    }

    // ─── 1. POST /api/kyc/customer ───────────────────────────────────────────

    /// <summary>
    /// Registers a new KYC customer with personal information.
    /// Returns a customerId that must be used in all subsequent requests.
    /// </summary>
    [HttpPost("customer")]
    [ProducesResponseType(typeof(CustomerResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerRequest request)
    {
        // Validate required fields
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (string.IsNullOrWhiteSpace(request.CIN) || request.CIN.Length < 6)
            return BadRequest(new { error = "CIN must be at least 6 characters." });

        // Prevent duplicate CIN registrations
        bool exists = await _db.Customers.AnyAsync(c => c.CIN == request.CIN);
        if (exists)
            return Conflict(new { error = "A customer with this CIN already exists." });

        var customer = new Customer
        {
            FirstName = request.FirstName.Trim(),
            LastName  = request.LastName.Trim(),
            CIN       = request.CIN.Trim().ToUpper(),
            BirthDate = request.BirthDate,
            Phone     = request.Phone.Trim(),
            Address   = request.Address.Trim(),
            Status    = "Pending"
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        _logger.LogInformation("New customer created: Id={Id}, CIN={CIN}", customer.Id, customer.CIN);

        return CreatedAtAction(nameof(CreateCustomer), new CustomerResponse
        {
            CustomerId = customer.Id,
            Status     = customer.Status,
            Message    = "Customer registered successfully."
        });
    }

    // ─── 2. POST /api/kyc/document ───────────────────────────────────────────

    /// <summary>
    /// Uploads a scanned document (CIN, Passport, utility bill, etc.).
    /// Saves the file to disk and runs OCR (stub) on it.
    /// Accepts multipart/form-data with fields: customerId, type, file
    /// </summary>
    [HttpPost("document")]
    [RequestSizeLimit(20 * 1024 * 1024)] // 20 MB limit
    [ProducesResponseType(typeof(UploadDocumentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadDocument(
        [FromForm] int customerId,
        [FromForm] string type,
        IFormFile file)
    {
        // Validate customer exists
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer is null)
            return NotFound(new { error = $"Customer {customerId} not found." });

        // Validate input
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No file provided." });

        if (string.IsNullOrWhiteSpace(type))
            return BadRequest(new { error = "Document type is required." });

        // Validate allowed file types
        string[] allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
        string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { error = $"File type '{ext}' not allowed. Use: {string.Join(", ", allowedExtensions)}" });

        // Save the file to disk
        string relativePath = await _fileStorage.SaveFileAsync(file, "documents");

        // Run OCR stub on the uploaded document
        string absolutePath = _fileStorage.GetAbsolutePath(relativePath);
        string? ocrText = await _ocr.ExtractTextAsync(absolutePath, type);

        // Persist document record in DB
        var document = new Document
        {
            CustomerId = customerId,
            Type       = type,
            Path       = relativePath,
            Status     = "Pending",
            OcrText    = ocrText
        };

        _db.Documents.Add(document);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Document uploaded: Id={Id}, Type={Type}, CustomerId={CustomerId}",
            document.Id, document.Type, document.CustomerId);

        return CreatedAtAction(nameof(UploadDocument), new UploadDocumentResponse
        {
            DocumentId = document.Id,
            Type       = document.Type,
            Status     = document.Status,
            OcrText    = ocrText,
            Message    = "Document uploaded successfully."
        });
    }

    // ─── 3. POST /api/kyc/selfie ─────────────────────────────────────────────

    /// <summary>
    /// Uploads a selfie for facial verification.
    /// Runs facial match and liveness detection stubs.
    /// Accepts multipart/form-data with fields: customerId, file
    /// </summary>
    [HttpPost("selfie")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB limit
    [ProducesResponseType(typeof(SelfieResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadSelfie(
        [FromForm] int customerId,
        IFormFile file)
    {
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer is null)
            return NotFound(new { error = $"Customer {customerId} not found." });

        if (file is null || file.Length == 0)
            return BadRequest(new { error = "No selfie file provided." });

        // Save selfie to disk
        string relativePath = await _fileStorage.SaveFileAsync(file, "selfies");

        // Run facial verification stub (returns random scores)
        string absolutePath = _fileStorage.GetAbsolutePath(relativePath);
        var (facialScore, livenessScore) = await _facialVerification.VerifyAsync(absolutePath);

        // Upsert biometric record (replace if selfie re-submitted)
        var existing = await _db.Biometrics.FirstOrDefaultAsync(b => b.CustomerId == customerId);
        if (existing is not null)
        {
            existing.SelfiePath    = relativePath;
            existing.FacialScore   = facialScore;
            existing.LivenessScore = livenessScore;
            existing.CapturedAt    = DateTime.UtcNow;
        }
        else
        {
            var biometric = new Biometric
            {
                CustomerId   = customerId,
                SelfiePath   = relativePath,
                FacialScore  = facialScore,
                LivenessScore = livenessScore
            };
            _db.Biometrics.Add(biometric);
        }

        await _db.SaveChangesAsync();
        var saved = await _db.Biometrics.FirstAsync(b => b.CustomerId == customerId);

        _logger.LogInformation("Selfie uploaded for CustomerId={Id}, FacialScore={F}, Liveness={L}",
            customerId, facialScore, livenessScore);

        return CreatedAtAction(nameof(UploadSelfie), new SelfieResponse
        {
            BiometricId  = saved.Id,
            FacialScore  = facialScore,
            LivenessScore = livenessScore,
            Message      = "Selfie uploaded and facial verification completed (stub)."
        });
    }

    // ─── 4. POST /api/kyc/signature ──────────────────────────────────────────

    /// <summary>
    /// Uploads a digital signature.
    /// Accepts multipart/form-data with fields: customerId, signatureBase64 (string) OR file (IFormFile).
    /// </summary>
    [HttpPost("signature")]
    [ProducesResponseType(typeof(SignatureResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadSignature(
        [FromForm] int customerId,
        [FromForm] string? signatureBase64,
        IFormFile? file)
    {
        var customer = await _db.Customers.FindAsync(customerId);
        if (customer is null)
            return NotFound(new { error = $"Customer {customerId} not found." });

        string relativePath;

        if (!string.IsNullOrWhiteSpace(signatureBase64))
        {
            // Handle base64-encoded signature from mobile canvas
            // Strip data URI prefix if present (e.g. "data:image/png;base64,...")
            string base64Data = signatureBase64.Contains(',')
                ? signatureBase64.Split(',')[1]
                : signatureBase64;

            byte[] imageBytes = Convert.FromBase64String(base64Data);
            relativePath = await _fileStorage.SaveBytesAsync(imageBytes, "signatures", "signature.png");
        }
        else if (file is not null && file.Length > 0)
        {
            // Handle raw file upload
            relativePath = await _fileStorage.SaveFileAsync(file, "signatures");
        }
        else
        {
            return BadRequest(new { error = "Provide either signatureBase64 or a file." });
        }

        // Upsert signature record
        var existing = await _db.Signatures.FirstOrDefaultAsync(s => s.CustomerId == customerId);
        if (existing is not null)
        {
            existing.SignaturePath = relativePath;
            existing.CapturedAt   = DateTime.UtcNow;
        }
        else
        {
            _db.Signatures.Add(new Signature { CustomerId = customerId, SignaturePath = relativePath });
        }

        await _db.SaveChangesAsync();
        var saved = await _db.Signatures.FirstAsync(s => s.CustomerId == customerId);

        return CreatedAtAction(nameof(UploadSignature), new SignatureResponse
        {
            SignatureId = saved.Id,
            Message     = "Signature saved successfully."
        });
    }

    // ─── 5. POST /api/kyc/submit ─────────────────────────────────────────────

    /// <summary>
    /// Finalizes the KYC dossier for a customer.
    /// Computes the final KYC status based on documents, biometric scores, and signature.
    /// Returns: Approved | ManualReview | Rejected
    /// Body: { "customerId": 1 }
    /// </summary>
    [HttpPost("submit")]
    [ProducesResponseType(typeof(SubmitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Submit([FromBody] SubmitRequest request)
    {
        // Load customer with all related data
        var customer = await _db.Customers
            .Include(c => c.Documents)
            .Include(c => c.Biometric)
            .Include(c => c.Signature)
            .FirstOrDefaultAsync(c => c.Id == request.CustomerId);

        if (customer is null)
            return NotFound(new { error = $"Customer {request.CustomerId} not found." });

        // Validate that minimum required data is present
        if (customer.Biometric is null)
            return BadRequest(new { error = "Selfie is required before submission." });

        if (!customer.Documents.Any())
            return BadRequest(new { error = "At least one document must be uploaded before submission." });

        if (customer.Signature is null)
            return BadRequest(new { error = "Signature is required before submission." });

        // Compute KYC decision using scoring service
        string decision = _scoring.ComputeStatus(
            customer.Biometric.FacialScore,
            customer.Biometric.LivenessScore,
            customer.Documents.Count);

        // Update customer status
        customer.Status = decision;
        await _db.SaveChangesAsync();

        _logger.LogInformation("KYC submitted for CustomerId={Id}, Decision={Decision}", customer.Id, decision);

        string message = decision switch
        {
            "Approved"     => "Your KYC application has been automatically approved. Welcome!",
            "ManualReview" => "Your application is under review by our compliance team.",
            "Rejected"     => "Your application could not be approved. Please contact support.",
            _              => "Status updated."
        };

        return Ok(new SubmitResponse
        {
            CustomerId = customer.Id,
            Status     = decision,
            Decision   = decision,
            Message    = message
        });
    }
}

/// <summary>Request body for POST /api/kyc/submit</summary>
public class SubmitRequest
{
    public int CustomerId { get; set; }
}
