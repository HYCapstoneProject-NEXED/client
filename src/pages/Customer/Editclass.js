import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import DeleteConfirmPopup from '../../components/Customer/Filter/DeleteConfirmPopup';
import './Editclass.css'

const BASE_URL = process.env.REACT_APP_API_URL;

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

const Editclass = () => {
  const [defectData, setDefectData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isNewRow, setIsNewRow] = useState(false);
  const [error, setError] = useState(null);

  const fetchDefectClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/defect-classes`);
      const mapped = res.data.map(item => ({
        id: item.class_id,
        name: item.class_name,
        color: item.class_color,
      }));
      setDefectData(mapped);
      setError(null);
    } catch (error) {
      if (error.response) {
        console.error('서버 오류:', error.response.data);
        setError(`서버 오류: ${error.response.data.message || '결함 목록을 불러오는데 실패했습니다.'}`);
      } else {
        console.error('요청 오류:', error.message);
        setError('네트워크 오류: 서버에 연결할 수 없습니다.');
      }
      setDefectData([]);
    }
  };

  useEffect(() => {
    fetchDefectClasses();
  }, []);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingName(defectData[index].name);
    setEditingColor(defectData[index].color);
    setShowColorPicker(false);
    setIsNewRow(false);
  };

  const handleAddNewDefect = () => {
    const newDefect = { name: '', color: '' };
    const newIndex = defectData.length;
    setDefectData([...defectData, newDefect]);
    setEditingIndex(newIndex);
    setEditingName('');
    setEditingColor('');
    setShowColorPicker(true);
    setIsNewRow(true);
    setError(null);
  };

  const handleNameSave = async () => {
    // 이름에서 앞뒤 공백만 제거하고, 중간의 언더바는 유지
    const trimmedName = editingName.trim();
    
    if (!trimmedName) {
      setError('결함 이름은 필수입니다.');
      return;
    }

    // 허용되는 문자 패턴 검사 (영문, 숫자, 언더바, 한글 허용)
    const namePattern = /^[A-Za-z0-9_가-힣\s]+$/;
    if (!namePattern.test(trimmedName)) {
      setError('결함 이름은 영문, 숫자, 언더바(_), 한글만 사용할 수 있습니다.');
      return;
    }

    if (isNewRow && !editingColor) {
      setError('색상을 선택해주세요.');
      return;
    }

    const currentDefect = defectData[editingIndex];
    const backendFormat = {
      class_name: trimmedName,
      class_color: isNewRow ? editingColor : (currentDefect?.color || '#dbe4ff')
    };

    try {
      if (isNewRow) {
        console.log('Sending data to server:', backendFormat);
        await axios.post(`${BASE_URL}/defect-classes`, backendFormat);
      } else {
        const id = currentDefect?.id;
        if (!id) {
          setError('수정할 항목의 ID가 없습니다.');
          return;
        }
        console.log('Updating data:', backendFormat);
        await axios.patch(`${BASE_URL}/defect-classes/${id}`, backendFormat);
      }
      await fetchDefectClasses();
      setEditingIndex(null);
      setEditingName('');
      setEditingColor('');
      setShowColorPicker(false);
      setIsNewRow(false);
      setError(null);
    } catch (error) {
      if (error.response) {
        console.error('서버 오류:', error.response.data);
        setError(`서버 오류: ${error.response.data.message || '결함 정보 저장에 실패했습니다.'}`);
      } else {
        console.error('요청 오류:', error.message);
        setError('네트워크 오류: 서버에 연결할 수 없습니다.');
      }
    }
  };

  const handleColorChange = async (color) => {
    setEditingColor(color);
    
    if (isNewRow) {
      // 새로운 결함 추가 시에는 색상만 저장하고 API 호출은 하지 않음
      const newData = [...defectData];
      newData[editingIndex] = {
        ...newData[editingIndex],
        name: editingName.trim(), // 이름도 함께 업데이트
        color: color
      };
      setDefectData(newData);
    } else {
      // 기존 결함 수정 시에는 바로 API 호출
      const currentDefect = defectData[editingIndex];
      const backendFormat = {
        class_name: currentDefect?.name?.trim(),
        class_color: color
      };

      if (!backendFormat.class_name) {
        setError('결함 이름은 필수입니다.');
        return;
      }

      try {
        const id = currentDefect?.id;
        if (!id) {
          setError('색상을 수정할 항목의 ID가 없습니다.');
          return;
        }
        console.log('Updating color:', backendFormat);
        await axios.patch(`${BASE_URL}/defect-classes/${id}`, backendFormat);
        await fetchDefectClasses();
        setEditingIndex(null);
        setShowColorPicker(false);
        setError(null);
      } catch (error) {
        if (error.response) {
          console.error('서버 오류:', error.response.data);
          setError(`서버 오류: ${error.response.data.message || '색상 변경에 실패했습니다.'}`);
        } else {
          console.error('요청 오류:', error.message);
          setError('네트워크 오류: 서버에 연결할 수 없습니다.');
        }
      }
    }
  };

  const handleDelete = (index) => {
    if (index < 0 || index >= defectData.length) {
      setError("유효하지 않은 항목입니다.");
      return;
    }
    setDeleteIndex(index);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    const currentDefect = defectData[deleteIndex];
    const id = currentDefect?.id;

    try {
      if (id) {
        await axios.patch(`${BASE_URL}/defect-classes/${id}/deactivate`);
        await fetchDefectClasses();
      } else {
        const newData = defectData.filter((_, index) => index !== deleteIndex);
        setDefectData(newData);
      }
      setDeleteIndex(null);
      setError(null);
    } catch (error) {
      if (error.response) {
        console.error('서버 오류:', error.response.data);
        setError(`서버 오류: ${error.response.data.message || '결함 삭제에 실패했습니다.'}`);
      } else {
        console.error('요청 오류:', error.message);
        setError('네트워크 오류: 서버에 연결할 수 없습니다.');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteIndex(null);
    setError(null);
  };

  return (
    <CustomerLayout>
      <div className="editclass-container">
        <button className="edit-add-button" onClick={handleAddNewDefect}>Add New Defect</button>
        {error && <div className="error-message">{error}</div>}
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
                      </div>
                    ) : (
                      item.name || '(이름 없음)'
                    )}
                  </td>
                  <td className="edit-td-color">
                    <div className="edit-color-wrapper">
                      {(editingIndex === index && showColorPicker) || (isNewRow && index === editingIndex) ? (
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
                          style={{ backgroundColor: item.color || '#dbe4ff' }}
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
                      {editingIndex === index && (
                        <>
                          {isNewRow ? (
                            editingName && editingColor && (
                              <button onClick={handleNameSave} className="edit-save-btn">저장</button>
                            )
                          ) : (
                            <button onClick={handleNameSave} className="edit-save-btn">저장</button>
                          )}
                        </>
                      )}
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