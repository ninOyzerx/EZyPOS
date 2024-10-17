import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import Swal from 'sweetalert2';

const UploadFace = () => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  // Function to capture the face
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc); // Display the captured image
  };

  // Function to handle face upload
  const handleUpload = async () => {
    if (!image) {
      Swal.fire('Error', 'No face image captured or uploaded.', 'error');
      return;
    }

    setLoading(true);

    try {
      // Send the image to the backend to save it to the database
      const response = await fetch('/api/upload-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }), // Send the captured image
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Success', 'Face image uploaded successfully!', 'success');
      } else {
        Swal.fire('Error', data.message || 'Failed to upload face image.', 'error');
      }
    } catch (error) {
      console.error('Error uploading face:', error);
      Swal.fire('Error', 'An error occurred while uploading your face.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="mb-4 border-2 border-gray-300"
      />

      <button
        onClick={capture}
        className="mb-4 bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
      >
        Capture Face
      </button>

      {image && (
        <div>
          <img src={image} alt="Captured Face" className="mb-4 border-2 border-gray-300" />
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Uploading...' : 'Upload Face'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadFace;
