using System.IO;

namespace HealthcareAPI.Utils
{
    public static class FileNameHelper
    {
        /// <summary>
        /// Extracts the original filename from a prefixed S3 key.
        /// Assumes the key format is "prefix/some_unique_id_originalfilename.ext".
        /// </summary>
        /// <param name="s3Key">The full key from S3.</param>
        /// <returns>The extracted original filename.</returns>
        public static string GetOriginalFileName(string s3Key)
        {
            if (string.IsNullOrEmpty(s3Key))
            {
                return string.Empty;
            }

            // First, get just the filename part from the full key
            var fileNameWithPrefix = Path.GetFileName(s3Key);

            // Split the string on the first underscore only
            var parts = fileNameWithPrefix.Split('_', 2);

            // If the split was successful, return the second part.
            // Otherwise, fall back to the full filename.
            return parts.Length > 1 ? parts[1] : fileNameWithPrefix;
        }
    }
}