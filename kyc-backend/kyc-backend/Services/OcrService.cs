namespace kyc_backend.Services;

/// <summary>
/// STUB OCR implementation — returns placeholder text simulating extracted document data.
///
/// === HOW TO INTEGRATE REAL OCR ===
///
/// Option A — Azure Cognitive Services (Computer Vision Read API):
///   1. Install NuGet: Azure.AI.Vision.ImageAnalysis
///   2. Set "Azure:CognitiveServicesKey" and "Azure:CognitiveServicesEndpoint" in appsettings.json
///   3. Use ImageAnalysisClient with VisualFeatures.Read to extract text
///
/// Option B — Tesseract.NET (free, local):
///   1. Install NuGet: Tesseract
///   2. Download tessdata (language files) from github.com/tesseract-ocr/tessdata
///   3. Use TesseractEngine to process image and return GetText()
/// </summary>
public class OcrService : IOcrService
{
    private readonly ILogger<OcrService> _logger;

    public OcrService(ILogger<OcrService> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc/>
    public Task<string?> ExtractTextAsync(string filePath, string documentType)
    {
        // STUB: Log the request and return simulated OCR output
        _logger.LogInformation("OCR STUB: Processing {DocumentType} at {FilePath}", documentType, filePath);

        // TODO: Replace this block with real OCR API call
        string simulatedText = documentType switch
        {
            "CIN_Front" => "NOM: DUPONT | PRÉNOM: JEAN | CIN: AB123456 | NÉ LE: 01/01/1990",
            "CIN_Back"  => "ADRESSE: 123 RUE EXEMPLE, CASABLANCA | EXPIRE: 01/01/2030",
            "Passport"  => "SURNAME: DUPONT << GIVEN NAMES: JEAN | NATIONALITY: MAR",
            _           => $"[OCR STUB] Text extracted from {documentType}"
        };

        return Task.FromResult<string?>(simulatedText);
    }
}
