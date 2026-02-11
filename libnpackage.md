# 라이브러리 및 패키지 설치 가이드 (Offline 환경)

본 문서는 **무장애 달성 전광판 (Dashboard App)** 프로젝트를 오프라인(폐쇄망) 환경에서 설치하고 구성하기 위해 필요한 라이브러리 목록과 설치 방법을 안내합니다.

## 1. 필수 라이브러리 및 패키지 목록

프로젝트 구동에 필요한 핵심 의존성(Dependency)과 개발 도구(DevDependency)입니다.

### 1.1 핵심 의존성 (Dependencies)
애플리케이션 실행(Runtime)에 반드시 필요한 패키지들입니다.

| 패키지명 | 버전 | 용도 | 비고 |
| :--- | :--- | :--- | :--- |
| **next** | ^13.5.6 | React 웹 프레임워크 | SSR, Routing, API Routes 제공 |
| **react** | ^18.3.1 | UI 라이브러리 | 컴포넌트 기반 UI 구축 |
| **react-dom** | ^18.3.1 | React DOM 렌더러 | 브라우저 DOM 제어 |

### 1.2 개발 의존성 (DevDependencies)
빌드(Build) 및 개발 환경 구성에 필요한 패키지들입니다.

| 패키지명 | 버전 | 용도 | 비고 |
| :--- | :--- | :--- | :--- |
| **typescript** | ^5 | 프로그래밍 언어 | 정적 타입 지원 (JavaScript 상위 호환) |
| **@types/node** | ^20 | Node.js 타입 정의 | TypeScript 개발 환경용 |
| **@types/react** | ^18.3.28 | React 타입 정의 | TypeScript 개발 환경용 |
| **@types/react-dom** | ^18.3.7 | React DOM 타입 정의 | TypeScript 개발 환경용 |

---

## 2. 오프라인 설치 및 구성 방법

인터넷이 연결되지 않은 오프라인 환경(폐쇄망 서버 등)에 프로젝트를 배포하기 위한 두 가지 방법을 안내합니다.

### 방법 A: 전체 번들링 이식 (권장)
가장 간편하고 확실한 방법입니다. 인터넷이 연결된 PC에서 모든 설치와 빌드를 마친 후, 결과물 전체를 오프라인 서버로 복사합니다.

#### [Step 1: 온라인 PC]
1.  프로젝트 폴더로 이동합니다.
2.  의존성 패키지를 설치합니다.
    ```bash
    npm install
    ```
3.  프로젝트를 빌드합니다. (권장)
    ```bash
    npm run build
    ```
    *   `build` 명령 실행 시 `.next` 폴더가 생성됩니다.
4.  **전체 폴더 압축**: 프로젝트 폴더 전체를 압축합니다.
    *   포함해야 할 폴더: `node_modules`, `.next`, `public`, `package.json`, `next.config.js` 등
    *   제외해도 되는 폴더: `.git` (소스 관리용), `.vscode` (에디터 설정)

#### [Step 2: 오프라인 서버]
1.  압축 파일을 오프라인 서버로 전송합니다.
2.  원하는 위치에 압축을 해제합니다.
3.  애플리케이션을 실행합니다.
    ```bash
    npm start
    ```

> **주의**: 온라인 PC와 오프라인 서버의 **OS(운영체제)와 아키텍처(CPU)**가 동일해야 `node_modules` 내의 일부 바이너리 패키지가 정상 동작합니다. (예: 둘 다 Linux x64)
> 만약 OS가 다르다면 **방법 B**를 사용하거나, Docker 컨테이너를 활용하는 것이 좋습니다.

---

### 방법 B: 오프라인 패키지 파일(.tgz) 설치
OS가 다른 환경으로 이식해야 하거나, `node_modules`를 직접 복사할 수 없는 경우 사용합니다.

#### [Step 1: 온라인 PC - 패키지 준비]
필요한 모든 패키지를 `.tgz` 파일 형태로 다운로드합니다. `npm-pack-all` 같은 도구를 활용하거나, `npm pack` 명령어를 사용합니다.

1.  `npm-pack-all` 설치 (글로벌):
    ```bash
    npm install -g npm-pack-all
    ```
2.  프로젝트 의존성을 다운로드하여 `packages` 폴더에 모읍니다.
    *   (수동 방법) `package.json`의 각 패키지에 대해 `npm pack <패키지명>` 실행
    *   또는 `npm install --cache ./npm-cache` 를 사용하여 캐시 폴더를 생성하고 해당 캐시 폴더를 가져갑니다.

#### [Step 2: 오프라인 서버 - 캐시 기반 설치]
1.  준비한 패키지 파일(또는 캐시 폴더)을 오프라인 서버로 복사합니다.
2.  오프라인 설치 명령어를 실행합니다.
    ```bash
    npm install --offline --cache ./npm-cache
    ```
    또는 개별 파일 설치:
    ```bash
    npm install ./packages/next-13.5.6.tgz ./packages/react-18.3.1.tgz ...
    ```

---

## 3. Node.js 구성 (필수)

이 프로젝트를 실행하기 위해서는 오프라인 서버에 **Node.js** 런타임이 설치되어 있어야 합니다.

1.  **Node.js 설치 파일 다운로드**:
    *   [Node.js 공식 홈페이지](https://nodejs.org/)에서 LTS 버전(권장: v18 또는 v20)의 **Binary Archive** (예: `node-v18.x.x-linux-x64.tar.xz`)를 다운로드합니다.
2.  **오프라인 서버 전송 및 설치**:
    *   파일을 서버로 복사하고 압축을 해제합니다.
    *   `bin` 폴더를 시스템 `PATH`에 등록합니다.
    *   설치 확인:
        ```bash
        node -v
        npm -v
        ```
