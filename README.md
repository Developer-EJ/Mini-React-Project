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

#### 이전 방식
화면에 필요한 값을 직접 계산하고, 변경이 생기면 다시 화면 구조를 수동으로 만들어야 하는 방식

#### 개선 방식
경험치, 골드, 레벨처럼 화면을 변화시키는 데이터를 상태로 관리하고, 상태 변경이 재렌더링으로 이어지도록 연결하는 구조로 개선
값의 변화가 화면 변화와 자연스럽게 이어지도록 구성

#### 이번 프로젝트 적용 방식
- `game.js`의 `gameState`를 통한 게임 상태 관리
- `useState`를 통한 렌더링과 연결되는 상태 흐름 구성

### 3. Hooks

#### 이전 방식
- 함수형 컴포넌트 안에서 상태를 기억하거나, 렌더링 이후 동작을 연결하기 어려운 방식

#### 개선 방식
- 함수형 컴포넌트에서도 상태, effect, 계산 결과를 관리할 수 있도록 Hook 구조를 추가
- 렌더링마다 같은 순서로 값을 꺼내 쓰도록 만들어 상태가 유지되게 구성

#### 이번 프로젝트 적용 방식
- `useState`: 상태 저장과 재렌더링 예약
- `useEffect`: 렌더링 이후 부수 효과 처리
- `useMemo`: deps가 같으면 이전 계산 결과 재사용
- Hook 값은 `hooks[]` 배열에 저장하고, `hookIndex`로 순서를 관리

## 🏛️ FunctionComponent 클래스 정의 및 사용 이유

함수는 호출될 때 실행되고 끝나면 내부 값 소실. 렌더링 사이에 필요한 정보를 계속 들고 있기 어려움.

### 재렌더링에 필요한 값들

| 값 | 역할 |
|----|------|
| `vNode` | 이전 렌더 결과 저장, 새 VNode와 비교하는 기준값 |
| `hooks[]` | `useState`, `useEffect`, `useMemo` 등의 Hook 상태 저장 공간 |
| `hookIndex` | 현재 몇 번째 Hook 호출인지 추적하는 값, Hook 순서 일치 보장 |
| `container` | 실제 DOM이 붙어 있는 위치 저장, mount/update 대상 관리 |

함수형 컴포넌트는 화면을 만드는 역할만 수행.
그 함수를 실행하고 관리하는 주체를 클래스로 분리.

### FunctionComponent의 역할

- `FunctionComponent` 클래스가 컴포넌트 함수 `fn`을 받아 실행
- 인스턴스가 `hooks[]`, `hookIndex`, `vNode`, `container`를 보관
- `mount()`로 최초 렌더링 수행
- `update()`로 새 VNode를 만든 뒤 `diff()` / `patch()` 실행

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

## 🚀 쟁점 포인트

### 1. 루트 컴포넌트 구조

- `App()`은 `useState`, `useMemo`, `useEffect`를 사용해 전체 렌더링 흐름을 관리.
- 자식 컴포넌트는 props만 받는 구조로 분리.

- `ProfileCard` 이하 컴포넌트는 상태를 직접 갖지 않고,
받은 props로 화면만 조립하는 순수 함수 형태로 동작.

### 2. state의 위치

- 함수는 렌더링마다 재실행되므로 함수 내부 지역 변수로는 state 유지 불가능.
- state는 FunctionComponent 인스턴스의 hooks[] 배열에 저장.
- 함수 실행이 끝나도 인스턴스는 살아있기 때문에 이전 값을 기억 가능.
- hookIndex로 호출 순서를 추적해, 매 렌더링마다 같은 슬롯에 접근.

### 3. setState의 역할

- 상태 변경 및 이후의 재렌더링 흐름 연결.
- `hooks.js`의 setter 내부에서 상태 반영 후 update 예약 또는 실행 구조.
- 상태 변화가 화면 변화로 이어지도록 만드는 핵심 연결 지점.

### 4. batching 최적화

- 여러 상태 변경을 한 번의 렌더링으로 묶는 구조
- `component.js`의 `isUpdateScheduled`를 통한 중복 예약 방지
- `hooks.js`의 `scheduleUpdate(component)`를 통한 update 예약
- 같은 턴 안의 여러 `setState`를 모아서 `update()` 1회 실행 구조

---

## ✅ 테스트 케이스

| 구분 | 핵심 검증 항목 |
|------|----------------|
| Component | 렌더링 등록, mount, update 흐름 검증 |
| Hooks | `useState`, `useEffect`, `useMemo` 동작 검증 |
| Batching | 여러 상태 변경의 단일 렌더링 처리 검증 |
| Feature | 버튼 클릭, 레벨업 팝업, 상태-UI 연결 검증 |
| Edge Case | Hook 예외, 골드 부족, 최대 레벨 처리 검증 |
