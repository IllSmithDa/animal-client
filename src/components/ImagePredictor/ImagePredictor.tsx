/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import Loader from '../Loader/Loader';
import './ImagePredictor.css';

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

  // not using huggerface version to save costs
  /*
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
  */
  // using jsongpt version to save costs
  const getFreeDogFacts = async (dog_breed: string) => {
    try {
      setSpinner(true);

      //https://jsongpt.com/api/dogs
      const promptUrl = `https://api.jsongpt.com/json?prompt=Simply give me a short 3 to 4 sentence paragraph about the dog breed ${dog_breed} without any introductions or conclusions. &facts=array of dog facts`

      const response = await fetch(promptUrl, {
        method: 'GET',
      });
      const data = await response.json();
      const dog_facts = data.facts.reduce((acc: string, fact: string) => {
        return acc + ' ' + fact + ' ';
      })
      setDogFacts(dog_facts);
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
      getFreeDogFacts(value)
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error making prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container'>
      <h2 className='header'>🐾 Dog Breed AI 🐾</h2>
      <p className='subHeader'>Upload an image and let the AI guess the dog breed!</p>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className='fileInput'
      />

      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className='button'
        style={{
          opacity: !file || loading ? 0.6 : 1,
          cursor: !file || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '➤ Predicting...' : '🔍 Identify Dog' }
      </button>

      {previewURL && (
        <div className='imageContainer'>
          <img
            src={previewURL}
            alt="Uploaded Preview"
            className='image'
          />
        </div>
      )}

      {prediction && (
        <div className='predictionBox'>
          <strong>Prediction:</strong> {prediction}
        </div>
      )}
      {dogFacts && (
        <div className='factBox'>
          <strong></strong> {dogFacts}
        </div>
      )}
      {spinner && (
        <Loader />
      )}
    </div>
  );
}
