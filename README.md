# 🔴 Mini React Project

> React의 핵심 원리를 Vanilla JavaScript로 직접 구현한 mini React 학습 프로젝트

## 프로젝트 개요
기존 ‘개발자 키우기’ 게임을 디벨롭하여, Component · State · Hooks를 적용한 미니 React 구조를 구현.


## 🧠 핵심 개념

### 1. Component

#### 이전 방식
화면 구성 요소들을 하나의 코드에 하드코딩

#### 개선 방식
화면을 작은 역할 단위의 컴포넌트로 분리해 조립하는 방식으로 구조를 개선. 
각 UI 요소의 책임을 명확히 나누고, 코드의 재사용성과 유지보수성을 높일 수 있도록 구성.

```text
ProfileCard
 ├── ProfileHeader
 ├── CareerInfo
 ├── ExpBar
 ├── SkillList
 ├── ProjectList
 ├── WeaknessList
 └── StrengthList
```

- `ProfileCard`가 화면 전체를 조립하도록 구성.

### 2. State

State는 화면을 바꾸는 기준이 되는 데이터입니다.

- 현재 레벨 인덱스
- 경험치
- 골드

즉 상태가 바뀌면:

- 경험치 바가 바뀌고
- 골드 표시가 바뀌고
- 레벨에 따라 기술 스택과 프로젝트도 달라집니다

그래서 상태를 저장하는 것뿐 아니라,  
상태 변경 이후 화면을 다시 계산하는 구조가 중요했습니다.

### 3. Hooks

Hooks는 함수형 컴포넌트 안에서 상태와 부수효과를 다루기 위한 구조입니다.

이번 프로젝트에서는 아래 3가지를 직접 구현했습니다.

- `useState`
  - 상태 저장 및 setter 제공
- `useEffect`
  - 렌더링 이후 실행되는 부수 효과 처리
- `useMemo`
  - 비싼 계산 결과를 재사용

Hook 상태는 함수 내부가 아니라 `hooks[]` 배열에 저장되며,  
`hookIndex`를 통해 매 렌더링마다 같은 순서로 접근합니다.

## 🏛️ FunctionComponent의 역할

`FunctionComponent`는 함수형 컴포넌트가 React처럼 동작할 수 있도록  
렌더링 흐름과 Hook 상태를 연결하는 핵심 구조입니다.

주요 역할은 다음과 같습니다.

- 현재 렌더링 중인 컴포넌트 추적
- Hook 상태가 저장될 공간(`hooks[]`) 제공
- Hook 호출 순서(`hookIndex`) 관리
- `mount()`를 통한 최초 렌더링 처리
- `update()`를 통한 재렌더링 처리
- 이전 VNode와 새 VNode를 비교해 diff / patch 연결
- 렌더링 이후 effect 실행 시점 관리

즉, 단순히 함수를 실행하는 것이 아니라  
함수형 컴포넌트가 상태를 가지는 구조로 동작할 수 있게 만드는 역할을 합니다.

### 역할 분리 구조

```text
game.js
 └── 상태 계산, 레벨 정보 정리, 게임 액션 처리

gameComponents.js
 └── props 기반 순수 함수 컴포넌트로 화면 조립

component.js
 └── FunctionComponent, mount / update, 현재 렌더링 컴포넌트 관리

hooks.js
 └── useState / useEffect / useMemo 구현
```

### Component 구조



## 🏗️ 아키텍처

### 전체 흐름

```text
gameState
   ↓
getCurrentLevel()
   ↓
generateProfileVNode()
   ↓
ProfileCard(props)
   ↓
하위 컴포넌트
   ↓
최종 VNode
   ↓
diff / patch
   ↓
실제 DOM 반영
```

## 🚀 주요 구현 내용

### 게임 프로필 UI 컴포넌트 분리

기존에는 `generateProfileVNode()` 안에서 `h1`, `p`, `ul`, `li`를 직접 조립했습니다.

현재는:

- `game.js`는 상태와 레벨 정보를 정리하고
- `generateProfileVNode()`는 `ProfileCard(props)`에 데이터를 전달하며
- 실제 화면 조립은 `gameComponents.js`가 담당하도록 변경했습니다.

### 조건부 섹션 처리

`ProjectList`, `WeaknessList`, `StrengthList`는  
데이터가 비어 있으면 `null`을 반환합니다.

`ProfileCard`에서는:

```js
.filter((child) => child !== null)
```

을 사용하여 화면에 필요 없는 섹션을 children 배열에서 제거합니다.

### Batching 확장

기존에는 `setState()`가 호출될 때마다 바로 `update()`를 실행했습니다.

이번 확장에서는:

- 상태값은 즉시 반영하고
- 렌더링은 `scheduleUpdate(component)`로 예약하고
- 같은 턴 안의 여러 상태 변경은 한 번의 렌더링으로 묶도록 개선했습니다.

즉:

- 이전: 상태 변경마다 즉시 렌더링
- 변경 후: 여러 변경을 모아서 한 번만 렌더링

---

## ✅ 배운 점

- React의 핵심은 JSX 문법보다 상태와 렌더링 흐름 설계라는 점을 이해했습니다.
- Hook은 함수 내부가 아니라 외부 저장 구조(`hooks[]`)를 통해 이전 값을 기억한다는 점을 직접 구현하며 배웠습니다.
- Component 분리를 통해 상태 관리와 UI 조립 책임을 나누는 것이 중요하다는 점을 확인했습니다.
- batching처럼 작은 최적화도 렌더링 구조와 깊게 연결된다는 점을 배웠습니다.

---

## 📌 한 줄 정리

이 프로젝트는 Component, State, Hooks, FunctionComponent, batching 개념을 직접 구현하면서  
React의 핵심 동작 원리를 이해하기 위한 mini React 프로젝트입니다.
