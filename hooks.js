// =============================================
// 담당: 박승현 | hooks.js
// 책임: useState, useEffect, useMemo 구현
// 의존: component.js의 getCurrentComponent(), resetHookIndex()
// =============================================

// 핵심 질문:
// "함수는 매번 새로 실행되는데, 상태는 어떻게 유지할까?"
// → 각 컴포넌트 인스턴스의 hooks[] 배열에 저장하고
//   hookIndex로 호출 순서를 추적하여 올바른 슬롯에 접근한다

// 상태를 저장하고 변경할 수 있는 hook
// initialValue: 최초 렌더링 시 사용할 초기값
// 반환: [현재값, setter함수]
function useState(initialValue) {
  throw new Error('미구현: useState');
}

// 렌더링 이후 부수 효과를 실행하는 hook
// callback: 실행할 함수
// deps: 의존성 배열 — 이전 deps와 달라졌을 때만 callback 재실행
//       deps가 빈 배열이면 mount 시 1회만 실행
//       deps가 없으면 매 렌더링마다 실행
function useEffect(callback, deps) {
  throw new Error('미구현: useEffect');
}

// 비싼 연산 결과를 캐싱하는 hook
// factory: 계산 함수
// deps: 의존성 배열 — 변경 시에만 factory 재실행, 그 외에는 캐시 반환
// 반환: 계산된 값 (캐시 or 재계산)
function useMemo(factory, deps) {
  throw new Error('미구현: useMemo');
}
