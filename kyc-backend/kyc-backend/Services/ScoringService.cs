namespace kyc_backend.Services;

/// <summary>
/// Computes an overall KYC decision using a tiered scoring model.
///
/// Tiers:
///   ✅ Automatic Approval  — facialScore ≥ 80 AND livenessScore ≥ 75 AND documentCount ≥ 2
///   ⚠️ Manual Review       — facialScore ≥ 60 AND livenessScore ≥ 60 (human agent reviews)
///   ❌ Automatic Rejection — scores below minimum thresholds
/// </summary>
public class ScoringService : IScoringService
{
    // Configurable thresholds (can be moved to appsettings.json)
    private const double AutoApproveMinFacial    = 80.0;
    private const double AutoApproveMinLiveness  = 75.0;
    private const int    AutoApproveMinDocuments = 2;

    private const double ManualReviewMinFacial   = 60.0;
    private const double ManualReviewMinLiveness = 60.0;

    /// <inheritdoc/>
    public string ComputeStatus(double facialScore, double livenessScore, int documentCount)
    {
        // Tier 1: Automatic Approval
        if (facialScore >= AutoApproveMinFacial
            && livenessScore >= AutoApproveMinLiveness
            && documentCount >= AutoApproveMinDocuments)
        {
            return "Approved";
        }

        // Tier 2: Manual Review
        if (facialScore >= ManualReviewMinFacial && livenessScore >= ManualReviewMinLiveness)
        {
            return "ManualReview";
        }

        // Tier 3: Automatic Rejection
        return "Rejected";
    }
}
