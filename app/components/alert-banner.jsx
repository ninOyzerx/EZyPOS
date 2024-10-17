
import React, { useEffect, useState } from 'react';

const AlertBanner = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div className={`alert-banner ${isVisible ? 'show' : ''}`}>
      {message}
      <button onClick={onClose} aria-label="Close Alert">×</button>
    </div>
  );
};

export default AlertBanner;
