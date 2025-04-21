import React, { useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import DeleteConfirmPopup from '../../components/Customer/Filter/DeleteConfirmPopup';
import './Editclass.css'

// 색상 선택지
const colorOptions = [
  { label: 'Blue', value: '#dbe4ff' },
  { label: 'Pink', value: '#fde2e2' },
  { label: 'Yellow', value: '#fff3b0' },
  { label: 'Mint', value: '#cbf1f5' },
];

// 더미 데이터
const initialDefectData = [
  { name: 'Scratch', color: '#dbe4ff' },
  { name: 'Burr', color: '#fde2e2' },
  { name: 'Crack', color: '#fff3b0' },
  { name: 'Paticle', color: '#cbf1f5' },
  { name: 'Dent', color: '#c4c4c4' },
]; 

const Editclass = () => {
  const [defectData, setDefectData] = useState(initialDefectData);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingName(defectData[index].name);
    setShowColorPicker(false);
  };

  const handleNameSave = () => {
    if (editingName.trim() === '') return;
    
    const newData = [...defectData];
    newData[editingIndex] = {
      ...newData[editingIndex],
      name: editingName
    };
    setDefectData(newData);
    setEditingIndex(null);
  };

  const handleColorChange = (color) => {
    const newData = [...defectData];
    newData[editingIndex] = {
      ...newData[editingIndex],
      color: color
    };
    setDefectData(newData);
    setShowColorPicker(false);
    setEditingIndex(null);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
  };

  const handleDeleteConfirm = () => {
    const newData = defectData.filter((_, index) => index !== deleteIndex);
    setDefectData(newData);
    setDeleteIndex(null);
  };

  const handleDeleteCancel = () => {
    setDeleteIndex(null);
  };

  return (
    <CustomerLayout>
      <div className="editclass-container">
        <button className="add-button">Add New Detect</button>

        <table className="defect-table">
          <thead>
            <tr>
              <th className="th-type">Defect Type</th>
              <th>Box Color</th>
              <th>Setting</th>
            </tr>
          </thead>
          <tbody>
            {defectData.map((item, index) => (
              <tr key={index} className="defect-row">
                <td className="td-type">
                  {editingIndex === index ? (
                    <div className="edit-name-container">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="edit-name-input"
                      />
                      <button onClick={handleNameSave} className="save-btn">저장</button>
                    </div>
                  ) : (
                    item.name
                  )}
                </td>
                <td className="td-color">
                  <div className="color-wrapper">
                    {editingIndex === index && showColorPicker ? (
                      <div className="color-picker">
                        {colorOptions.map((option) => (
                          <div
                            key={option.value}
                            className="color-option"
                            style={{ backgroundColor: option.value }}
                            onClick={() => handleColorChange(option.value)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className="color-box"
                        style={{ backgroundColor: item.color }}
                        onClick={() => {
                          if (editingIndex === index) {
                            setShowColorPicker(true);
                          }
                        }}
                      />
                    )}
                  </div>
                </td>
                <td className="td-setting">
                  <div className="setting-buttons">
                    <button 
                      className="setting-btn"
                      onClick={() => handleEdit(index)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="setting-btn"
                      onClick={() => handleDelete(index)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <DeleteConfirmPopup
          isOpen={deleteIndex !== null}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          itemName={deleteIndex !== null ? defectData[deleteIndex].name : ''}
        />
      </div>
    </CustomerLayout>
  );
};

export default Editclass;

