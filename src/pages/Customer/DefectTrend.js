import React, { useState, useEffect } from 'react';
import DateRangeFilter from '../../components/Customer/Filter/DateRangeFilter';
import DefectFilterPopup from '../../components/Customer/Filter/DefectFilterPopup';
import CameraFilterPopup from '../../components/Customer/Filter/CameraFilterPopup';
import DateFilterPopup from '../../components/Customer/Filter/DateFilterPopup';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import './DefectTrend.css';

const BASE_URL = process.env.REACT_APP_API_URL;

const getStartDateFromType = (type) => {
    const now = new Date();
    switch (type) {
        case 'week':
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            return start.toISOString().split('T')[0];
        case 'month':
            return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        case 'year':
            return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        case 'custom':
            return null;
        default:
            return now.toISOString().split('T')[0];
    }
};

const getEndDateFromType = (type) => new Date().toISOString().split('T')[0];

const getUnitFromDateType = (type) => {
    switch (type) {
        case 'week': return 'week';
        case 'month': return 'month';
        case 'year': return 'year';
        case 'custom': return 'custom';
        default: return 'week';
    }
};

// 백엔드 값에서 표시 텍스트로 변환하는 함수
const getDisplayTextFromType = (type) => {
    switch (type) {
        case 'week': return 'Last 7 Days';
        case 'month': return 'This Month';
        case 'year': return 'This Year';
        case 'custom': return 'Custom';
        default: return 'Last 7 Days';
    }
};

const DefectTrend = () => {
    const [dateRangeOpen, setDateRangeOpen] = useState(false);
    const [dateRangeType, setDateRangeType] = useState('week');
    const [customRange, setCustomRange] = useState({ start: null, end: null });
    const [defectPopupOpen, setDefectPopupOpen] = useState(false);
    const [cameraPopupOpen, setCameraPopupOpen] = useState(false);
    const [customDatePickerOpen, setCustomDatePickerOpen] = useState(false);
    const [selectedDefects, setSelectedDefects] = useState([]);
    const [selectedCameras, setSelectedCameras] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [chartWidth, setChartWidth] = useState(window.innerWidth - 100);
    const [defectColorMap, setDefectColorMap] = useState({});
    const [totalDefectData, setTotalDefectData] = useState([]); // 전체 결함 데이터 저장

    // 필터 적용 핸들러
    const handleDateRangeChange = (type) => {
        console.log('선택된 날짜 범위:', type);
        setDateRangeType(type);
        setDateRangeOpen(false);
        
        if (type === 'custom') {
            setCustomDatePickerOpen(true);
        } else {
            setCustomRange({ start: null, end: null });
        }
    };
    
    const handleCustomDateApply = (range) => {
        console.log('커스텀 날짜 범위 선택:', range);
        setCustomRange(range);
        setCustomDatePickerOpen(false);
    };
    
    const handleDefectFilter = (defects) => {
        if (selectedCameras.length > 0) {
            alert("결함 유형과 카메라 ID는 동시에 선택할 수 없습니다.");
            return;
        }
        setSelectedDefects(defects);
        setDefectPopupOpen(false);
    };
    
    const handleCameraFilter = (cameras) => {
        if (selectedDefects.length > 0) {
            alert("결함 유형과 카메라 ID는 동시에 선택할 수 없습니다.");
            return;
        }
        setSelectedCameras(cameras);
        setCameraPopupOpen(false);
    };
    
    const handleReset = () => {
        setDateRangeType('week');
        setCustomRange({ start: null, end: null });
        setSelectedDefects([]);
        setSelectedCameras([]);
    };

    useEffect(() => {
        if (selectedDefects.length > 0 && selectedCameras.length > 0) {
            alert("결함 유형과 카메라 ID는 동시에 선택할 수 없습니다.");
            setSelectedCameras([]);
        }
    }, [selectedDefects, selectedCameras]);

    // 선택된 결함 유형을 백엔드에서 필요한 형식으로 변환하는 함수
    const getDefectTypeValues = (defects) => {
        // 결함 유형이 숫자로 저장되어 있다면 해당하는 문자열 값으로 변환
        const defectTypeMap = {
            1: 'open',
            2: 'short',
            3: 'spurious_copper',
            4: 'mouse_bite',
            5: 'missing_hole',
            6: 'missing_component'
            // 필요한 경우 더 많은 매핑 추가
        };
        
        return defects.map(defect => {
            // 숫자인 경우 매핑된 문자열 반환, 문자열인 경우 그대로 반환
            if (typeof defect === 'number') {
                console.log(`숫자 결함 유형 ${defect}를 ${defectTypeMap[defect]}로 변환`);
                return defectTypeMap[defect] || defect.toString();
            }
            return defect;
        });
    };

    // 선택된 카메라 ID를 백엔드에서 필요한 형식으로 변환하는 함수
    const getCameraIdValues = (cameras) => {
        return cameras.map(camera => {
            // 문자열인 경우 숫자로 변환하여 반환
            if (typeof camera === 'string' && !isNaN(camera)) {
                return camera;
            }
            return camera;
        });
    };

    // 차트 데이터 처리 함수
    const processChartData = (responseData) => {
        if (!responseData || !responseData.data) {
            console.error('유효한 응답 데이터가 없습니다.');
            setChartData([]);
            return;
        }
        
        console.log('원본 응답 데이터:', responseData.data);
        
        // 날짜별로 데이터를 그룹화
        const dateGroups = {};
        // 결함 유형별 색상을 저장
        const defectColors = {};
        
        // 모든 결함 유형 또는 카메라 ID를 수집
        const allLabels = new Set();
        
        // 데이터 그룹화 및 결함 유형/카메라 ID 수집
        responseData.data.forEach(({ date, label, defect_count, class_color, camera_id }) => {
            if (!dateGroups[date]) {
                dateGroups[date] = { date };
            }
            
            // 라벨 처리 (결함 유형 또는 카메라 ID)
            const dataLabel = label || (camera_id ? `Camera ${camera_id}` : null);
            
            if (dataLabel) {
                // 해당 날짜의 결함 유형/카메라 ID 카운트 저장
                dateGroups[date][dataLabel] = defect_count;
                // 결함 유형/카메라 ID 목록에 추가
                allLabels.add(dataLabel);
                // 색상 정보 저장
                if (class_color) {
                    defectColors[dataLabel] = class_color;
                }
            } else {
                // 결함 유형/카메라 ID가 없는 경우 (전체 통계)
                dateGroups[date].total = defect_count;
            }
        });
        
        // 빈 날짜에 0 값 채우기
        if (Object.keys(dateGroups).length > 0) {
            const allDates = Object.keys(dateGroups);
            const allLabelsList = Array.from(allLabels);
            
            allDates.forEach(date => {
                allLabelsList.forEach(label => {
                    if (dateGroups[date][label] === undefined) {
                        dateGroups[date][label] = 0;
                    }
                });
            });
        }
        
        // 날짜순으로 정렬된 최종 데이터
        const finalData = Object.values(dateGroups).sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        console.log('처리된 차트 데이터:', finalData);
        
        if (finalData.length === 0) {
            console.warn('차트 데이터가 비어 있습니다.');
        }
        
        // 결함 유형/카메라 ID별 색상 상태 업데이트
        setDefectColorMap(defectColors);
        
        // 차트 데이터 업데이트
        setChartData(finalData);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const unit = getUnitFromDateType(dateRangeType);
                
                // 요청 파라미터 구성
                const searchParams = new URLSearchParams();
                searchParams.append('unit', unit);
                
                // 커스텀 날짜 범위 처리
                if (dateRangeType === 'custom' && customRange.start && customRange.end) {
                    searchParams.append('start_date', customRange.start);
                    searchParams.append('end_date', customRange.end);
                }
                
                // 필터가 없는 전체 데이터 요청 (필터 미적용)
                if (selectedDefects.length === 0 && selectedCameras.length === 0) {
                    const url = `${BASE_URL}/annotations/statistics/defect-by-period?${searchParams.toString()}`;
                    console.log('전체 데이터 API 요청 URL:', url);
                    
                    const response = await axios.get(url);
                    console.log('전체 데이터 API 응답:', response.data);
                    
                    // 전체 데이터 처리
                    processChartData(response.data);
                    
                    // 전체 결함 데이터 저장
                    processTotalDefectData(response.data);
                } else {
                    // 필터가 적용된 데이터 요청
                    // 결함 유형 선택 처리
                    if (selectedDefects.length > 0) {
                        // 결함 유형이 숫자라면 문자열로 변환
                        const defectTypes = getDefectTypeValues(selectedDefects);
                        console.log('변환된 결함 유형:', defectTypes);
                        
                        // 각 결함 유형을 개별 파라미터로 추가
                        defectTypes.forEach(defect => {
                            searchParams.append('defect_type', defect);
                        });
                    }
                    
                    // 카메라 ID 선택 처리
                    if (selectedCameras.length > 0) {
                        // 카메라 ID 변환
                        const cameraIds = getCameraIdValues(selectedCameras);
                        console.log('변환된 카메라 ID:', cameraIds);
                        
                        // 각 카메라 ID를 개별 파라미터로 추가 (camera_ids -> camera_id)
                        cameraIds.forEach(camera => {
                            searchParams.append('camera_id', camera);
                        });
                    }
                    
                    const url = `${BASE_URL}/annotations/statistics/defect-by-period?${searchParams.toString()}`;
                    console.log('필터링된 데이터 API 요청 URL:', url);
                    
                    const response = await axios.get(url);
                    console.log('필터링된 데이터 API 응답:', response.data);
                    
                    // 필터링된 데이터 처리
                    processChartData(response.data);
                    
                    // 필터 적용 시 전체 데이터도 가져오기
                    const totalDataParams = new URLSearchParams();
                    totalDataParams.append('unit', unit);
                    
                    if (dateRangeType === 'custom' && customRange.start && customRange.end) {
                        totalDataParams.append('start_date', customRange.start);
                        totalDataParams.append('end_date', customRange.end);
                    }
                    
                    const totalUrl = `${BASE_URL}/annotations/statistics/defect-by-period?${totalDataParams.toString()}`;
                    const totalResponse = await axios.get(totalUrl);
                    console.log('전체 데이터 API 응답 (필터 적용 시):', totalResponse.data);
                    
                    // 전체 결함 데이터 저장
                    processTotalDefectData(totalResponse.data);
                }
                
            } catch (error) {
                console.error('데이터 가져오기 실패:', error);
                setChartData([]); // 에러 시 차트 데이터 초기화
                setTotalDefectData([]); // 에러 시 전체 결함 데이터 초기화
            }
        };
        
        fetchData();
    }, [dateRangeType, customRange, selectedDefects, selectedCameras]);

    // 전체 결함 데이터 처리 함수
    const processTotalDefectData = (responseData) => {
        if (!responseData || !responseData.data) {
            setTotalDefectData([]);
            return;
        }
        
        // 날짜별로 데이터를 그룹화
        const dateGroups = {};
        
        // 데이터 그룹화
        responseData.data.forEach(({ date, defect_count }) => {
            if (!dateGroups[date]) {
                dateGroups[date] = { date, total: 0 };
            }
            
            // 해당 날짜의 total 값 증가
            dateGroups[date].total += defect_count;
        });
        
        // 날짜순으로 정렬된 최종 데이터
        const finalData = Object.values(dateGroups).sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
        
        console.log('처리된 전체 결함 데이터:', finalData);
        setTotalDefectData(finalData);
    };

    // 차트 크기 조정
    useEffect(() => {
        const handleResize = () => {
            setChartWidth(window.innerWidth - 100);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 날짜 포맷팅 - 단위에 따라 다르게 표시
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        if (dateRangeType === 'year') {
            return `${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (dateRangeType === 'week') {
            // 주간 데이터인 경우 요일 표시 추가
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${days[date.getDay()]})`;
        } else if (dateRangeType === 'month') {
            // 월간 데이터인 경우 일자만 표시
            return `${String(date.getDate()).padStart(2, '0')}일`;
        } else if (dateRangeType === 'custom') {
            // 커스텀 날짜 범위인 경우 월.일 형식 사용
            return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        } else {
            return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
        }
    };

    // 결함 유형 이름 또는 카메라 ID 포맷팅
    const formatDefectName = (key) => {
        if (key === 'total') return 'All Defects';
        
        // 카메라 ID인 경우
        if (key.startsWith('Camera ')) return key;
        
        // 결함 유형인 경우
        return typeof key === 'string' ? key.replace(/_/g, ' ') : key;
    };

    // 결함 유형 또는 카메라 ID별 색상 결정 함수
    const getDefectColor = (key) => {
        // API에서 제공한 색상이 있으면 사용
        if (defectColorMap[key]) {
            return defectColorMap[key];
        }
        
        // 카메라 ID인 경우
        if (key.startsWith('Camera ')) {
            // 카메라 ID별 색상 배열
            const cameraColors = ['#00C49F', '#FFBB28', '#FF8042', '#A349A4', '#0088FE'];
            const cameraNumber = parseInt(key.replace('Camera ', ''), 10);
            return cameraColors[(cameraNumber - 1) % cameraColors.length];
        }
        
        // 기본 색상 배열
        const defaultColors = ['#4D4DFF', '#FF0000', '#00C49F', '#FFBB28', '#FF8042', '#A349A4', '#0088FE'];
        
        // 결함 유형에 따라 색상 결정
        const index = Object.keys(defectColorMap).indexOf(key);
        if (index >= 0) {
            return defaultColors[index % defaultColors.length];
        }
        
        // 기본값
        return key === 'total' ? '#4D4DFF' : '#FF0000';
    };

    // 커스텀 툴팁
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const date = formatDate(label);
            
            // 필터링된 데이터의 합계 계산
            const filteredTotal = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
            
            // 필터 선택 여부 확인
            const hasFilters = selectedDefects.length > 0 || selectedCameras.length > 0;
            
            // 해당 날짜의 전체 결함 수 찾기
            const totalDefectForDate = totalDefectData.find(item => item.date === label);
            const allDefectsTotal = totalDefectForDate ? totalDefectForDate.total : 0;
            
            console.log('툴팁 데이터:', { date, filteredTotal, allDefectsTotal });
            
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-date">{date}</p>
                    
                    {/* 필터 적용 시 두 가지 합계 중 All Defects만 표시 */}
                    {hasFilters ? (
                        <>
                            <p className="tooltip-all-defects">All Defects: {allDefectsTotal}</p>
                        </>
                    ) : (
                        // 필터 미적용 시 All Defects만 표시
                        <p className="tooltip-all-defects">All Defects: {allDefectsTotal}</p>
                    )}
                    
                    {/* 필터를 선택했을 때만 상세 내역 표시 */}
                    {hasFilters && payload.map((entry, index) => {
                        // dataKey 확인
                        const dataKey = entry.dataKey;
                        
                        // total 항목은 건너뛰기 (이미 위에 표시됨)
                        if (dataKey === 'total') return null;
                        
                        // 이름 결정
                        let displayName;
                        
                        // 순수하게 숫자인지 확인
                        if (dataKey !== 'total' && /^\d+$/.test(dataKey)) {
                            // 숫자만 있는 경우 카메라 ID로 간주
                            displayName = `Camera ${dataKey}`;
                        } else if (dataKey.startsWith('Camera ')) {
                            // 이미 "Camera "로 시작하는 경우
                            displayName = dataKey;
                        } else {
                            // 결함 유형인 경우
                            displayName = formatDefectName(dataKey);
                        }
                        
                        return (
                            <p 
                                key={index} 
                                className="tooltip-item" 
                                style={{ 
                                    color: entry.stroke,
                                    fontWeight: 'normal'
                                }}
                            >
                                {displayName}: {entry.value}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const dynamicWidth = Math.max(chartWidth, (chartData.length || 1) * 60);

    return (
        <>
            <div className="filters-card">
                <div className="customer-filter-ui">
                    <span role="img" aria-label="filter">🔍</span> Filter By    
                    <button onClick={() => setDateRangeOpen(true)} className="filter-btn">
                        {dateRangeType === 'custom' && customRange.start && customRange.end 
                            ? `${customRange.start} ~ ${customRange.end}` 
                            : getDisplayTextFromType(dateRangeType)}
                        <span style={{ marginLeft: '10px' }}>⌄</span>
                    </button>
                    <button 
                        onClick={() => setDefectPopupOpen(true)} 
                        className="filter-btn"
                    >
                        {selectedDefects.length > 0 
                            ? selectedDefects.map(defect => typeof defect === 'string' ? defect.replace(/_/g, ' ') : defect).join(', ')
                            : 'Defect Type'
                        }
                        <span style={{ marginLeft: '10px' }}>⌄</span>
                    </button>
                    <button 
                        onClick={() => setCameraPopupOpen(true)} 
                        className="filter-btn"
                    >
                        {selectedCameras.length ? `Camera ${selectedCameras.join(', ')}` : 'Camera ID'}
                        <span style={{ marginLeft: '10px' }}>⌄</span>
                    </button>
                    <button onClick={handleReset} className="reset-btn">
                        <span role="img" aria-label="reset">↺</span> Reset Filter
                    </button>
                </div>
                {dateRangeOpen && (
                    <div style={{ position: 'absolute', zIndex: 10 }}>
                        <DateRangeFilter value={dateRangeType} onChange={handleDateRangeChange} />
                    </div>
                )}
                {customDatePickerOpen && (
                    <div style={{ position: 'absolute', zIndex: 10 }}>
                        <DateFilterPopup 
                            selected={customRange}
                            onApply={handleCustomDateApply}
                            onClose={() => setCustomDatePickerOpen(false)}
                        />
                    </div>
                )}
                {defectPopupOpen && (
                    <DefectFilterPopup
                        selected={selectedDefects}
                        onApply={handleDefectFilter}
                        onClose={() => setDefectPopupOpen(false)}
                    />
                )}
                {cameraPopupOpen && (
                    <CameraFilterPopup
                        selected={selectedCameras}
                        onApply={handleCameraFilter}
                        onClose={() => setCameraPopupOpen(false)}
                    />
                )}
            </div>
            <div className="chart-card line-chart-card">
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    {chartData.length > 0 ? (
                        <LineChart
                            width={dynamicWidth}
                            height={300}
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                            <XAxis 
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                padding={{ left: 10, right: 10 }}
                                stroke="#999"
                                tickFormatter={formatDate}
                                interval={dateRangeType === 'month' ? 2 : 0}
                            />
                            <YAxis 
                                domain={[0, 'dataMax + 2']}
                                tick={{ fontSize: 12 }}
                                stroke="#999"
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            
                            {Object.keys(chartData[0])
                                .filter(key => key !== 'date')
                                .map((key) => (
                                    <Line
                                        key={key}
                                        type="linear"
                                        dataKey={key}
                                        stroke={getDefectColor(key)}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: getDefectColor(key), strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                        isAnimationActive={true}
                                        name={formatDefectName(key)}
                                    />
                                ))
                            }
                        </LineChart>
                    ) : (
                        <div className="no-data-message">
                            <p>데이터가 없습니다. 다른 필터 조건을 선택해주세요.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DefectTrend; 