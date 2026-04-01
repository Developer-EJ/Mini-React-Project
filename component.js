// =============================================
// 담당: 고민석 | component.js
// 책임: FunctionComponent 클래스 구현
//       hooks.js와의 연결 고리 (currentComponent 관리)
// =============================================

// 현재 렌더링 중인 컴포넌트 인스턴스
// hooks.js의 useState 등이 이 값을 참조하여 올바른 컴포넌트에 상태를 저장한다
let currentComponent = null;

// 렌더링 시작 시 현재 컴포넌트를 등록한다
// hooks.js에서 getCurrentComponent()로 접근한다
function setCurrentComponent(component) {
  throw new Error('미구현: setCurrentComponent');
}

// hooks.js가 hook 상태를 저장할 컴포넌트 인스턴스를 가져간다
function getCurrentComponent() {
  throw new Error('미구현: getCurrentComponent');
}

// 렌더링 시작 시 hook 호출 순서를 초기화한다
// 매 렌더링마다 hookIndex가 0부터 다시 시작해야 hooks 배열 순서가 보장된다
function resetHookIndex() {
  throw new Error('미구현: resetHookIndex');
}

// 함수형 컴포넌트를 감싸는 클래스
// fn: () => VNode 형태의 함수형 컴포넌트
class FunctionComponent {
  constructor(fn) {
    this.fn = fn;         // 함수형 컴포넌트 함수
    this.hooks = [];      // hook 상태 저장 배열 (useState, useEffect, useMemo)
    this.hookIndex = 0;   // 현재 렌더링 중 hook 호출 순서 추적
    this.vNode = null;    // 이전 렌더링 결과 VNode (diff용 oldNode)
    this.container = null; // 마운트된 실제 DOM 컨테이너
  }

  // 최초 렌더링
  // container: 실제 DOM에 마운트할 부모 엘리먼트
  mount(container) {
    throw new Error('미구현: FunctionComponent.mount');
  }

  // 상태 변경 후 다시 렌더링
  // 이전 vNode와 새 vNode를 diff하여 바뀐 부분만 실제 DOM에 반영한다
  update() {
    throw new Error('미구현: FunctionComponent.update');
  }
}
