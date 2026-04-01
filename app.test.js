// =============================================
// 담당: 팀 공통 | app.test.js
// 책임: app.js 순수 함수 + 상태 관리 화이트박스 테스트
// AI 규약 버전: v1.0
// =============================================

function assertTest(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// ─────────────────────────────────────────────
// 테스트 헬퍼: 전역 상태를 초기화하는 함수
// app.js의 전역 변수(history, historyIdx, currentVNode)를
// 테스트마다 깨끗하게 리셋해야 각 테스트가 서로 영향을 안 줘.
// ─────────────────────────────────────────────
function resetAppState() {
  history = [];
  historyIdx = -1;
  currentVNode = null;
}


// ─────────────────────────────────────────────
// cloneVNode() 화이트박스 테스트
// 내부 분기:
//   [1] null / undefined → 그대로 반환
//   [2] 일반 VNode → JSON 깊은 복사
// ─────────────────────────────────────────────

// 테스트 1: [1번 분기] null 입력 → null 반환
function test_cloneVNode_null입력_null반환() {
  // given
  const input = null;

  // when
  const result = cloneVNode(input);

  // then
  assertTest(result === null, '[cloneVNode] null 입력 시 null을 반환해야 한다');
  console.log('test_cloneVNode_null입력_null반환 완료');
}

// 테스트 2: [2번 분기] VNode를 복사하면 원본과 내용은 같되 참조는 다르다 (깊은 복사)
function test_cloneVNode_깊은복사_원본불변() {
  // given
  const original = { type: 'div', props: { class: 'card' }, children: ['내용'] };

  // when
  const cloned = cloneVNode(original);

  // then: 내용은 같아야 한다
  assertTest(cloned.type === 'div', '[cloneVNode] type이 복사되어야 한다');
  assertTest(cloned.props.class === 'card', '[cloneVNode] props가 복사되어야 한다');

  // then: 복사본을 수정해도 원본은 바뀌지 않아야 한다 (깊은 복사 검증)
  cloned.props.class = '변경됨';
  assertTest(original.props.class === 'card', '[cloneVNode] 복사본 수정이 원본에 영향을 주면 안 된다');
  console.log('test_cloneVNode_깊은복사_원본불변 완료');
}


// ─────────────────────────────────────────────
// escapeHtml() 화이트박스 테스트
// 내부 처리: & → &amp; / < → &lt; / > → &gt;
// XSS 방지를 위한 함수야.
// ─────────────────────────────────────────────

// 테스트 3: & < > 세 문자가 모두 올바르게 이스케이프된다
function test_escapeHtml_특수문자이스케이프() {
  // given: XSS 위험 문자들
  const input = '<script>alert("XSS")</script> & 기타';

  // when
  const result = escapeHtml(input);

  // then
  assertTest(result.includes('&lt;'), '[escapeHtml] <가 &lt;로 이스케이프되어야 한다');
  assertTest(result.includes('&gt;'), '[escapeHtml] >가 &gt;로 이스케이프되어야 한다');
  assertTest(result.includes('&amp;'), '[escapeHtml] &가 &amp;로 이스케이프되어야 한다');
  assertTest(!result.includes('<script>'), '[escapeHtml] 원본 <script> 태그가 남아있으면 안 된다');
  console.log('test_escapeHtml_특수문자이스케이프 완료');
}


// ─────────────────────────────────────────────
// getHtmlStringFromVNode() 화이트박스 테스트
// 내부 분기:
//   [1] null / undefined → 빈 문자열
//   [2] string → escapeHtml 적용
//   [3] props의 value가 false / null → 속성 제외
//   [4] props의 value가 true → 속성명만 출력
//   [5] 일반 props → key="value" 형식
//   [6] children → 재귀 변환 후 이어붙임
// ─────────────────────────────────────────────

// 테스트 4: [1번 분기] null → 빈 문자열 반환
function test_getHtmlStringFromVNode_null입력_빈문자열() {
  // given
  const vNode = null;

  // when
  const result = getHtmlStringFromVNode(vNode);

  // then
  assertTest(result === '', '[getHtmlStringFromVNode] null 입력 시 빈 문자열을 반환해야 한다');
  console.log('test_getHtmlStringFromVNode_null입력_빈문자열 완료');
}

// 테스트 5: [2번 분기] 문자열 VNode → XSS 이스케이프된 텍스트 반환
function test_getHtmlStringFromVNode_문자열_이스케이프() {
  // given: XSS 위험 문자가 포함된 텍스트
  const vNode = '<위험>';

  // when
  const result = getHtmlStringFromVNode(vNode);

  // then: < > 가 이스케이프되어야 한다
  assertTest(result === '&lt;위험&gt;', '[getHtmlStringFromVNode] 문자열은 이스케이프되어야 한다');
  console.log('test_getHtmlStringFromVNode_문자열_이스케이프 완료');
}

// 테스트 6: [3번 분기] props의 value가 false이면 해당 속성을 출력하지 않는다
function test_getHtmlStringFromVNode_false속성_제외() {
  // given: disabled가 false인 VNode
  const vNode = { type: 'button', props: { disabled: false }, children: [] };

  // when
  const result = getHtmlStringFromVNode(vNode);

  // then: disabled 속성이 HTML에 포함되면 안 된다
  assertTest(result === '<button></button>', '[getHtmlStringFromVNode] false 속성은 출력되면 안 된다');
  console.log('test_getHtmlStringFromVNode_false속성_제외 완료');
}

// 테스트 7: [4번 분기] props의 value가 true이면 속성명만 출력한다
function test_getHtmlStringFromVNode_true속성_속성명만출력() {
  // given: checked가 true인 VNode
  const vNode = { type: 'input', props: { checked: true }, children: [] };

  // when
  const result = getHtmlStringFromVNode(vNode);

  // then: checked 속성명만 들어가야 한다 (값 없이)
  assertTest(result.includes('checked'), '[getHtmlStringFromVNode] true 속성은 속성명만 출력되어야 한다');
  assertTest(!result.includes('checked="'), '[getHtmlStringFromVNode] true 속성에 ="..." 형식이 붙으면 안 된다');
  console.log('test_getHtmlStringFromVNode_true속성_속성명만출력 완료');
}

// 테스트 8: [5번+6번 분기] 일반 VNode → 올바른 HTML 문자열 생성
function test_getHtmlStringFromVNode_일반VNode_HTML문자열생성() {
  // given: class 속성과 텍스트 자식을 가진 VNode
  const vNode = {
    type: 'p',
    props: { class: 'text' },
    children: ['내용'],
  };

  // when
  const result = getHtmlStringFromVNode(vNode);

  // then
  assertTest(result === '<p class="text">내용</p>', '[getHtmlStringFromVNode] HTML 문자열이 올바르게 생성되어야 한다');
  console.log('test_getHtmlStringFromVNode_일반VNode_HTML문자열생성 완료');
}


// ─────────────────────────────────────────────
// pushHistory() 화이트박스 테스트
// 내부 분기:
//   [1] 정상 추가 → history 배열에 쌓임, historyIdx 증가
//   [2] 중간 위치에서 추가 → 이후 이력 잘림 (브랜칭)
// ─────────────────────────────────────────────

// 테스트 9: [1번 분기] pushHistory 호출 시 history에 추가되고 historyIdx가 증가한다
function test_pushHistory_정상추가() {
  // given: 상태 초기화
  resetAppState();
  const vNode = { type: 'div', props: {}, children: [] };

  // when
  pushHistory(vNode);

  // then
  assertTest(history.length === 1, '[pushHistory] history에 1개가 추가되어야 한다');
  assertTest(historyIdx === 0, '[pushHistory] historyIdx가 0이 되어야 한다');
  console.log('test_pushHistory_정상추가 완료');
}

// 테스트 10: [2번 분기] 중간 위치에서 pushHistory 호출 시 이후 이력이 잘린다
// 예) A → B → C 순서로 히스토리가 있을 때 B로 뒤로간 후 D를 추가하면
//     A → B → D 가 되어야 해. (C는 사라짐)
function test_pushHistory_중간위치_이후이력잘림() {
  // given: A, B, C 3개의 이력이 있고 B 위치(index 1)에 있는 상황
  resetAppState();
  const vNodeA = { type: 'div', props: {}, children: ['A'] };
  const vNodeB = { type: 'div', props: {}, children: ['B'] };
  const vNodeC = { type: 'div', props: {}, children: ['C'] };
  const vNodeD = { type: 'div', props: {}, children: ['D'] };

  pushHistory(vNodeA); // historyIdx = 0
  pushHistory(vNodeB); // historyIdx = 1
  pushHistory(vNodeC); // historyIdx = 2

  // 뒤로가기 → B 위치로 이동
  historyIdx = 1;

  // when: B 위치에서 새 VNode D를 추가
  pushHistory(vNodeD);

  // then: C가 사라지고 A, B, D 만 남아야 한다
  assertTest(history.length === 3, '[pushHistory] 이후 이력이 잘려 총 3개여야 한다');
  assertTest(historyIdx === 2, '[pushHistory] historyIdx가 2여야 한다');
  assertTest(history[2].vNode.children[0] === 'D', '[pushHistory] 마지막 이력이 D여야 한다');
  console.log('test_pushHistory_중간위치_이후이력잘림 완료');
}


// ─────────────────────────────────────────────
// restoreHistory() 화이트박스 테스트
// 내부 분기:
//   [1] 범위 밖 인덱스 → 아무것도 안 함
//   [2] 정상 인덱스 → currentVNode, historyIdx 갱신
// ─────────────────────────────────────────────

// 테스트 11: [1번 분기] 범위 밖 인덱스로 restoreHistory 호출 시 상태가 변하지 않는다
function test_restoreHistory_범위밖인덱스_무시() {
  // given: 이력 1개짜리 상태
  resetAppState();
  pushHistory({ type: 'div', props: {}, children: [] });
  const prevIdx = historyIdx; // 0

  // when: 존재하지 않는 인덱스(99) 로 복원 시도
  restoreHistory(99);

  // then: 상태가 바뀌지 않아야 한다
  assertTest(historyIdx === prevIdx, '[restoreHistory] 범위 밖 인덱스는 무시되어야 한다');
  console.log('test_restoreHistory_범위밖인덱스_무시 완료');
}

// 테스트 12: [1번 분기] 음수 인덱스로 restoreHistory 호출 시 상태가 변하지 않는다
function test_restoreHistory_음수인덱스_무시() {
  // given
  resetAppState();
  pushHistory({ type: 'div', props: {}, children: [] });

  // when
  restoreHistory(-1);

  // then
  assertTest(historyIdx === 0, '[restoreHistory] 음수 인덱스는 무시되어야 한다');
  console.log('test_restoreHistory_음수인덱스_무시 완료');
}


// =============================================
// 엣지 케이스 테스트
// =============================================

// 엣지 케이스 1: history가 비어있을 때 onBackClick 호출 → 상태 변화 없어야 한다
// historyIdx가 -1인 상태에서 뒤로가기를 누르면 restoreHistory(-2)가 호출되는데
// 범위 밖이므로 아무것도 안 해야 해
function test_edge_onBackClick_history비어있음_무반응() {
  // given: 히스토리가 비어있는 초기 상태
  resetAppState();
  // historyIdx === -1, history === []

  // when: 뒤로가기 버튼 클릭 (historyIdx - 1 = -2)
  onBackClick();

  // then: 상태 변화 없어야 한다
  assertTest(historyIdx === -1, '[엣지] 빈 히스토리에서 뒤로가기 해도 historyIdx가 -1이어야 한다');
  assertTest(history.length === 0, '[엣지] 빈 히스토리에서 뒤로가기 해도 history가 비어있어야 한다');
  console.log('test_edge_onBackClick_history비어있음_무반응 완료');
}

// 엣지 케이스 2: 마지막 위치에서 onForwardClick 호출 → 상태 변화 없어야 한다
function test_edge_onForwardClick_마지막위치_무반응() {
  // given: 이력이 2개이고 마지막(index 1)에 있는 상태
  resetAppState();
  pushHistory({ type: 'div', props: {}, children: ['A'] });
  pushHistory({ type: 'div', props: {}, children: ['B'] });
  // historyIdx === 1 (마지막)

  // when: 앞으로가기 버튼 클릭
  onForwardClick();

  // then: historyIdx가 그대로여야 한다
  assertTest(historyIdx === 1, '[엣지] 마지막 위치에서 앞으로가기 해도 historyIdx가 바뀌면 안 된다');
  console.log('test_edge_onForwardClick_마지막위치_무반응 완료');
}

// 엣지 케이스 3: pushHistory를 연속으로 여러 번 호출 → historyIdx가 정확히 증가해야 한다
function test_edge_pushHistory_연속다중추가_idx정확() {
  // given
  resetAppState();

  // when: 5번 연속으로 pushHistory 호출
  for (let i = 0; i < 5; i++) {
    pushHistory({ type: 'div', props: {}, children: [String(i)] });
  }

  // then: historyIdx가 4(마지막 인덱스)이고 history가 5개여야 한다
  assertTest(history.length === 5, '[엣지] 5번 추가하면 history가 5개여야 한다');
  assertTest(historyIdx === 4, '[엣지] 5번 추가하면 historyIdx가 4여야 한다');
  console.log('test_edge_pushHistory_연속다중추가_idx정확 완료');
}

// 엣지 케이스 4: 빈 문자열 입력 → getVNodeFromInput이 null을 반환해야 한다
// 사용자가 textarea를 완전히 비우고 Patch를 누르는 상황
function test_edge_getVNodeFromInput_빈문자열_null반환() {
  // given: 완전히 빈 문자열
  const emptyInput = '';

  // when
  const result = getVNodeFromInput(emptyInput);

  // then: null이 반환되어야 한다 (빈 화면 처리)
  assertTest(result === null, '[엣지] 빈 문자열은 null VNode를 반환해야 한다');
  console.log('test_edge_getVNodeFromInput_빈문자열_null반환 완료');
}

// 엣지 케이스 5: cloneVNode에 undefined 입력 → undefined 반환해야 한다
function test_edge_cloneVNode_undefined입력_undefined반환() {
  // given
  const input = undefined;

  // when
  const result = cloneVNode(input);

  // then
  assertTest(result === undefined, '[엣지] undefined 입력 시 undefined를 반환해야 한다');
  console.log('test_edge_cloneVNode_undefined입력_undefined반환 완료');
}

// =============================================
// Week 5 — Component / Hooks / 기능 테스트
// =============================================

function waitForMicrotaskForTest() {
  return new Promise(function (resolve) {
    queueMicrotask(resolve);
  });
}

function makeTestContainer() {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return container;
}

function removeTestContainer(container) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

function hideLevelUpPopupForTest() {
  const popup = document.getElementById('levelup-popup');

  if (!popup) {
    return;
  }

  clearTimeout(popup._hideTimer);
  popup.classList.add('levelup-hidden');
}

async function resetLiveAppStateForTest(nextState) {
  initializeGame();
  hideLevelUpPopupForTest();

  if (_setGameState) {
    _setGameState(nextState || getGameState());
    await waitForMicrotaskForTest();
  }
}

// ─────────────────────────────────────────────
// component.js 단위 테스트
// ─────────────────────────────────────────────

function test_component_renderComponent_현재컴포넌트등록및hookIndex초기화() {
  let observedComponent = null;
  let observedHookIndex = null;

  const component = {
    hookIndex: 7,
    fn: function () {
      observedComponent = getCurrentComponent();
      observedHookIndex = component.hookIndex;
      return '렌더 결과';
    }
  };

  const result = renderComponent(component);

  assertTest(result === '렌더 결과', '[component] renderComponent는 fn 반환값을 그대로 돌려줘야 한다');
  assertTest(observedComponent === component, '[component] 렌더링 중 현재 컴포넌트가 등록되어야 한다');
  assertTest(observedHookIndex === 0, '[component] 렌더링 시작 전에 hookIndex가 0으로 초기화되어야 한다');
  assertTest(getCurrentComponent() === null, '[component] 렌더링 종료 후 currentComponent는 null이어야 한다');
  console.log('test_component_renderComponent_현재컴포넌트등록및hookIndex초기화 완료');
}

function test_component_mount_초기VNode를실제DOM에렌더링() {
  const container = makeTestContainer();

  try {
    const component = new FunctionComponent(function () {
      return {
        type: 'section',
        props: { class: 'card' },
        children: [
          { type: 'h1', props: {}, children: ['초기 렌더링'] }
        ]
      };
    });

    component.mount(container);

    assertTest(container.querySelector('section.card') !== null, '[component] mount는 루트 엘리먼트를 실제 DOM에 렌더링해야 한다');
    assertTest(container.textContent.includes('초기 렌더링'), '[component] mount 결과 텍스트가 실제 DOM에 보여야 한다');
    console.log('test_component_mount_초기VNode를실제DOM에렌더링 완료');
  } finally {
    removeTestContainer(container);
  }
}

function test_component_update_같은루트에서텍스트만갱신() {
  const container = makeTestContainer();
  let label = '첫 화면';

  try {
    const component = new FunctionComponent(function () {
      return {
        type: 'p',
        props: { class: 'status' },
        children: [label]
      };
    });

    component.mount(container);
    const prevRootEl = container.firstChild;

    label = '둘째 화면';
    component.update();

    assertTest(container.firstChild === prevRootEl, '[component] 같은 루트 구조면 update가 루트 DOM을 재사용해야 한다');
    assertTest(container.textContent === '둘째 화면', '[component] update 후 텍스트가 새 상태로 반영되어야 한다');
    console.log('test_component_update_같은루트에서텍스트만갱신 완료');
  } finally {
    removeTestContainer(container);
  }
}

// ─────────────────────────────────────────────
// hooks.js 단위 테스트 + 엣지 케이스
// ─────────────────────────────────────────────

async function test_hooks_useState_초기값과함수형업데이트() {
  const container = makeTestContainer();
  let setCount = null;
  let renderCount = 0;

  try {
    const component = new FunctionComponent(function () {
      renderCount++;
      const statePair = useState(function () {
        return 1;
      });
      const count = statePair[0];
      setCount = statePair[1];

      return {
        type: 'span',
        props: {},
        children: [String(count)]
      };
    });

    component.mount(container);
    assertTest(renderCount === 1, '[useState] 최초 mount 시 1번 렌더링되어야 한다');
    assertTest(component.hooks[0].value === 1, '[useState] lazy initializer 결과가 최초 상태로 저장되어야 한다');

    setCount(function (prev) {
      return prev + 2;
    });
    await waitForMicrotaskForTest();

    assertTest(component.hooks[0].value === 3, '[useState] 함수형 업데이트가 이전 상태를 기반으로 계산되어야 한다');
    assertTest(container.textContent === '3', '[useState] 상태 변경 후 실제 DOM 텍스트가 업데이트되어야 한다');
    console.log('test_hooks_useState_초기값과함수형업데이트 완료');
  } finally {
    removeTestContainer(container);
  }
}

async function test_hooks_useState_같은턴여러업데이트_batching1회() {
  const container = makeTestContainer();
  let setCount = null;
  let renderCount = 0;

  try {
    const component = new FunctionComponent(function () {
      renderCount++;
      const statePair = useState(0);
      const count = statePair[0];
      setCount = statePair[1];

      return {
        type: 'span',
        props: {},
        children: [String(count)]
      };
    });

    component.mount(container);

    setCount(function (prev) { return prev + 1; });
    setCount(function (prev) { return prev + 1; });
    setCount(function (prev) { return prev + 1; });

    await waitForMicrotaskForTest();

    assertTest(renderCount === 2, '[batching] 같은 턴의 3번 setState는 1번의 추가 렌더링으로 묶여야 한다');
    assertTest(component.hooks[0].value === 3, '[batching] 여러 상태 변경 결과가 누적되어 최종 상태 3이 되어야 한다');
    console.log('test_hooks_useState_같은턴여러업데이트_batching1회 완료');
  } finally {
    removeTestContainer(container);
  }
}

async function test_hooks_useEffect_deps변경시에만재실행되고cleanup호출() {
  const container = makeTestContainer();
  let setCount = null;
  const logs = [];

  try {
    const component = new FunctionComponent(function () {
      const statePair = useState(0);
      const count = statePair[0];
      setCount = statePair[1];

      useEffect(function () {
        logs.push('effect:' + count);

        return function () {
          logs.push('cleanup:' + count);
        };
      }, [count]);

      return {
        type: 'span',
        props: {},
        children: [String(count)]
      };
    });

    component.mount(container);
    assertTest(logs.join(',') === 'effect:0', '[useEffect] mount 직후 effect가 1회 실행되어야 한다');

    setCount(0);
    await waitForMicrotaskForTest();
    assertTest(logs.join(',') === 'effect:0', '[useEffect] deps가 같으면 cleanup/effect가 다시 실행되면 안 된다');

    setCount(1);
    await waitForMicrotaskForTest();

    assertTest(logs.join(',') === 'effect:0,cleanup:0,effect:1', '[useEffect] deps 변경 시 이전 cleanup 후 새 effect가 실행되어야 한다');
    console.log('test_hooks_useEffect_deps변경시에만재실행되고cleanup호출 완료');
  } finally {
    removeTestContainer(container);
  }
}

async function test_hooks_edge_useEffect_deps없으면매렌더실행() {
  const container = makeTestContainer();
  let setCount = null;
  const logs = [];

  try {
    const component = new FunctionComponent(function () {
      const statePair = useState(0);
      const count = statePair[0];
      setCount = statePair[1];

      useEffect(function () {
        logs.push('effect:' + count);

        return function () {
          logs.push('cleanup:' + count);
        };
      });

      return {
        type: 'span',
        props: {},
        children: [String(count)]
      };
    });

    component.mount(container);
    setCount(0);
    await waitForMicrotaskForTest();
    setCount(0);
    await waitForMicrotaskForTest();

    assertTest(logs.join(',') === 'effect:0,cleanup:0,effect:0,cleanup:0,effect:0', '[useEffect 엣지] deps가 없으면 매 렌더마다 cleanup 후 effect가 재실행되어야 한다');
    console.log('test_hooks_edge_useEffect_deps없으면매렌더실행 완료');
  } finally {
    removeTestContainer(container);
  }
}

async function test_hooks_edge_batched상태변경후_effect는최신값으로1회실행() {
  const container = makeTestContainer();
  let setCount = null;
  const logs = [];

  try {
    const component = new FunctionComponent(function () {
      const statePair = useState(0);
      const count = statePair[0];
      setCount = statePair[1];

      useEffect(function () {
        logs.push('effect:' + count);

        return function () {
          logs.push('cleanup:' + count);
        };
      }, [count]);

      return {
        type: 'span',
        props: {},
        children: [String(count)]
      };
    });

    component.mount(container);

    setCount(1);
    setCount(2);
    setCount(3);
    await waitForMicrotaskForTest();

    assertTest(logs.join(',') === 'effect:0,cleanup:0,effect:3', '[useEffect 엣지] batched 업데이트 후 effect는 최신 state 기준으로 1회만 실행되어야 한다');
    console.log('test_hooks_edge_batched상태변경후_effect는최신값으로1회실행 완료');
  } finally {
    removeTestContainer(container);
  }
}

async function test_hooks_useMemo_deps같으면재계산하지않음() {
  const container = makeTestContainer();
  let setCount = null;
  let computeCount = 0;

  try {
    const component = new FunctionComponent(function () {
      const statePair = useState(0);
      const count = statePair[0];
      setCount = statePair[1];

      const memoValue = useMemo(function () {
        computeCount++;
        return { doubled: count * 2 };
      }, [count]);

      return {
        type: 'span',
        props: {},
        children: [String(memoValue.doubled)]
      };
    });

    component.mount(container);
    assertTest(computeCount === 1, '[useMemo] 최초 mount 시 factory가 1회 실행되어야 한다');

    setCount(0);
    await waitForMicrotaskForTest();
    assertTest(computeCount === 1, '[useMemo] deps가 같으면 factory를 다시 실행하면 안 된다');

    setCount(2);
    await waitForMicrotaskForTest();
    assertTest(computeCount === 2, '[useMemo] deps가 바뀌면 factory가 다시 실행되어야 한다');
    assertTest(component.hooks[1].value.doubled === 4, '[useMemo] 재계산 결과가 hook 슬롯에 저장되어야 한다');
    console.log('test_hooks_useMemo_deps같으면재계산하지않음 완료');
  } finally {
    removeTestContainer(container);
  }
}

async function test_hooks_edge_useMemo_deps없으면매렌더재계산() {
  const container = makeTestContainer();
  let setCount = null;
  let computeCount = 0;

  try {
    const component = new FunctionComponent(function () {
      const statePair = useState(0);
      const count = statePair[0];
      setCount = statePair[1];

      const memoValue = useMemo(function () {
        computeCount++;
        return count;
      });

      return {
        type: 'span',
        props: {},
        children: [String(memoValue)]
      };
    });

    component.mount(container);
    setCount(0);
    await waitForMicrotaskForTest();
    setCount(0);
    await waitForMicrotaskForTest();

    assertTest(computeCount === 3, '[useMemo 엣지] deps가 없으면 mount 포함 모든 렌더에서 재계산되어야 한다');
    console.log('test_hooks_edge_useMemo_deps없으면매렌더재계산 완료');
  } finally {
    removeTestContainer(container);
  }
}

function test_hooks_edge_렌더밖에서호출하면예외() {
  let thrownCount = 0;

  try {
    useState(0);
  } catch (error) {
    if (error.message.includes('Hook은 렌더링 중인 컴포넌트 안에서만 사용할 수 있습니다.')) {
      thrownCount++;
    }
  }

  try {
    useEffect(function () {}, []);
  } catch (error) {
    if (error.message.includes('Hook은 렌더링 중인 컴포넌트 안에서만 사용할 수 있습니다.')) {
      thrownCount++;
    }
  }

  try {
    useMemo(function () { return 1; }, []);
  } catch (error) {
    if (error.message.includes('Hook은 렌더링 중인 컴포넌트 안에서만 사용할 수 있습니다.')) {
      thrownCount++;
    }
  }

  assertTest(thrownCount === 3, '[hooks] 렌더링 밖에서 호출된 useState/useEffect/useMemo는 모두 예외를 던져야 한다');
  console.log('test_hooks_edge_렌더밖에서호출하면예외 완료');
}

// ─────────────────────────────────────────────
// 기능 테스트
// ─────────────────────────────────────────────

async function test_feature_handleCodingClick_성공시상태와UI반영() {
  const originalRandom = Math.random;

  try {
    Math.random = function () {
      return 0;
    };

    await resetLiveAppStateForTest();
    handleCodingClick();
    await waitForMicrotaskForTest();

    const liveState = appInstance.hooks[0].value;
    const realAreaText = document.getElementById('real-area').textContent;

    assertTest(liveState.exp === 20, '[기능] 코딩하기 성공 시 경험치가 20 올라야 한다');
    assertTest(liveState.gold === 90, '[기능] 코딩하기 성공 시 골드가 10 차감되어야 한다');
    assertTest(realAreaText.includes('20 / 100 EXP'), '[기능] 실제 화면의 경험치 바 텍스트가 갱신되어야 한다');
    assertTest(realAreaText.includes('90 G'), '[기능] 실제 화면의 골드 텍스트가 갱신되어야 한다');
    console.log('test_feature_handleCodingClick_성공시상태와UI반영 완료');
  } finally {
    Math.random = originalRandom;
  }
}

async function test_feature_levelUp시_useEffect팝업표시() {
  const originalRandom = Math.random;

  try {
    Math.random = function () {
      return 0;
    };

    await resetLiveAppStateForTest();
    handleOvertimeClick();
    await waitForMicrotaskForTest();
    handleOvertimeClick();
    await waitForMicrotaskForTest();

    const liveState = appInstance.hooks[0].value;
    const popup = document.getElementById('levelup-popup');
    const levelName = document.getElementById('levelup-name').textContent;

    assertTest(liveState.levelIdx === 1, '[기능] 레벨업 후 levelIdx가 1이어야 한다');
    assertTest(liveState.exp === 0, '[기능] 레벨업 직후 exp가 0으로 초기화되어야 한다');
    assertTest(!popup.classList.contains('levelup-hidden'), '[기능] 레벨업 시 팝업이 표시되어야 한다');
    assertTest(levelName === '주니어 개발자', '[기능] 팝업에 새 레벨 이름이 표시되어야 한다');
    console.log('test_feature_levelUp시_useEffect팝업표시 완료');
  } finally {
    Math.random = originalRandom;
    hideLevelUpPopupForTest();
  }
}

async function test_feature_edge_골드부족시상태변화없음() {
  const originalRandom = Math.random;

  try {
    Math.random = function () {
      return 0;
    };

    await resetLiveAppStateForTest({
      levelIdx: 0,
      exp: 10,
      gold: 0
    });

    handleCodingClick();
    await waitForMicrotaskForTest();

    const liveState = appInstance.hooks[0].value;
    assertTest(liveState.exp === 10, '[엣지 기능] 골드가 부족하면 경험치가 바뀌면 안 된다');
    assertTest(liveState.gold === 0, '[엣지 기능] 골드가 부족하면 골드가 음수가 되면 안 된다');
    assertTest(liveState.levelIdx === 0, '[엣지 기능] 골드가 부족하면 레벨 상태가 유지되어야 한다');
    console.log('test_feature_edge_골드부족시상태변화없음 완료');
  } finally {
    Math.random = originalRandom;
  }
}

async function test_feature_edge_최대레벨에서exp가max를초과하지않음() {
  const originalRandom = Math.random;

  try {
    Math.random = function () {
      return 0;
    };

    await resetLiveAppStateForTest({
      levelIdx: 4,
      exp: 990,
      gold: 100
    });

    handleOvertimeClick();
    await waitForMicrotaskForTest();

    const liveState = appInstance.hooks[0].value;
    assertTest(liveState.levelIdx === 4, '[엣지 기능] 최대 레벨에서는 추가 레벨업이 발생하면 안 된다');
    assertTest(liveState.exp === 999, '[엣지 기능] 최대 레벨의 exp는 maxExp를 초과하지 않고 999로 고정되어야 한다');
    assertTest(liveState.gold === 70, '[엣지 기능] 액션 성공 시 최대 레벨이어도 골드는 정상 차감되어야 한다');
    console.log('test_feature_edge_최대레벨에서exp가max를초과하지않음 완료');
  } finally {
    Math.random = originalRandom;
  }
}
