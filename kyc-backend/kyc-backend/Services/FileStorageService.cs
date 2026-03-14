namespace kyc_backend.Services;

/// <summary>
/// Saves uploaded files to the local file system.
/// Files are stored under the configured base path in subfolders by type:
///   - uploads/documents/
///   - uploads/selfies/
///   - uploads/signatures/
///
/// To switch to Azure Blob Storage:
///   1. Add NuGet: Azure.Storage.Blobs
///   2. Replace File.WriteAllBytesAsync with BlobClient.UploadAsync
///   3. Return the blob URL instead of a relative path
/// </summary>
public class FileStorageService : IFileStorageService
{
    private readonly string _basePath;

    public FileStorageService(IConfiguration configuration)
    {
        // Read from appsettings.json → FileStorage:BasePath
        _basePath = configuration["FileStorage:BasePath"]
                    ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        // Ensure base directory exists on application startup
        Directory.CreateDirectory(_basePath);
    }

    /// <inheritdoc/>
    public async Task<string> SaveFileAsync(IFormFile file, string subfolder)
    {
        // Ensure the subfolder exists
        string folderPath = Path.Combine(_basePath, subfolder);
        Directory.CreateDirectory(folderPath);

        // Generate a unique file name to avoid collisions
        string uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
        string absolutePath = Path.Combine(folderPath, uniqueFileName);

        // Stream the uploaded file to disk
        await using var stream = new FileStream(absolutePath, FileMode.Create);
        await file.CopyToAsync(stream);

        // Return relative path for storage in the DB
        return Path.Combine("uploads", subfolder, uniqueFileName).Replace('\\', '/');
    }

    /// <inheritdoc/>
    public async Task<string> SaveBytesAsync(byte[] data, string subfolder, string fileName)
    {
        string folderPath = Path.Combine(_basePath, subfolder);
        Directory.CreateDirectory(folderPath);

        string uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        string absolutePath = Path.Combine(folderPath, uniqueFileName);

        await File.WriteAllBytesAsync(absolutePath, data);

        return Path.Combine("uploads", subfolder, uniqueFileName).Replace('\\', '/');
    }

    /// <inheritdoc/>
    public string GetAbsolutePath(string relativePath)
    {
        // Convert relative DB path back to absolute physical path
        return Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);
    }
}
