# 🔴 Mini React Project

> React의 핵심 원리를 Vanilla JavaScript로 직접 구현한 mini React 학습 프로젝트

Virtual DOM, diff/patch, Function Component, State, Hooks 개념을 직접 구현하면서  
React가 왜 이런 구조를 가지는지 이해하고 시연하기 위한 프로젝트입니다.

## 🎯 핵심 구현 포인트

| 포인트 | 구현 방식 | 의미 |
|--------|----------|------|
| 🧩 Component 분리 | `ProfileHeader`, `CareerInfo`, `SkillList` 등으로 화면 분리 | UI 역할 분리와 재사용성 향상 |
| 📦 State 관리 | `gameState` + `useState` | 상태 변경과 화면 갱신 흐름 학습 |
| 🪝 Hooks | `useState`, `useEffect`, `useMemo` 직접 구현 | 함수형 컴포넌트의 상태/효과/메모 구조 이해 |
| 🔄 렌더링 흐름 | `FunctionComponent` + `mount()` + `update()` | 상태 변경 후 재렌더링 구조 구현 |
| 🌳 화면 구조 | VNode 기반 화면 표현 | 실제 DOM 전 변경 구조 비교 |
| ⚡ 최적화 | batching 확장 | 여러 상태 변경을 한 번의 렌더링으로 묶기 |

## 🧠 핵심 개념

### 1. Component

Component는 화면을 작은 역할 단위로 나누는 방식입니다.

이번 프로젝트에서는 하나의 큰 화면을 직접 조립하지 않고 아래처럼 분리했습니다.

- `ProfileHeader`
- `CareerInfo`
- `ExpBar`
- `SkillList`
- `ProjectList`
- `WeaknessList`
- `StrengthList`
- `ProfileCard`

이를 통해:

- UI 구조를 더 명확하게 만들고
- 수정 범위를 줄이고
- 최종적으로 `ProfileCard`가 화면 전체를 조립하도록 구성했습니다.

### 2. State

State는 화면을 바꾸는 기준이 되는 데이터입니다.

이번 프로젝트에서 중요한 상태는 다음과 같습니다.

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
