import React, { useState } from 'react';
import { AlertCircle, Upload, FileText, CheckCircle } from 'lucide-react';

const DocumentProcessor = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [documentType, setDocumentType] = useState('drivingLicense');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    try {
      const response = await fetch('http://localhost:5000/api/process-document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Processing failed');
      
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const renderResultField = (label, value) => {
    if (!value) return null;
    return (
      <div className="flex flex-col space-y-1">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-base">{value}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Document Information Extractor</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-gray-700">Document Type</span>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                <option value="drivingLicense">Driving License</option>
              </select>
            </label>

            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Document preview"
                    className="max-h-48 object-contain mb-4"
                  />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
                <span className="text-sm text-gray-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing || !file}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              processing || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {processing ? 'Processing...' : 'Extract Information'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 border rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5 text-green-500" />
              <h2 className="text-xl font-semibold">Extracted Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.extractedInfo).map(([key, value]) => {
                if (key === 'documentType' || key === 'extractedAt' || key === 'confidenceScore') return null;
                return renderResultField(
                  key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                  value
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentProcessor;