namespace kyc_backend.Services;

/// <summary>
/// Stub interface for OCR (Optical Character Recognition) processing.
///
/// STUB IMPLEMENTATION — Replace with real OCR provider:
///   • Azure Cognitive Services: Computer Vision Read API
///   • Tesseract.NET (local, open-source)
///   • AWS Textract
///   • Google Vision API
/// </summary>
public interface IOcrService
{
    /// <summary>
    /// Extracts text from a document image.
    /// </summary>
    /// <param name="filePath">Absolute path to the image file on disk.</param>
    /// <param name="documentType">Type of document (CIN_Front, Passport, etc.).</param>
    /// <returns>Extracted text content, or null if extraction fails.</returns>
    Task<string?> ExtractTextAsync(string filePath, string documentType);
}
