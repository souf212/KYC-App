namespace kyc_backend.Services;

/// <summary>
/// Service responsible for persisting uploaded files to local disk storage.
/// Files are organized by subfolder (documents, selfies, signatures).
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Saves an uploaded file stream to the specified subfolder.
    /// </summary>
    /// <param name="file">The uploaded form file.</param>
    /// <param name="subfolder">Subfolder name under the base storage path (e.g. "documents").</param>
    /// <returns>The relative file path stored in the database.</returns>
    Task<string> SaveFileAsync(IFormFile file, string subfolder);

    /// <summary>
    /// Saves raw bytes (e.g. base64-decoded signature image) to disk.
    /// </summary>
    Task<string> SaveBytesAsync(byte[] data, string subfolder, string fileName);

    /// <summary>Returns the absolute physical path for a relative stored path.</summary>
    string GetAbsolutePath(string relativePath);
}
