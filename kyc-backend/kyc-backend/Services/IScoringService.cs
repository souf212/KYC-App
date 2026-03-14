namespace kyc_backend.Services;

/// <summary>
/// Determines the KYC decision based on biometric scores and document count.
/// Implements a tiered scoring model:
///   • Automatic Approval: facial ≥ 80 &amp;&amp; liveness ≥ 75 &amp;&amp; documents ≥ 2
///   • Manual Review:    facial ≥ 60 &amp;&amp; liveness ≥ 60
///   • Automatic Rejection: below thresholds
/// </summary>
public interface IScoringService
{
    /// <summary>
    /// Computes KYC status from available scores.
    /// </summary>
    /// <param name="facialScore">Facial match score (0-100).</param>
    /// <param name="livenessScore">Liveness detection score (0-100).</param>
    /// <param name="documentCount">Number of successfully uploaded documents.</param>
    /// <returns>Status string: "Approved" | "ManualReview" | "Rejected"</returns>
    string ComputeStatus(double facialScore, double livenessScore, int documentCount);
}
