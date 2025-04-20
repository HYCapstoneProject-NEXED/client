# 어노테이션 툴 사용 설명서

## 프로젝트 구조

어노테이션 툴은 다음과 같은 구조로 구성되어 있습니다:

```
client/src/
├── components/           # 재사용 가능한 컴포넌트들
│   └── Annotator/        # 어노테이션 관련 컴포넌트
│       ├── Sidebar.jsx   # 데이터 정보, 결함 목록 표시
│       ├── ImageCanvas.jsx  # 이미지 뷰어 및 바운딩 박스 처리
│       ├── AnnotationTools.jsx # 어노테이션 도구 모음
│       ├── ClassSelector.jsx  # 결함 유형 선택기
│       └── Header.jsx     # 헤더 컴포넌트
├── constants/            # 상수 정의
│   └── annotationConstants.js  # 어노테이션 관련 상수
├── hooks/                # 커스텀 훅
│   ├── useAnnotationData.js     # 어노테이션 데이터 관리
│   ├── useAnnotationHistory.js  # 실행 취소/다시 실행 기능
│   └── useAnnotationSelection.js  # 결함 선택 관련 기능
├── pages/                # 페이지 컴포넌트
│   └── AnnotatorPage/    # 어노테이터 페이지
│       └── AnnotationEditPage.jsx  # 어노테이션 편집 페이지
├── services/             # API 서비스
│   └── AnnotationService.js  # 어노테이션 관련 API 서비스
└── utils/                # 유틸리티 함수
    └── annotationUtils.js  # 어노테이션 관련 유틸리티 함수
```

## 주요 기능 구성

1. **훅 기반 분리 설계**
   - `useAnnotationData`: 데이터 로딩, 저장, 수정 등을 처리
   - `useAnnotationHistory`: 실행 취소/다시 실행 히스토리 관리
   - `useAnnotationSelection`: 결함 선택, 도구 변경 처리

2. **유틸리티 및 상수 분리**
   - `annotationConstants.js`: 모든 상수 정의 중앙화
   - `annotationUtils.js`: 재사용 가능한 유틸리티 함수

3. **서비스 기반 API 처리**
   - `AnnotationService.js`: API 호출 및 데이터 변환을 담당

## 어노테이션 도구 사용법

### 기본 도구

- **손 도구(Hand)**: 객체 선택 및 이동
- **사각형 도구(Rectangle)**: 새 바운딩 박스 생성

### 어노테이션 작업 방법

1. **바운딩 박스 생성**
   - 사각형 도구 선택
   - 결함 유형 선택 (Defect_A, Defect_B 등)
   - 이미지에서 드래그하여 바운딩 박스 생성

2. **바운딩 박스 편집**
   - 손 도구 선택
   - 바운딩 박스 선택
   - 드래그하여 위치 이동
   - 모서리/가장자리 드래그하여 크기 조정

3. **결함 유형 변경**
   - 손 도구로 바운딩 박스 선택
   - 결함 유형 클릭하여 변경

4. **바운딩 박스 삭제**
   - 손 도구로 바운딩 박스 선택
   - 삭제 버튼 클릭

5. **작업 저장**
   - Save 버튼 클릭

6. **실행 취소/다시 실행**
   - Undo 버튼: 마지막 작업 취소
   - Redo 버튼: 취소했던 작업 다시 실행

## 사이드바 정보

- **Data Information**: 선택한 이미지의 정보
- **Selected Annotation Details**: 선택한 결함의 상세 정보
- **Defect list**: 현재 이미지의 모든 결함 목록

## 개발자 정보

이 어노테이션 툴은 이미지 데이터셋에 결함 어노테이션을 추가하고 관리하기 위한 도구입니다.
현재는 더미 데이터를 사용하고 있으며, 실제 API 연동을 위해서는 AnnotationService.js 파일에서
주석 처리된 API 호출을 활성화하면 됩니다. 