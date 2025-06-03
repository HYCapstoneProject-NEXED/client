import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import './Dashboard.css';
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
import axios from 'axios';
//더미데이터
import dummyDefectData, { defectStats } from '../../data/dummyDefectData';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://166.104.246.64:8000';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_defect_count: 0,
    most_frequent_defect: '',
    defect_counts_by_type: {}
  });

  const [defectData, setDefectData] = useState([]);
  const [defectTypes, setDefectTypes] = useState([]);
  const [filter, setFilter] = useState({
    dateRange: { start: null, end: null },
    orderType: '',
    cameraId: ''
  });

  const [openFilter, setOpenFilter] = useState(null);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [error, setError] = useState(null);
  const [imageCache, setImageCache] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/annotations/summary`);
        const data = res.data;

        setSummary({
          total_defect_count: data.total_defect_count || 0,
          most_frequent_defect: Array.isArray(data.most_frequent_defect)
            ? data.most_frequent_defect.join(', ')
            : data.most_frequent_defect || 'N/A',
          defect_counts_by_type: data.defect_counts_by_type || {}
        });

        setError(null);
      } catch (err) {
        console.error('Summary API Error:', err);
        setError('결함 통계 데이터를 불러오는데 실패했습니다.');
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const fetchDefectData = async () => {
      try {
        const body = {};

        // 날짜가 모두 선택된 경우에만 날짜 필터 적용
        if (filter.dateRange.start && filter.dateRange.end) {
          const formatDate = (date) => {
            const d = new Date(date);
            return d.toISOString().split('T')[0];
          };

          body.start_date = formatDate(filter.dateRange.start);
          body.end_date = formatDate(filter.dateRange.end);
        }

        if (selectedDefects.length > 0) {
          body.class_ids = selectedDefects.map(id => parseInt(id));
        }

        if (selectedCameras.length > 0) {
          body.camera_ids = selectedCameras.map(id => parseInt(id));
        }

        console.log('Sending request with body:', body);
        const res = await axios.post(`${BASE_URL}/annotations/defect-data/list`, body, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        console.log('Received response:', res.data);

        // 응답 데이터가 배열인지 확인
        const defects = Array.isArray(res.data) ? res.data : [];
        
        // 데이터 형식 검증
        const validDefects = defects.filter(defect => 
          defect.image_id !== undefined &&
          defect.line_name &&
          defect.camera_id !== undefined &&
          defect.captured_at &&
          Array.isArray(defect.defect_types)
        );

        setDefectData(validDefects);
        
        // 이미지 데이터 미리 로드
        loadImageUrls(validDefects);
        
        if (validDefects.length === 0) {
          setError('표시할 결함 데이터가 없습니다.');
        } else {
          setError(null);
        }
      } catch (err) {
        console.error('Defect Data API Error:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
          setError(`결함 데이터를 불러오는데 실패했습니다: ${err.response.data.detail || '알 수 없는 오류'}`);
        } else {
          setError('서버 연결에 실패했습니다.');
        }
        setDefectData([]);
      }
    };

    fetchDefectData();
  }, [filter, selectedDefects, selectedCameras]);

  // 이미지 상세 정보를 가져오는 함수
  const fetchImageDetails = async (imageId) => {
    try {
      const response = await axios.get(`${BASE_URL}/annotations/annotations/thumbnail/${imageId}`);
      return response.data;
    } catch (err) {
      console.error('이미지 상세 정보를 가져오는데 실패했습니다:', err);
      return null;
    }
  };

  // 이미지 URL을 미리 로드하는 함수
  const loadImageUrls = async (defects) => {
    const newImageCache = { ...imageCache };
    const fetchPromises = [];

    for (const defect of defects) {
      if (!newImageCache[defect.image_id]) {
        fetchPromises.push(
          fetchImageDetails(defect.image_id)
            .then(details => {
              if (details) {
                newImageCache[defect.image_id] = details;
              }
            })
            .catch(err => console.error(`이미지 ${defect.image_id} 로드 실패:`, err))
        );
      }
    }

    await Promise.all(fetchPromises);
    setImageCache(newImageCache);
  };

  // 결함 유형 목록 조회
  const fetchDefectTypes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/defect-classes`);
      const activeDefects = res.data.filter(defect => !defect.is_deleted);
      setDefectTypes(activeDefects);
      setError(null);
    } catch (err) {
      console.error('Defect Types API Error:', err);
      setError('결함 유형 목록을 불러오는데 실패했습니다.');
    }
  };

  // 필터 팝업이 열릴 때 결함 유형 목록 갱신
  useEffect(() => {
    if (openFilter === 'defect') {
      fetchDefectTypes();
    }
  }, [openFilter]);

  const handleReset = () => {
    setFilter({ dateRange: { start: null, end: null }, orderType: '', cameraId: '' });
    setSelectedDefects([]);
    setSelectedCameras([]);
    setOpenFilter(null);
  };

  const handleDateApply = (dateRange) => {
    setFilter({ ...filter, dateRange });
    setOpenFilter(null);
  };

  const handleDefectApply = (orderType) => {
    setSelectedDefects(orderType);
    setFilter({ ...filter, orderType: orderType.join(', ') });
    setOpenFilter(null);
  };

  const handleCameraApply = (cameraId) => {
    setSelectedCameras(cameraId);
    setFilter({ ...filter, cameraId: cameraId.join(', ') });
    setOpenFilter(null);
  };

  // Safely check if an array includes a value
  const safeArrayIncludes = (arr, value) => {
    if (!Array.isArray(arr)) return false;
    return arr.includes(value);
  };

  // Safely check if arrays have common elements
  const hasCommonElement = (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
    return arr1.some(item => arr2.includes(item));
  };

  const filteredData = dummyDefectData.filter((defect) => {
    // Date range filtering
    const dateMatch = !filter.dateRange.start || !filter.dateRange.end || 
      (new Date(defect.timestamp) >= new Date(filter.dateRange.start) && 
       new Date(defect.timestamp) <= new Date(filter.dateRange.end));

    // Defect type filtering - safely handle array types
    const defectMatch = selectedDefects.length === 0 || 
      hasCommonElement(selectedDefects, Array.isArray(defect.type) ? defect.type : [defect.type]);

    // Camera ID filtering
    const cameraMatch = selectedCameras.length === 0 || 
      safeArrayIncludes(selectedCameras, defect.cameraId.toString());

    return dateMatch && defectMatch && cameraMatch;
  });

  // 이미지 클릭 핸들러 - customer dashboard에서 annotation detail page로 이동
  const handleImageClick = (imageId) => {
    // customer 모드로 annotation detail page로 이동
    navigate(`/annotator/detail/${imageId}?isCustomer=true`);
  };

  return (
    <CustomerLayout>
      <div style={{ padding: '32px' }}>
        <div className="dashboard-cards-container">
          {/* 왼쪽 요약 박스 */}
          <div className="customer-summary-box">
            <div className="summary-section">
              <h2>Today's Total defect count</h2>
              <h1>{summary.total_defect_count}</h1>
            </div>
            <div className="summary-section">
              <h2>Today's Most frequent defect</h2>
              <h1>{summary.most_frequent_defect}</h1>
            </div>
          </div>

          {/* 오른쪽 통계 박스 */}
          <div className="customer-stats-box">
            <p>Compared to the previous day</p>
            <div className="customer-stats-content">
              {Object.entries(summary.defect_counts_by_type).map(([defectType, data], index) => {
                const changeValue = data.change || 0;
                const changeClass = changeValue > 0 ? 'positive' : changeValue < 0 ? 'negative' : 'zero';
                const changeText = changeValue === 0 ? '0' : (changeValue > 0 ? `+${changeValue}` : changeValue.toString());

                return (
                  <div key={index} className="customer-stats-item">
                    <div className="customer-color-circle" style={{ backgroundColor: data.color }}></div>
                    <div className="customer-info">
                      <p>{defectType}</p>
                      <p className="customer-count">{data.count}</p>
                    </div>
                    <div className={`customer-change ${changeClass}`}>
                      {changeText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 필터 UI 추가 */}
        <div className="customer-filter-ui">
            <span role="img" aria-label="filter">🔍</span> Filter By    
          <button onClick={() => setOpenFilter('date')} className="filter-btn">
            {filter.dateRange.start && filter.dateRange.end 
              ? `${filter.dateRange.start} ~ ${filter.dateRange.end}` 
              : 'Select Date Range'}
            <span style={{ marginLeft: '10px' }}>⌄</span>
          </button>
          <button onClick={() => setOpenFilter('defect')} className="filter-btn">
            {selectedDefects.length > 0 
              ? `Defect Type (${selectedDefects.length})` 
              : 'Defect Type'}
            <span style={{ marginLeft: '10px' }}>⌄</span>
          </button>
          <button onClick={() => setOpenFilter('camera')} className="filter-btn">
            {filter.cameraId || 'Camera ID'}
            <span style={{ marginLeft: '10px' }}>⌄</span>
          </button>
          <button onClick={handleReset} className="reset-btn">
            <span role="img" aria-label="reset">↺</span> Reset Filter
          </button>
        </div>

        {openFilter === 'date' && (
          <DateFilterPopup
            selected={filter.dateRange}
            onApply={handleDateApply}
            onClose={() => setOpenFilter(null)}
          />
        )}
        {openFilter === 'defect' && (
          <DefectFilterPopup
            defectTypes={defectTypes}
            selected={selectedDefects}
            onApply={(list) => {
              handleDefectApply(list);
            }}
            onClose={() => setOpenFilter(null)}
          />
        )}
        {openFilter === 'camera' && (
          <CameraFilterPopup
            selected={selectedCameras}
            onApply={(list) => {
              handleCameraApply(list);
            }}
            onClose={() => setOpenFilter(null)}
          />
        )}

        {/* 테이블 영역 */}
        <div style={{ marginTop: '32px' }}>
          {error && <div className="error-message" style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
          <div
            className="customer-table-container"
            style={{
              maxHeight: '600px', 
              overflowY: 'auto',
              border: '1px solid #eee',
              borderRadius: '8px',
              background: '#fff'
            }}
          >
            <table className="customer-defect-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Line</th>
                  <th>Camera ID</th>
                  <th>Time</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {defectData && defectData.length > 0 ? (
                  defectData.map((defect) => (
                    <tr key={defect.image_id}>
                      <td>
                        <div 
                          className="image-container" 
                          style={{ position: 'relative', width: '100px', height: '100px', cursor: 'pointer' }}
                          onClick={() => handleImageClick(defect.image_id)}
                        >
                          {imageCache[defect.image_id] ? (
                            <>
                              <img 
                                src={imageCache[defect.image_id].file_path}
                                alt={`defect-${defect.image_id}`}
                                className="customer-table-image"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/placeholder-image.png';
                                }}
                              />
                              {imageCache[defect.image_id].annotations && 
                                imageCache[defect.image_id].annotations.map((annotation, index) => {
                                  const box = annotation.bounding_box;
                                  return (
                                    <div 
                                      key={index}
                                      style={{
                                        position: 'absolute',
                                        left: `${(box.cx - box.w/2) * 100}%`,
                                        top: `${(box.cy - box.h/2) * 100}%`,
                                        width: `${box.w * 100}%`,
                                        height: `${box.h * 100}%`,
                                        border: `2px solid ${annotation.class_color || '#ff0000'}`,
                                        boxSizing: 'border-box',
                                        pointerEvents: 'none'
                                      }}
                                    />
                                  );
                                })
                              }
                            </>
                          ) : (
                            <img 
                              src="/placeholder-image.png"
                              alt={`defect-${defect.image_id}`}
                              className="customer-table-image"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          )}
                        </div>
                      </td>
                      <td>{defect.line_name}</td>
                      <td>{defect.camera_id}</td>
                      <td>{new Date(defect.captured_at).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}</td>
                      <td>{defect.defect_types.join(', ')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      {error || '데이터가 없습니다.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Dashboard;