# Mini React Project

Virtual DOM, diff/patch, Hook 개념을 직접 구현해 보면서  
React의 핵심 동작 원리를 학습하는 미니 프로젝트입니다.

## 1. 프로젝트 소개

이 프로젝트는 Vanilla JavaScript로 간단한 React-like 구조를 직접 구현해 보는 것이 목표입니다.

이번 구현에서는 아래 내용을 중심으로 학습했습니다.

- Virtual DOM 구조 이해
- diff / patch 동작 방식 이해
- **FunctionComponent** 구조 구현
- `useState`, `useEffect`, `useMemo` Hook 동작 이해
- 게임 프로필 UI를 컴포넌트 단위로 분리
- batching 개념 확장

## 2. 프로젝트 목표

이 프로젝트의 목표는 “React를 사용하는 것”이 아니라  
“React가 왜 이런 구조를 가지는지 직접 구현해 보며 이해하는 것”입니다.

### 중점 포인트

- Virtual DOM은 왜 필요한가?
- 상태(state)는 어디에 저장되어야 하는가?
- 상태가 바뀌면 화면은 어떻게 다시 그려지는가?
- Hook은 어떤 원리로 이전 값을 기억하는가?
- 여러 상태 변경을 한 번의 렌더링으로 묶을 수 있는가?

## 3. 역할 분배

프로젝트는 파일 단위로 역할을 나누어 진행했습니다.

- **고민석**
  - `component.js 파일`
  - `FunctionComponent` 클래스 구현
  - 현재 렌더링 중인 컴포넌트 관리
  - 렌더링 / 재렌더링 흐름 연결

- **박승현**
  - `hooks.js 파일` 
  - `useState`, `useEffect`, `useMemo` 구현
  - Hook 상태 저장 구조와 실행 흐름 구현

- **강지현**
  - `game.js 파일`
  - `gameComponents.js 파일`
  - 게임 프로필 UI 컴포넌트 분리
  - `ProfileCard` 중심 구조로 화면 조립
  - `generateProfileVNode()`를 컴포넌트 기반 구조로 연결

- **김은재**
  - `app.js 파일`
  - `index.html 파일`
  - 루트 App 구성
  - 버튼 이벤트, PATCH 패널, 전체 화면 연결

## 4. 주요 구현 내용

### 4-1. FunctionComponent

- 함수형 컴포넌트를 감싸는 **FunctionComponent** 클래스를 구현했습니다.
- `hooks[]` 배열과 `hookIndex`를 사용해 Hook 상태를 유지합니다.
- `mount()`와 `update()`를 통해 최초 렌더링과 재렌더링을 처리합니다.

**FunctionComponent의 역할**은 단순히 함수를 실행하는 것이 아니라,
함수형 컴포넌트가 React처럼 동작할 수 있도록 상태와 렌더링 흐름을 관리하는 것입니다.

구체적으로는 다음 역할을 합니다.

- 현재 렌더링 중인 컴포넌트를 추적
- Hook이 저장될 공간(`hooks[]`) 제공
- Hook 호출 순서(`hookIndex`) 관리
- 최초 렌더링(`mount`) 처리
- 상태 변경 이후 재렌더링(`update`) 처리
- 이전 VNode와 새 VNode를 비교해 diff / patch 흐름 연결
- 렌더링 이후 effect 실행 시점 관리

### 4-2. Hook 구현

- **useState**
  - 상태를 저장하고 setter를 통해 변경
- **useEffect**
  - 렌더링 이후 실행되는 부수 효과 처리
- **useMemo**
  - 비싼 계산 결과를 재사용

### 4-3. 게임 프로필 UI 컴포넌트 분리

프로필 화면을 아래 컴포넌트로 분리했습니다.

- `ProfileHeader`
- `CareerInfo`
- `ExpBar`
- `SkillList`
- `ProjectList`
- `WeaknessList`
- `StrengthList`
- `ProfileCard`

이 구조를 통해 화면 조립 책임을 `gameComponents.js`로 분리하고,  
`game.js`는 상태와 데이터 정리 역할에 집중하도록 구성했습니다.

### 4-4. Batching 확장

- 기존에는 `setState()` 호출마다 바로 `update()`를 실행했습니다.
- batching 확장 후에는 같은 턴 안의 여러 상태 변경을 한 번의 update로 묶도록 개선했습니다.
- 이를 통해 중복 렌더링을 줄이는 방향으로 구조를 확장했습니다.

## 5. 파일 역할 설명

### **game.js**

- 게임 상태 관리
- 현재 레벨 정보 계산
- 게임 액션 처리
- `ProfileCard`에 전달할 props 구성

### **gameComponents.js**

- 프로필 화면 UI 구성
- props 기반 순수 함수 컴포넌트 구현
- 최종 `ProfileCard` 조립

### **component.js**

- `FunctionComponent` 구현
- 렌더링 시 현재 컴포넌트와 hook 순서 관리

### **hooks.js**

- `useState`, `useEffect`, `useMemo` 구현
- Hook 상태 저장 및 effect 실행 관리

## 6. 배운 점

- React의 핵심은 단순히 JSX 문법이 아니라 상태와 렌더링 흐름 설계라는 점을 이해했습니다.
- Hook이 함수 안에서 동작해도 이전 값을 기억할 수 있는 이유를 직접 구현하며 이해했습니다.
- 컴포넌트 분리를 통해 상태 관리와 화면 조립의 책임을 나누는 것이 중요하다는 점을 확인했습니다.
- batching처럼 “작은 최적화”도 렌더링 구조 이해와 연결된다는 점을 배웠습니다.

## 7. 아쉬운 점 / 확장 가능성

- 우리의 아쉬운 점 등

## 8. 한 줄 정리

이 프로젝트는 React의 핵심 개념을 직접 구현하면서  
상태, 렌더링, Hook, 컴포넌트 분리 구조를 학습하기 위한 mini React 프로젝트입니다.
