namespace kyc_backend.Services;

/// <summary>
/// STUB facial verification implementation — returns randomized scores simulating a biometric API.
///
/// === HOW TO INTEGRATE REAL FACIAL VERIFICATION ===
///
/// Option A — Azure Face API:
///   1. Install NuGet: Azure.AI.Vision.Face
///   2. Set "Azure:FaceApiKey" and "Azure:FaceApiEndpoint" in appsettings.json
///   3. Use FaceClient.Face.DetectWithStreamAsync then VerifyFaceToFaceAsync
///
/// Option B — AWS Rekognition:
///   1. Install NuGet: AWSSDK.Rekognition
///   2. Use CompareFacesAsync(sourceImage, targetImage) for face matching
///   3. Use DetectFacesRequest with attributes for liveness signals
///
/// Option C — Onfido / Jumio / iProov (SaaS, GDPR compliant):
///   Use their REST APIs — send selfie + ID image and receive scores
/// </summary>
public class FacialVerificationService : IFacialVerificationService
{
    private readonly ILogger<FacialVerificationService> _logger;
    private static readonly Random _random = new();

    public FacialVerificationService(ILogger<FacialVerificationService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc/>
    public Task<(double FacialScore, double LivenessScore)> VerifyAsync(string selfiePath)
    {
        // STUB: Log the request and return simulated biometric scores
        _logger.LogInformation("FACIAL STUB: Verifying selfie at {SelfiePath}", selfiePath);

        // TODO: Replace with real API call (Azure Face API / AWS Rekognition)
        // Simulated scores in range [60, 99] to exercise the scoring tiers
        double facialScore   = Math.Round(60 + _random.NextDouble() * 39, 2);
        double livenessScore = Math.Round(60 + _random.NextDouble() * 39, 2);

        _logger.LogInformation("FACIAL STUB: Scores — Facial: {F}, Liveness: {L}", facialScore, livenessScore);

        return Task.FromResult((facialScore, livenessScore));
    }
}
