
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  uploadBytesResumable,
  UploadTask,
  StorageReference
} from "firebase/storage";
import { storage } from "./firebase";

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Accepted file types
const ALLOWED_FILE_TYPES = {
  'application/pdf': true,               // PDF
  'image/jpeg': true,                    // JPEG
  'image/png': true,                     // PNG
  'image/gif': true,                     // GIF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true, // DOCX
  'application/msword': true,            // DOC
};

// Validate file before upload
export const validateFile = (file: File): { valid: boolean, message?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds the 10MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
    };
  }
  
  // Check file type
  if (!ALLOWED_FILE_TYPES[file.type]) {
    return {
      valid: false,
      message: `File type ${file.type} is not allowed. Please upload PDF, JPEG, PNG, GIF, DOC, or DOCX files.`
    };
  }
  
  return { valid: true };
};

// Upload file to Firebase Storage with progress tracking
export const uploadFile = (userId: string, file: File, folder: string = "files"): { 
  task: UploadTask, 
  fileRef: StorageReference, 
  promise: Promise<{ fileName: string; fileUrl: string; contentType: string; size: number; uploadedAt: string; }>
} => {
  const timestamp = Date.now();
  const fileName = `${userId}/${folder}/${timestamp}_${file.name}`;
  const fileRef = ref(storage, fileName);
  
  // Create upload task
  const uploadTask = uploadBytesResumable(fileRef, file);
  
  // Return uploadTask for progress monitoring, and a promise for completion
  const resultPromise = new Promise<{ fileName: string; fileUrl: string; contentType: string; size: number; uploadedAt: string; }>((resolve, reject) => {
    uploadTask.then(async (snapshot) => {
      try {
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        resolve({
          fileName,
          fileUrl: downloadURL,
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        reject(error);
      }
    }).catch(reject);
  });
  
  return { 
    task: uploadTask, 
    fileRef,
    promise: resultPromise
  };
};

// Get file download URL
export const getFileURL = async (filePath: string) => {
  try {
    const fileRef = ref(storage, filePath);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};

// Delete file from storage
export const deleteFile = async (filePath: string) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// List user files in a folder
export const listUserFiles = async (userId: string, folder: string = "files") => {
  try {
    const folderRef = ref(storage, `${userId}/${folder}`);
    const fileList = await listAll(folderRef);
    
    const fileDetailsPromises = fileList.items.map(async (fileRef) => {
      const url = await getDownloadURL(fileRef);
      return {
        name: fileRef.name,
        fullPath: fileRef.fullPath,
        url
      };
    });
    
    return await Promise.all(fileDetailsPromises);
  } catch (error) {
    console.error("Error listing user files:", error);
    throw error;
  }
};

// Backup user files to another location
export const backupUserFiles = async (userId: string, folderName: string = "files") => {
  try {
    const files = await listUserFiles(userId, folderName);
    const backupFolderName = `backups/${userId}/${new Date().toISOString()}`;
    
    const backupPromises = files.map(async (file) => {
      // Get the original file
      const origFileRef = ref(storage, file.fullPath);
      // Create a reference to the new location
      const newFileName = file.fullPath.split('/').pop();
      const backupFileRef = ref(storage, `${backupFolderName}/${newFileName}`);
      
      // Download the file and upload to new location
      const fileBlob = await fetch(file.url).then(r => r.blob());
      await uploadBytes(backupFileRef, fileBlob);
      
      return {
        originalPath: file.fullPath,
        backupPath: backupFileRef.fullPath
      };
    });
    
    return Promise.all(backupPromises);
  } catch (error) {
    console.error("Error backing up files:", error);
    throw error;
  }
};

export { storage };
