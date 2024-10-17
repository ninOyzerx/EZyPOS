// components/TaxSelectModal.js
import React from 'react';

const TaxSelectModal = ({ isOpen, onClose, taxes, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>เลือกภาษี</h2>
        <ul>
          {taxes.map(tax => (
            <li key={tax.id} onClick={() => onSelect(tax)}>
              {tax.name} - {tax.rate}% {tax.fixed_amount > 0 && `(-฿${tax.fixed_amount})`}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>ปิด</button>
      </div>
    </div>
  );
};

export default TaxSelectModal;
