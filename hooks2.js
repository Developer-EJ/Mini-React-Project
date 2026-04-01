// =============================================
// 실험용 대안 버전 | hooks2.js
// 목표: hooks.js는 유지하고, 다른 전략의 Hook 동작을 비교해본다
// 차이점:
// 1) useState는 setter 호출 시 즉시 상태를 반영하고 update를 호출
// 2) useEffect는 render 중 실행하지 않고 큐에만 저장
// 3) patch 이후 외부에서 flushEffects(component)를 호출할 때 effect 실행
// =============================================

// 상태를 저장하고 변경할 수 있는 hook
// initialValue: 최초 렌더링 시 사용할 초기값 또는 lazy initializer 함수
// 반환: [현재값, setter함수]
function useState(initialValue) {
  const hookContext = getHookContext();
  const component = hookContext.component;
  const hookIndex = hookContext.hookIndex;
  let slot = component.hooks[hookIndex];

  if (!slot || slot.type !== 'state') {
    slot = {
      type: 'state',
      value: typeof initialValue === 'function' ? initialValue() : initialValue
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
      console.error('hooks2 useState 상태 변경 중 오류', error);
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
// 주의: 여기서는 effect를 즉시 실행하지 않고 pendingEffects에 등록만 한다
// 실제 실행은 patch 완료 후 flushEffects(component)가 담당한다
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
      nextCallback: null,
      nextDeps: undefined,
      isQueued: false
    };
    component.hooks[hookIndex] = slot;
  }

  if (!isFirstRun && deps !== undefined && areDepsSame(slot.deps, deps)) {
    return;
  }

  slot.nextCallback = callback;
  slot.nextDeps = cloneDeps(deps);
  enqueueEffect(component, slot);
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
      console.error('hooks2 useMemo 계산 중 오류', error);
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

function enqueueEffect(component, slot) {
  if (!Array.isArray(component.pendingEffects)) {
    component.pendingEffects = [];
  }

  slot.isQueued = true;

  if (!component.pendingEffects.includes(slot)) {
    component.pendingEffects.push(slot);
  }
}

function flushEffects(component) {
  if (!component) {
    return;
  }

  const pendingEffects = Array.isArray(component.pendingEffects)
    ? component.pendingEffects.slice()
    : [];

  component.pendingEffects = [];

  pendingEffects.forEach(function (slot) {
    slot.isQueued = false;

    if (typeof slot.nextCallback !== 'function') {
      return;
    }

    if (typeof slot.cleanup === 'function') {
      try {
        slot.cleanup();
      } catch (error) {
        console.error('hooks2 useEffect cleanup 실행 중 오류', error);
      }
    }

    try {
      const cleanup = slot.nextCallback();
      slot.cleanup = typeof cleanup === 'function' ? cleanup : null;
      slot.deps = slot.nextDeps;
    } catch (error) {
      slot.cleanup = null;
      console.error('hooks2 useEffect 실행 중 오류', error);
    }

    slot.nextCallback = null;
    slot.nextDeps = undefined;
  });
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
