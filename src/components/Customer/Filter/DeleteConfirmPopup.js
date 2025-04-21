import React from 'react';
import './DeleteConfirmPopup.css';

const DeleteConfirmPopup = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="delete-popup-overlay">
      <div className="delete-popup">
        <div className="delete-popup-content">
          <h2>삭제 확인</h2>
          <p>{itemName}을(를) 삭제하시겠습니까?</p>
          <div className="delete-popup-buttons">
            <button className="delete-btn" onClick={onConfirm}>
              삭제
            </button>
            <button className="cancel-btn" onClick={onClose}>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmPopup; 