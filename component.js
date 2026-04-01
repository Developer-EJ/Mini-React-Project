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
  currentComponent = component;
}

// hooks.js가 hook 상태를 저장할 컴포넌트 인스턴스를 가져간다
function getCurrentComponent() {
  return currentComponent;
}

// 렌더링 시작 시 hook 호출 순서를 초기화한다
// 매 렌더링마다 hookIndex가 0부터 다시 시작해야 hooks 배열 순서가 보장된다
function resetHookIndex() {
  if (!currentComponent) {
    return;
  }

  currentComponent.hookIndex = 0;
}

// 공통 렌더링 진입점
// 현재 컴포넌트를 등록하고 hook 순서를 초기화한 뒤 함수형 컴포넌트를 실행한다
function renderComponent(component) {
  setCurrentComponent(component);
  resetHookIndex();

  try {
    return component.fn();
  } finally {
    setCurrentComponent(null);
  }
}

// useEffect 구현을 위해 hooks 배열을 한 바퀴 돌며 실행 대상 effect를 처리한다
// hooks.js에서 shouldRun / callback / cleanup 형태로 저장한다고 가정한다
function flushEffects(component) {
  component.hooks.forEach(function (hook) {
    if (!hook || hook.type !== 'effect' || !hook.shouldRun) {
      return;
    }

    if (typeof hook.cleanup === 'function') {
      hook.cleanup();
    }

    const cleanup = hook.callback();
    hook.cleanup = typeof cleanup === 'function' ? cleanup : null;
    hook.shouldRun = false;
  });
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
    this.isUpdateScheduled = false; // update가 이미 예약되었는지 여부
  }

  // 최초 렌더링
  // container: 실제 DOM에 마운트할 부모 엘리먼트
  mount(container) {
    try {
      this.container = container;

      const newVNode = renderComponent(this);

      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
      }

      if (newVNode !== null && newVNode !== undefined) {
        this.container.appendChild(createNode(newVNode));
      }

      this.vNode = newVNode;
      flushEffects(this);
    } catch (error) {
      console.error('컴포넌트 최초 렌더링 중 오류', error);
      throw error;
    }
  }

  // 상태 변경 후 다시 렌더링
  // 이전 vNode와 새 vNode를 diff하여 바뀐 부분만 실제 DOM에 반영한다
  update() {
    try {
      if (!this.container) {
        return;
      }

      const oldVNode = this.vNode;
      const newVNode = renderComponent(this);
      const realEl = this.container.firstChild || null;
      const patches = diff(oldVNode, newVNode, this.container, realEl);

      patch(patches);

      this.vNode = newVNode;
      flushEffects(this);
    } catch (error) {
      console.error('컴포넌트 업데이트 중 오류', error);
      throw error;
    }
  }
}
