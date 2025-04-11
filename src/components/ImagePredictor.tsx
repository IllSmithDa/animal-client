/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import Loader from './Loader/Loader';

export default function ImagePredictor() {
  const [file, setFile] = useState<File>();
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState('');
  const [dogFacts, setDogFacts] = useState('');
  const [spinner, setSpinner] = useState(false);


  function capitalizeWords(str:string) {
    return str.split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
  }


  const select_server = window.location.href === 'http://localhost:5173/animal-client'
    ? 'http://127.0.0.1:8000'
    : 'https://fast-server-udu0.onrender.com';

  const getDogFacts = async (dog_breed:string) => {
    try {
      setSpinner(true);

      const response = await fetch(`${select_server}/huggingface_routes/get_dog_facts/${dog_breed}`, {
        method: 'GET',
      });
      const data = await response.json();
      setDogFacts(data.dog_facts);
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error getting dog facts');
    } finally {
      setSpinner(false);
    }
  }


  const handleFileChange = (e: React.FormEvent) => {
    const target = e.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    if (file) {
      setFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setPrediction('');
      setDogFacts('');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const response = await fetch(`${select_server}/torchvision_routes/predict`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      const value = capitalizeWords(data.prediction);
      setPrediction(value);
      getDogFacts(value)
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error making prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>🐾 Dog Breed AI 🐾</h2>
      <p style={styles.subHeader}>Upload an image and let the AI guess the dog breed!</p>

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
        {loading ? '➤ Predicting...' : '🔍 Identify Dog' }
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
      {dogFacts && (
        <div style={styles.factBox}>
          <strong></strong> {dogFacts}
        </div>
      )}
      {spinner && (
        <Loader />
      )}
    </div>
  );
}

const styles: any = {
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
    cursor: 'pointer',
    color: '#000'
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
  factBox: {
    marginTop: '1.5rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '1.1rem',
    color: '#856404',
    textAlign: 'left',
    lineHeight: '1.5',
    fontFamily: 'Arial, sans-serif',
    fontWeight: '400',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '90%',
    margin: '1rem auto',
    transition: 'transform 0.2s',
  },
  
  'media (max-width: 600px)': {
    container: {
      maxWidth: '90%',
      padding: '1rem',
    },
    header: {
      fontSize: '1.5rem',
    },
    subHeader: {
      fontSize: '0.9rem',
    },
    button: {
      padding: '0.4rem 1rem',
      fontSize: '0.9rem',
    },
    image: {
      maxHeight: '200px',
    },
    predictionBox: {
      fontSize: '1rem',
    },
    factBox: {
      fontSize: '1rem',
    },
  }  
};
