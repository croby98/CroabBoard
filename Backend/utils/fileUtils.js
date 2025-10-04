import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Upload a file to local storage
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} originalName - Original filename
 * @param {string} fileType - Type of file (image/sound)
 * @param {string} buttonName - Button name for organizing files
 * @returns {Promise<string>} - The filename in storage
 */
export const uploadFileToStorage = async (fileBuffer, originalName, fileType, buttonName) => {
  // Always use local storage (no Firebase Storage)
  const fs = await import('fs/promises');
  
  try {
    const ext = path.extname(originalName);
    const safeButtonName = buttonName.replace(/[^a-zA-Z0-9\s\-_]/g, '_').trim().replace(/\s+/g, '_');
    const filename = `${safeButtonName}_${uuidv4()}${ext}`;
    
    // Create uploads directory structure if it doesn't exist
    const uploadsDir = `uploads/${fileType}s`;
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (err) {
      // Directory might already exist, that's fine
    }
    
    const filePath = path.join(uploadsDir, filename);
    
    // Write file to local uploads folder
    await fs.writeFile(filePath, fileBuffer);
    
    console.log(`✅ File uploaded locally: ${filePath}`);
    return filename;
  } catch (error) {
    console.error('Error uploading file to local storage:', error);
    throw error;
  }
};

/**
 * Delete a file from local storage
 * @param {string} filename - The filename to delete
 * @param {string} fileType - Type of file (image/sound)
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFileFromStorage = async (filename, fileType) => {
  // Delete from local uploads folder
  const fs = await import('fs/promises');
  
  try {
    const filePath = path.join(`uploads/${fileType}s`, filename);
    
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`✅ File deleted locally: ${filePath}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`File ${filePath} does not exist (already deleted)`);
        return true; // Consider it successful since the file is already gone
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file from local storage:', error);
    return false;
  }
};

/**
 * Get the public URL for a file in local storage
 * @param {string} filename - The filename
 * @param {string} fileType - Type of file (image/sound)
 * @returns {string} - Public URL
 */
export const getFileUrl = (filename, fileType) => {
  // All files are served from local uploads folder
  return `http://localhost:5000/uploads/${fileType}s/${filename}`;
};

/**
 * Get content type based on file extension and type
 * @param {string} ext - File extension
 * @param {string} fileType - File type (image/sound)
 * @returns {string} - MIME type
 */
const getContentType = (ext, fileType) => {
  const extension = ext.toLowerCase();
  
  if (fileType === 'image') {
    const imageTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp'
    };
    return imageTypes[extension] || 'image/jpeg';
  } else if (fileType === 'sound') {
    const audioTypes = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
      '.flac': 'audio/flac'
    };
    return audioTypes[extension] || 'audio/mpeg';
  }
  
  return 'application/octet-stream';
};
