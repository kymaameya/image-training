import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ImageUploader = () => {
  const [files, setFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus('Uploading...');

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const response = await axios.post('http://localhost:3001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(response.data);
      setUploadStatus('Upload successful!');
    } catch (error) {
      console.error(error);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  // (Optional) Clean up URLs when files change or on unmount
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        URL.revokeObjectURL(file);
      });
    };
  }, [files]);

  return (
    <div className="uploader-container">
      <h2>Upload Image Folder</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          webkitdirectory="true"
          multiple
          onChange={handleFileChange}
          className="folder-input"
        />
        <button type="submit" className="upload-button">Upload</button>
      </form>

      {uploadStatus && <p className="status-message">{uploadStatus}</p>}

      <h3>Preview:</h3>
      <ul className="file-list">
        {files.map((file, index) => {
          const previewUrl = URL.createObjectURL(file);
          return (
            <li key={index}>
              <img src={previewUrl} alt={file.name} className="preview-image" />
              <p>{file.name}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ImageUploader;
