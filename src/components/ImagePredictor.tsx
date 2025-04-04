/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';

export default function ImagePredictor() {
  const [file, setFile] = useState<File>();
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState('');
  const select_server = window.location.href === 'http://localhost:5173/animal-client'
    ? 'http://127.0.0.1:8000'
    : 'https://fast-server-udu0.onrender.com';

  const handleFileChange = (e: React.FormEvent) => {
    const target = e.target as HTMLInputElement;
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
    <div style={styles.container}>
      <h2 style={styles.header}>🐾 Animal Classifier AI 🐾</h2>
      <p style={styles.subHeader}>Upload an image and let the AI guess the animal!</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={styles.fileInput}
      />

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        style={{
          ...styles.button,
          opacity: !file || loading ? 0.6 : 1,
          cursor: !file || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '➤ Predicting...' : '🔍 Identify Animal' }
      </button>

      {previewURL && (
        <div style={styles.imageContainer}>
          <img
            src={previewURL}
            alt="Uploaded Preview"
            style={styles.image}
          />
        </div>
      )}

      {prediction && (
        <div style={styles.predictionBox}>
          <strong>Prediction:</strong> {prediction}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '480px',
    margin: '2rem auto',
    padding: '2rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f0f8ff, #e6f7ff)',
    borderRadius: '12px',
    boxShadow: '0 0 12px rgba(0,0,0,0.1)',
  },
  header: {
    fontSize: '1.8rem',
    marginBottom: '0.5rem',
    color: '#333',
    margin: 'auto',
  },
  subHeader: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '1.5rem',
  },
  fileInput: {
    margin: '1rem 0',
    padding: '0.4rem',
    border: '1px solid #ccc',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  button: {
    backgroundColor: '#0066ff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1.4rem',
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'background-color 0.2s',
  },
  imageContainer: {
    marginTop: '1.5rem',
  },
  image: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  predictionBox: {
    marginTop: '1.5rem',
    backgroundColor: '#f4faff',
    border: '1px solid #b3daff',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    color: '#004085',
  },
};
