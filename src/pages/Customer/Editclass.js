import React, { useState } from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import DeleteConfirmPopup from '../../components/Customer/Filter/DeleteConfirmPopup';
import './Editclass.css'

// 색상 선택지
const colorOptions = [
  { label: 'Blue', value: '#2c3efd' },
  { label: 'Pink', value: '#ff6b6b' },
  { label: 'Yellow', value: '#ffd700' },
  { label: 'Mint', value: '#5CFFD1' },
  { label: 'Red', value: '#ff0000' },
  { label: 'Green', value: '#00ff00' },
  { label: 'Gray', value: '#c4c4c4' },
];

// 더미 데이터
const initialDefectData = [
  { name: 'Scratch', color: '#2c3efd' },
  { name: 'Burr', color: '#ff6b6b' },
  { name: 'Crack', color: '#ffd700' },
  { name: 'Paticle', color: '#5CFFD1' },
  { name: 'Dent', color: '#ff0000' },
]; 

const Editclass = () => {
  const [defectData, setDefectData] = useState(initialDefectData);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingName(defectData[index].name);
    setShowColorPicker(false);
    setIsNewRow(false);
  };

  const handleNameSave = () => {
    if (editingName.trim() === '') return;
    
    const newData = [...defectData];
    newData[editingIndex] = {
      ...newData[editingIndex],
      name: editingName
    };
    setDefectData(newData);
    
    if (!isNewRow) {
      setEditingIndex(null);
    } else {
      setShowColorPicker(true);
    }
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
    setIsNewRow(false);
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

  const handleAddNewDefect = () => {
    const newDefect = { name: '', color: '#dbe4ff' };
    const newIndex = defectData.length;
    setDefectData([...defectData, newDefect]);
    setEditingIndex(newIndex);
    setEditingName('');
    setShowColorPicker(false);
    setIsNewRow(true);
  };

  return (
    <CustomerLayout>
      <div className="editclass-container">
        <button className="edit-add-button" onClick={handleAddNewDefect}>Add New Defect</button>
        <div className="edit-table-wrapper">
          <table className="edit-defect-table">
            <thead>
              <tr>
                <th className="edit-th-type">Defect Type</th>
                <th>Box Color</th>
                <th>Setting</th>
              </tr>
            </thead>
            
            <tbody>
              {defectData.map((item, index) => (
                <tr key={index} className="edit-defect-row">
                  <td className="edit-td-type">
                    {editingIndex === index ? (
                      <div className="edit-name-container">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="edit-name-input"
                          placeholder="Enter defect type"
                          autoFocus
                        />
                        <button onClick={handleNameSave} className="edit-save-btn">저장</button>
                      </div>
                    ) : (
                      item.name || '(이름 없음)'
                    )}
                  </td>
                  <td className="edit-td-color">
                    <div className="edit-color-wrapper">
                      {editingIndex === index && showColorPicker ? (
                        <div className="edit-color-picker">
                          {colorOptions.map((option) => (
                            <div
                              key={option.value}
                              className="edit-color-option"
                              style={{ backgroundColor: option.value }}
                              onClick={() => handleColorChange(option.value)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div
                          className="edit-color-box"
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
                  <td className="edit-td-setting">
                    <div className="edit-setting-buttons">
                      <button 
                        className="edit-setting-btn"
                        onClick={() => handleEdit(index)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="edit-setting-btn"
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
      </div>
    </CustomerLayout>
  );
};

export default Editclass;

