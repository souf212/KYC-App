namespace kyc_backend.Services;

/// <summary>
/// Stub interface for facial verification (face matching + liveness detection).
///
/// STUB IMPLEMENTATION — Replace with real biometric provider:
///   • Azure Face API (face.azure.com)
///   • AWS Rekognition (DetectFaces, CompareFaces)
///   • DeepFace library (local Python service)
///   • iProov / Onfido / Jumio SDKs
/// </summary>
public interface IFacialVerificationService
{
    /// <summary>
    /// Compares a selfie against a reference ID photo and checks for liveness.
    /// </summary>
    /// <param name="selfiePath">Absolute path to the captured selfie image.</param>
    /// <returns>Tuple of (FacialScore 0-100, LivenessScore 0-100).</returns>
    Task<(double FacialScore, double LivenessScore)> VerifyAsync(string selfiePath);
}
