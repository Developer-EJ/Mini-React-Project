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
  const hookContext = getHookContext();
  const component = hookContext.component;
  const hookIndex = hookContext.hookIndex;
  let slot = component.hooks[hookIndex];

  if (!slot || slot.type !== 'state') {
    slot = {
      type: 'state',
      value: initialValue
    };
    component.hooks[hookIndex] = slot;
  }

  function setState(nextValue) {
    try {
      const prevValue = slot.value;
      slot.value = typeof nextValue === 'function' ? nextValue(prevValue) : nextValue;

      if (typeof component.update === 'function') {
        component.update();
      }
    } catch (error) {
      console.error('useState 상태 변경 중 오류', error);
      throw error;
    }
  }

  return [slot.value, setState];
}

// 렌더링 이후 부수 효과를 실행하는 hook
// callback: 실행할 함수
// deps: 의존성 배열 — 이전 deps와 달라졌을 때만 callback 재실행
//       deps가 빈 배열이면 mount 시 1회만 실행
//       deps가 없으면 매 렌더링마다 실행
function useEffect(callback, deps) {
  const hookContext = getHookContext();
  const component = hookContext.component;
  const hookIndex = hookContext.hookIndex;
  let slot = component.hooks[hookIndex];
  const isFirstRun = !slot || slot.type !== 'effect';

  if (isFirstRun) {
    slot = {
      type: 'effect',
      deps: undefined,
      cleanup: null,
      scheduleId: 0
    };
    component.hooks[hookIndex] = slot;
  }

  const shouldRun = isFirstRun || deps === undefined || !areDepsSame(slot.deps, deps);
  slot.deps = cloneDeps(deps);

  if (!shouldRun) {
    return;
  }

  slot.scheduleId += 1;
  const currentScheduleId = slot.scheduleId;

  setTimeout(function () {
    if (slot.scheduleId !== currentScheduleId) {
      return;
    }

    if (typeof slot.cleanup === 'function') {
      try {
        slot.cleanup();
      } catch (error) {
        console.error('useEffect cleanup 실행 중 오류', error);
      }
    }

    try {
      const cleanup = callback();
      slot.cleanup = typeof cleanup === 'function' ? cleanup : null;
    } catch (error) {
      slot.cleanup = null;
      console.error('useEffect 실행 중 오류', error);
    }
  }, 0);
}

// 비싼 연산 결과를 캐싱하는 hook
// factory: 계산 함수
// deps: 의존성 배열 — 변경 시에만 factory 재실행, 그 외에는 캐시 반환
// 반환: 계산된 값 (캐시 or 재계산)
function useMemo(factory, deps) {
  const hookContext = getHookContext();
  const component = hookContext.component;
  const hookIndex = hookContext.hookIndex;
  let slot = component.hooks[hookIndex];
  const isFirstRun = !slot || slot.type !== 'memo';
  const shouldRecompute = isFirstRun || deps === undefined || !areDepsSame(slot.deps, deps);

  if (isFirstRun) {
    slot = {
      type: 'memo',
      value: undefined,
      deps: undefined
    };
    component.hooks[hookIndex] = slot;
  }

  if (shouldRecompute) {
    try {
      slot.value = factory();
      slot.deps = cloneDeps(deps);
    } catch (error) {
      console.error('useMemo 계산 중 오류', error);
      throw error;
    }
  }

  return slot.value;
}

function getHookContext() {
  if (typeof getCurrentComponent !== 'function') {
    throw new Error('getCurrentComponent를 찾을 수 없습니다.');
  }

  const component = getCurrentComponent();

  if (!component) {
    throw new Error('Hook은 렌더링 중인 컴포넌트 안에서만 사용할 수 있습니다.');
  }

  if (!Array.isArray(component.hooks)) {
    component.hooks = [];
  }

  if (typeof component.hookIndex !== 'number') {
    component.hookIndex = 0;
  }

  const hookIndex = component.hookIndex;
  component.hookIndex += 1;

  return {
    component: component,
    hookIndex: hookIndex
  };
}

function areDepsSame(oldDeps, newDeps) {
  if (!Array.isArray(oldDeps) || !Array.isArray(newDeps)) {
    return false;
  }

  if (oldDeps.length !== newDeps.length) {
    return false;
  }

  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], newDeps[i])) {
      return false;
    }
  }

  return true;
}

function cloneDeps(deps) {
  if (!Array.isArray(deps)) {
    return deps;
  }

  return deps.slice();
}
