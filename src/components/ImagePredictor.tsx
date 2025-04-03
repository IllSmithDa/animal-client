/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'


 const select_server =  window.location.href === 'http://localhost:5173/animal-client' ? "http://127.0.0.1:8000" : "https://fast-server-udu0.onrender.com";

export default function ImagePredictor() {
  const [file, setFile] = useState<File>();
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState('');

  const handleFileChange = (e: React.FormEvent) => {
    const target= e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    if (file) {
      setFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setPrediction('');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await fetch(`${select_server}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setPrediction(data.prediction);
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error making prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem', margin: 'auto' }}>
      <h2>Can this AI model tell what animal this is?</h2>
      <h3>Select a image file to find out!</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br /> <br />
      <button onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Predicting...' : 'Idenity Animal'}
      </button>
      <br /> <br />
      {previewURL && (
        <img
          src={previewURL}
          alt="Uploaded Preview"
          style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }}
        />
      )}
      {prediction && (
        <div style={{ marginTop: '1rem' }}>
            <strong>Animal:</strong> {prediction}
        </div>
      )}
    </div>
  );
}
