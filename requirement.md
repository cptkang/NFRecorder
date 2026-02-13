# 통합 요구사항 정의서: 무장애 달성 전광판

## 1. 시스템 개요
본 시스템은 IT 서비스의 연속 가동 시간을 시각화하여 운영 팀의 동기부여와 신뢰도를 높이는 것을 목적으로 한다. 관리자가 설정한 기점으로부터 현재까지의 시간을 실시간으로 추적하며, 장애 발생 시 관리자가 수동으로 리셋하여 기록을 관리한다.

## 2. 기능 요구사항 (Functional Requirements)

### 2.1 대시보드 화면 (Public View)
- **실시간 무장애 카운터**: 관리자가 설정한 '장애 복구 완료 일시'부터 현재 시각까지의 경과 시간(일, 시, 분)을 실시간으로 표시한다.
- **목표 달성 프로그레스**: 설정된 목표 일수 대비 현재 진행률을 시각적 바(Bar)와 퍼센트(%)로 출력한다.
    - **남은 일수 표시**: "D-Day" 형식으로 남은 목표 일수를 표시하거나 달성 시 "목표 달성" 문구를 표시한다.
- **상태 인디케이터**: 현재 서비스 상태를 관리자가 설정한 값(정상/주의/장애)에 따라 색상별로 표시한다.
- **디지털 시계**: 프로그레스 바 상단에 현재 시각(HH:MM:SS)을 흰색 디지털 폰트로 표시한다.
- **푸터 정보**:
    - **개시일**: 무장애 카운트 시작일 (YYYY.MM.DD)
    - **현재날짜**: 오늘 날짜 (YYYY.MM.DD)
    - **직전 장애일**: 마지막 장애 발생 일시 (YYYY.MM.DD)

### 2.2 관리자 페이지 (Admin Console)
- **시간 설정 (Time Management)**:
    - **Start Date (개시일)**: 카운트 시작 기준일.
    - **Last Failure Date (직전 장애일)**: 푸터에 표시될 단순 기록용 날짜.
    - **Target Goal (목표 일수)**: 목표 일수를 설정하면 **Target Date(목표일)**가 자동으로 계산된다.
        - **로직**: `Target Date` = `Start Date` + `Target Goal`
        - **제약**: `Target Goal` 변경 시 `Start Date`와 `Last Failure Date`는 변경되지 않는다.
- **상태 제어 (Status Control)**:
    - 현재 서비스 상태(Normal, Warning, Critical)를 수동으로 전환한다.
    - 'Critical(장애)' 선택 시, 대시보드 카운터는 즉시 멈추고 화면은 적색 테마로 변경된다.
- **기록 리셋 및 저장**:
    - **SAVE SETTINGS (상단 고정)**: 변경된 설정을 저장하고 대시보드 화면으로 이동한다. 스크롤과 무관하게 상단에 고정되어 접근성을 높인다.
    - **RESET COUNTER**: 장애 발생 시 기록을 초기화하고 히스토리에 저장한다.
- **텍스트 관리**: 대시보드 상단 타이틀(`Dashboard Title`)을 수정한다.
- **네비게이션**: 상단 "Admin Console" 텍스트 클릭 시 대시보드 화면으로 이동한다.

## 3. UI/UX 요구사항 (Design Requirements)

### 3.1 비주얼 스타일 (KB TechGroup Theme)
- **브랜딩 (KB Kookmin Bank)**:
    - **로고**: 좌측 상단에 KB 국민은행 CI 이미지(JPG) 적용. 클릭 시 관리자 페이지로 이동한다.
    - **컬러**: KB 시그니처 컬러(Yellow/Gray) 및 Dark Blue 테마 적용.
- **테마 (TechGroup)**:
    - **배경**: 짙은 남색 계열의 글래스모피즘(Glassmorphism) 디자인.
    - **폰트**: 숫자 데이터는 `Orbitron` (Digital Font) 사용, 주황색 강조.
    - **레이아웃**: 
        - [좌] 로고 - [중] 타이틀 - [우] 상태 LED
        - 중앙 대형 카운터
        - 하단 프로그레스 바 및 상세 날짜 정보
- **반응형 설계**: 대형 TV 화면(Full HD/4K)에 최적화.

## 4. 데이터 요구사항 (Data Requirements)
- **단일 파일 저장소**: 모든 설정과 상태 데이터는 `data/status.json` 파일 하나에 통합 저장한다.
- **주요 필드**:
    - `startTime`: 카운트 시작 기준일 (Zero Point)
    - `targetDays`: 목표 일수
    - `targetDate`: 계산된 목표 달성 예정일
    - `serviceName`: 대시보드 타이틀
    - `status`: 현재 상태 (normal/warning/critical)
    - `lastFailure`: 직전 장애 정보

## 5. 변경 이력 (Revision History)
- **스토리지 통합**: `settings.json`을 제거하고 `status.json`으로 통합 관리.
- **어드민 로직 변경**: 목표 일수 수정 시 시작일을 고정하고 목표일만 변경되도록 수정.
- **UI 개편**: KB 브랜딩 및 TechGroup 테마 적용, 디지털 시계 추가, 로고 이미지 교체.
- **기능 추가**: D-Day 계산 및 목표 달성 여부 표시 로직 추가.
