// =============================================
// 담당: 김은재 | app.js
// 책임: 앱 초기화, UI 패널 갱신, 테스트 러너
// =============================================

// 현재 real-area에 반영된 최신 VNode
// update() 시 oldNode 역할로 diff()에 전달된다
let currentVNode = null;

// FunctionComponent 인스턴스 (전역 참조)
let appInstance = null;

// useState setter — App 렌더링마다 갱신되어 최신 클로저를 유지한다
let _setGameState = null;

// 닫는 태그가 없는 HTML 태그 목록
// 예) <br>, <img>, <input>
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

// VNode 깊은 복사
// JSON 기반으로 처리하며, null/undefined는 그대로 반환한다
function cloneVNode(vNode) {
  if (vNode === null || vNode === undefined) {
    return vNode;
  }

  return JSON.parse(JSON.stringify(vNode));
}

// 두 VNode가 동일한지 비교
// JSON 직렬화로 구조적 동등성을 판단한다
function isSameVNode(oldNode, newNode) {
  if (oldNode === newNode) {
    return true;
  }

  if (oldNode === null || oldNode === undefined || newNode === null || newNode === undefined) {
    return false;
  }

  return JSON.stringify(oldNode) === JSON.stringify(newNode);
}

// VNode를 HTML 문자열로 변환
// depth를 넘기면 들여쓰기 적용 (pretty-print), 생략하면 flat 출력
function getHtmlStringFromVNode(vNode, depth) {
  const isPretty = depth !== undefined;
  const indent = isPretty ? '  '.repeat(depth) : '';

  if (vNode === null || vNode === undefined) {
    return '';
  }

  // 텍스트 노드: 들여쓰기 + 이스케이프
  if (typeof vNode === 'string') {
    const text = escapeHtml(vNode);
    return isPretty ? indent + text : text;
  }

  // props 객체를 HTML 속성 문자열로 변환
  const props = Object.entries(vNode.props || {})
    .map(([key, value]) => {
      if (value === false || value === null || value === undefined) {
        return '';
      }
      if (value === true) {
        return key;
      }
      return key + '="' + escapeAttribute(String(value)) + '"';
    })
    .filter(Boolean)
    .join(' ');

  const openTag = props ? '<' + vNode.type + ' ' + props + '>' : '<' + vNode.type + '>';

  // void 태그는 닫는 태그 없이 출력
  if (VOID_TAGS.has(vNode.type)) {
    return indent + openTag;
  }

  if (!isPretty) {
    const children = (vNode.children || [])
      .map((child) => getHtmlStringFromVNode(child))
      .join('');
    return openTag + children + '</' + vNode.type + '>';
  }

  // pretty-print: 자식을 depth+1로 재귀하여 줄바꿈 + 들여쓰기
  const childLines = (vNode.children || [])
    .map((child) => getHtmlStringFromVNode(child, depth + 1))
    .filter((s) => s.trim() !== '');

  if (childLines.length === 0) {
    return indent + openTag + '</' + vNode.type + '>';
  }

  return indent + openTag + '\n' + childLines.join('\n') + '\n' + indent + '</' + vNode.type + '>';
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeAttribute(text) {
  return escapeHtml(text).replaceAll('"', '&quot;');
}

// real-area의 내용을 비우고 새 VNode로 다시 렌더링
function renderVNodeToRealArea(vNode) {
  const realArea = document.getElementById('real-area');

  if (!realArea) {
    return;
  }

  while (realArea.firstChild) {
    realArea.removeChild(realArea.firstChild);
  }

  if (vNode === null || vNode === undefined) {
    return;
  }

  realArea.appendChild(createNode(vNode));
}

// =============================================
// VDOM 패널
// =============================================

// span 헬퍼: parent에 className + text로 span 추가
function appendSpan(parent, className, text) {
  const span = document.createElement('span');
  span.className = className;
  span.textContent = text;
  parent.appendChild(span);
}

// 들여쓰기 단위 (px)
const VDOM_INDENT = 18;

// 한 줄 DOM 요소 생성
function makeLine(depth) {
  const el = document.createElement('div');
  el.className = 'vdom-line';
  el.style.paddingLeft = (depth * VDOM_INDENT) + 'px';
  return el;
}

// VDOM 트리를 JS 객체 형식으로 DOM 요소 재귀 빌드
function buildVDomTree(vNode, depth, oldVNode) {
  const wrapper = document.createElement('div');

  if (vNode === null || vNode === undefined) {
    return wrapper;
  }

  // old에 대응 노드가 없으면 새로 추가된 것
  const isAdded = oldVNode === null || oldVNode === undefined;

  // 텍스트 노드
  if (typeof vNode === 'string') {
    if (vNode.trim() === '') {
      return wrapper;
    }

    const line = makeLine(depth);
    if (isAdded) {
      line.classList.add('vdom-line-added');
    } else if (typeof oldVNode === 'string' && oldVNode !== vNode) {
      line.classList.add('vdom-line-changed');
    }
    appendSpan(line, 'vdom-string', '"' + vNode.trim() + '"');
    appendSpan(line, 'vdom-punct', ',');
    wrapper.appendChild(line);
    return wrapper;
  }

  const oldIsElement = !isAdded && typeof oldVNode === 'object';
  const isTypeChanged = oldIsElement && oldVNode.type !== vNode.type;
  const isPropsChanged = oldIsElement && JSON.stringify(oldVNode.props || {}) !== JSON.stringify(vNode.props || {});

  // 여는 중괄호 {
  const openLine = makeLine(depth);
  appendSpan(openLine, 'vdom-punct', '{');
  wrapper.appendChild(openLine);

  // type: "tagname",
  const typeLine = makeLine(depth + 1);
  if (isAdded) {
    typeLine.classList.add('vdom-line-added');
  } else if (isTypeChanged) {
    typeLine.classList.add('vdom-line-changed');
  }
  appendSpan(typeLine, 'vdom-key', 'type');
  appendSpan(typeLine, 'vdom-punct', ': ');
  appendSpan(typeLine, 'vdom-string', '"' + vNode.type + '"');
  appendSpan(typeLine, 'vdom-punct', ',');
  wrapper.appendChild(typeLine);

  // props: { key: "val" },
  const propsLine = makeLine(depth + 1);
  if (isAdded) {
    propsLine.classList.add('vdom-line-added');
  } else if (isPropsChanged) {
    propsLine.classList.add('vdom-line-changed');
  }
  appendSpan(propsLine, 'vdom-key', 'props');
  appendSpan(propsLine, 'vdom-punct', ': ');

  const propEntries = Object.entries(vNode.props || {});
  if (propEntries.length === 0) {
    appendSpan(propsLine, 'vdom-punct', '{}');
  } else {
    appendSpan(propsLine, 'vdom-punct', '{ ');
    propEntries.forEach(function (entry, i) {
      const key = entry[0];
      const val = entry[1];
      appendSpan(propsLine, 'vdom-prop-key', key);
      appendSpan(propsLine, 'vdom-punct', ': ');
      appendSpan(propsLine, 'vdom-string', val === true ? 'true' : '"' + val + '"');
      if (i < propEntries.length - 1) {
        appendSpan(propsLine, 'vdom-punct', ', ');
      }
    });
    appendSpan(propsLine, 'vdom-punct', ' }');
  }
  appendSpan(propsLine, 'vdom-punct', ',');
  wrapper.appendChild(propsLine);

  // children: [
  const childrenLine = makeLine(depth + 1);
  appendSpan(childrenLine, 'vdom-key', 'children');
  appendSpan(childrenLine, 'vdom-punct', ': [');
  wrapper.appendChild(childrenLine);

  // 자식 재귀 (인덱스 기준으로 old 자식과 매칭)
  const children = (vNode.children || []).filter(function (c) {
    return typeof c !== 'string' || c.trim() !== '';
  });
  const oldChildren = oldIsElement
    ? (oldVNode.children || []).filter(function (c) {
        return typeof c !== 'string' || c.trim() !== '';
      })
    : [];

  children.forEach(function (child, i) {
    const oldChild = i < oldChildren.length ? oldChildren[i] : null;
    wrapper.appendChild(buildVDomTree(child, depth + 2, oldChild));
  });

  // ]
  const closeArrLine = makeLine(depth + 1);
  appendSpan(closeArrLine, 'vdom-punct', ']');
  wrapper.appendChild(closeArrLine);

  // }
  const closeLine = makeLine(depth);
  appendSpan(closeLine, 'vdom-punct', depth > 0 ? '},' : '}');
  wrapper.appendChild(closeLine);

  return wrapper;
}

// VDOM 패널 갱신 (oldVNode 전달 시 변경된 줄 하이라이트)
function updateVDomPanel(vNode, oldVNode) {
  const area = document.getElementById('vdom-area');

  if (!area) {
    return;
  }

  while (area.firstChild) {
    area.removeChild(area.firstChild);
  }

  if (!vNode) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '(비어 있음)';
    area.appendChild(empty);
    return;
  }

  area.appendChild(buildVDomTree(vNode, 0, oldVNode || null));
}

// =============================================
// PATCH 패널
// =============================================

// Virtual patch 하나를 아이템 DOM으로 변환
function buildPatchItem(p) {
  const item = document.createElement('div');
  item.className = 'patch-item patch-type-' + p.type;

  const badge = document.createElement('span');
  badge.className = 'patch-badge';
  badge.textContent = p.type;
  item.appendChild(badge);

  const detail = document.createElement('span');
  detail.className = 'patch-detail';

  switch (p.type) {
    case 'create':
      detail.textContent = '<' + p.vNode.type + '>';
      break;
    case 'remove':
      detail.textContent = '<' + (p.el ? p.el.nodeName.toLowerCase() : '?') + '>';
      break;
    case 'replace':
      detail.textContent = '<' + (p.el ? p.el.nodeName.toLowerCase() : '?') + '> → <' + p.vNode.type + '>';
      break;
    case 'text':
      detail.textContent = '"' + p.value + '"';
      break;
    case 'props': {
      const allKeys = new Set([
        ...Object.keys(p.oldProps || {}),
        ...Object.keys(p.newProps || {})
      ]);
      const changed = [];
      allKeys.forEach(function (key) {
        if ((p.oldProps || {})[key] !== (p.newProps || {})[key]) {
          changed.push(key);
        }
      });
      detail.textContent = changed.join(', ');
      break;
    }
    default:
      detail.textContent = '';
  }

  item.appendChild(detail);
  return item;
}

// MutationRecord 하나를 아이템 DOM으로 변환
function buildMutationItem(m) {
  const item = document.createElement('div');

  let typeClass = 'props';
  if (m.type === 'childList') {
    typeClass = m.addedNodes.length > 0 ? 'create' : 'remove';
  } else if (m.type === 'characterData') {
    typeClass = 'text';
  }
  item.className = 'patch-item patch-type-' + typeClass;

  const badge = document.createElement('span');
  badge.className = 'patch-badge';
  badge.textContent = m.type;
  item.appendChild(badge);

  const detail = document.createElement('span');
  detail.className = 'patch-detail';

  if (m.type === 'childList') {
    const added = Array.from(m.addedNodes).map(function (n) {
      return n.nodeName.toLowerCase();
    }).join(', ');
    const removed = Array.from(m.removedNodes).map(function (n) {
      return n.nodeName.toLowerCase();
    }).join(', ');
    const parts = [];
    if (added) { parts.push('+' + added); }
    if (removed) { parts.push('-' + removed); }
    detail.textContent = parts.join(' / ');
  } else if (m.type === 'attributes') {
    detail.textContent = m.attributeName + ': "' + m.target.getAttribute(m.attributeName) + '"';
  } else if (m.type === 'characterData') {
    const text = m.target.textContent.trim();
    detail.textContent = '"' + (text.length > 30 ? text.slice(0, 30) + '…' : text) + '"';
  }

  item.appendChild(detail);
  return item;
}

// Patch 내역 패널 갱신 (diff 계획 + MutationObserver 실제 감지 비교)
function updatePatchPanel(patches, domMutations) {
  const area = document.getElementById('patch-area');

  if (!area) {
    return;
  }

  while (area.firstChild) {
    area.removeChild(area.firstChild);
  }

  if ((!patches || patches.length === 0) && (!domMutations || domMutations.length === 0)) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '버튼을 클릭하면\n변경 내역이 여기 표시됩니다';
    empty.style.whiteSpace = 'pre-line';
    area.appendChild(empty);
    return;
  }

  // 두 컬럼 레이아웃
  const columns = document.createElement('div');
  columns.className = 'patch-columns';

  // ── 왼쪽: diff 계획 ──
  const leftCol = document.createElement('div');
  leftCol.className = 'patch-col';

  const leftHeader = document.createElement('div');
  leftHeader.className = 'patch-col-header patch-col-header-plan';
  leftHeader.textContent = '⚙ DIFF 계획';
  leftCol.appendChild(leftHeader);

  if (!patches || patches.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '(diff 계획 없음)';
    leftCol.appendChild(empty);
  } else {
    patches.forEach(function (p) {
      leftCol.appendChild(buildPatchItem(p));
    });
  }

  // ── 오른쪽: 실제 DOM 감지 ──
  const rightCol = document.createElement('div');
  rightCol.className = 'patch-col';

  const rightHeader = document.createElement('div');
  rightHeader.className = 'patch-col-header patch-col-header-real';
  rightHeader.textContent = '👁 실제 DOM 감지';
  rightCol.appendChild(rightHeader);

  if (!domMutations || domMutations.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '감지된 변화 없음';
    rightCol.appendChild(empty);
  } else {
    domMutations.forEach(function (m) {
      rightCol.appendChild(buildMutationItem(m));
    });
  }

  columns.appendChild(leftCol);
  columns.appendChild(rightCol);
  area.appendChild(columns);
}

// 테스트 로그를 patch 패널에 표시
function updatePatchLogPanel(logs) {
  const area = document.getElementById('patch-area');

  if (!area) {
    return;
  }

  while (area.firstChild) {
    area.removeChild(area.firstChild);
  }

  if (!logs || logs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '테스트 로그가 없습니다.';
    area.appendChild(empty);
    return;
  }

  logs.forEach(function (log) {
    const item = document.createElement('div');
    item.className = 'patch-item patch-type-' + log.type;

    const badge = document.createElement('span');
    badge.className = 'patch-badge';
    badge.textContent = log.label;
    item.appendChild(badge);

    const detail = document.createElement('span');
    detail.className = 'patch-detail';
    detail.textContent = log.detail;
    item.appendChild(detail);

    area.appendChild(item);
  });
}

// =============================================
// 테스트 러너
// =============================================

// =============================================
// App 루트 컴포넌트
// =============================================

// 레벨업 팝업을 잠깐 표시한다
// levelName: 새 레벨 이름, levelIcon: 레벨 아이콘 이모지
function showLevelUpPopup(levelName, levelIcon) {
  const popup = document.getElementById('levelup-popup');

  if (!popup) {
    return;
  }

  document.getElementById('levelup-icon').textContent = levelIcon;
  document.getElementById('levelup-name').textContent = levelName;

  // 이전 타이머가 있으면 취소 후 애니메이션 재시작
  clearTimeout(popup._hideTimer);
  popup.classList.remove('levelup-hidden');
  popup.style.animation = 'none';
  void popup.offsetWidth; // 강제 reflow — 애니메이션 재시작을 위해 필요
  popup.style.animation = '';

  popup._hideTimer = setTimeout(function() {
    popup.classList.add('levelup-hidden');
  }, 2500);
}

// useState로 게임 상태 관리 — hooks 배열 시각화의 핵심
function App() {
  const [gs, setGs] = useState(getGameState());
  // 최신 setter를 전역에 노출 (triggerGameAction에서 호출)
  _setGameState = setGs;

  // game.js 내부 상태를 hooks 상태와 동기화
  restoreGameState(gs);

  // VNode 트리 — gs 세 값이 바뀌지 않으면 generateProfileVNode() 재호출 스킵
  const profileVNode = useMemo(function() {
    return generateProfileVNode();
  }, [gs.levelIdx, gs.exp, gs.gold]);

  // levelIdx가 바뀔 때만 실행 — 레벨업 감지
  useEffect(function() {
    // 초기 마운트(레벨 1)에서는 팝업을 표시하지 않는다
    if (gs.levelIdx === 0) {
      return;
    }
    const lvl = getCurrentLevel();
    showLevelUpPopup(lvl.levelName, lvl.levelIcon);
  }, [gs.levelIdx]);

  return profileVNode;
}

// =============================================
// 게임 액션 래퍼
// =============================================

// game.js 액션 실행 → useState 갱신 → component.update() 자동 호출
function triggerGameAction(actionFn) {
  if (!_setGameState || !appInstance) {
    return;
  }

  const oldVNode = cloneVNode(appInstance.vNode);
  // 렌더링 전 hooks 스냅샷 — deps 변화 비교용
  const oldHooks = appInstance.hooks.map(function(h) { return Object.assign({}, h); });

  // game.js 액션 실행 → 내부 gameState 변경
  actionFn();

  const newState = getGameState();
  resetPendingPatch();

  _setGameState(newState);

  // 패널 갱신
  updateVDomPanel(appInstance.vNode, oldVNode);
  updateHooksPanel(appInstance.hooks, oldHooks);
  updateDepsPanel(appInstance.hooks, oldHooks);
}

function handleCodingClick()   { triggerGameAction(onCodingClick); }
function handleProjectClick()  { triggerGameAction(onProjectClick); }
function handleStudyClick()    { triggerGameAction(onStudyClick); }
function handleOvertimeClick() { triggerGameAction(onOvertimeClick); }
function handleHireClick()     { triggerGameAction(onHireClick); }

// =============================================
// HOOKS 패널
// =============================================

// hook 카드 내 key-value 한 행 추가
function appendHookField(parent, key, value) {
  const field = document.createElement('div');
  field.className = 'hook-field';

  const keyEl = document.createElement('span');
  keyEl.className = 'hook-field-key';
  keyEl.textContent = key;
  field.appendChild(keyEl);

  const valEl = document.createElement('span');
  valEl.className = 'hook-field-value';
  valEl.textContent = value;
  field.appendChild(valEl);

  parent.appendChild(field);
}

// HOOKS 패널 갱신 — hooks[] 배열을 카드 형식으로 시각화
// oldHooks: 렌더링 전 스냅샷 — 전달 시 deps 변화를 이전값 → 현재값 형식으로 표시
function updateHooksPanel(hooks, oldHooks) {
  const area = document.getElementById('hooks-area');

  if (!area) {
    return;
  }

  while (area.firstChild) {
    area.removeChild(area.firstChild);
  }

  if (!hooks || hooks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '(hooks 없음)';
    area.appendChild(empty);
    return;
  }

  hooks.forEach(function (hook, i) {
    if (!hook) {
      return;
    }

    const card = document.createElement('div');
    card.className = 'hook-card';

    // 헤더: hooks[0] — useState
    const header = document.createElement('div');
    header.className = 'hook-card-header';

    const indexSpan = document.createElement('span');
    indexSpan.className = 'hook-index';
    indexSpan.textContent = 'hooks[' + i + ']';
    header.appendChild(indexSpan);

    const typeLabel = hook.type === 'state' ? 'useState'
      : hook.type === 'effect' ? 'useEffect'
      : 'useMemo';

    const typeSpan = document.createElement('span');
    typeSpan.className = 'hook-type hook-type-' + typeLabel;
    typeSpan.textContent = typeLabel;
    header.appendChild(typeSpan);

    card.appendChild(header);

    // 바디: hook 내부 값 표시
    const body = document.createElement('div');
    body.className = 'hook-card-body';

    const oldHook = oldHooks && oldHooks[i];

    if (hook.type === 'state') {
      appendHookField(body, 'value', JSON.stringify(hook.value, null, 2));
    } else if (hook.type === 'effect') {
      const oldDeps = oldHook ? JSON.stringify(oldHook.deps) : null;
      const newDeps = JSON.stringify(hook.deps);
      const depsChanged = oldHook && oldDeps !== newDeps;
      const depsText = depsChanged ? oldDeps + ' → ' + newDeps : newDeps;
      appendHookField(body, 'deps', depsText);
      if (depsChanged) {
        card.classList.add('changed');
      }
      appendHookField(body, 'cleanup', hook.cleanup ? '함수' : 'null');
    } else if (hook.type === 'memo') {
      const oldDeps = oldHook ? JSON.stringify(oldHook.deps) : null;
      const newDeps = JSON.stringify(hook.deps);
      const depsChanged = oldHook && oldDeps !== newDeps;
      const depsText = depsChanged ? oldDeps + ' → ' + newDeps : newDeps;
      // value가 VNode 객체면 트리 형식으로, 아니면 JSON으로 표시
      if (hook.value && typeof hook.value === 'object' && hook.value.type) {
        const treeWrap = document.createElement('div');
        treeWrap.className = 'hook-vnode-tree';
        treeWrap.appendChild(buildVDomTree(hook.value, 0, null));
        body.appendChild(treeWrap);
      } else {
        appendHookField(body, 'value', JSON.stringify(hook.value));
      }
      appendHookField(body, 'deps', depsText);
      if (depsChanged) {
        card.classList.add('changed');
      }
    }

    card.appendChild(body);
    area.appendChild(card);
  });
}

// DEPS 패널 갱신 — useEffect/useMemo의 deps 변화를 카드 형식으로 표시
// hooks: 렌더링 후 hooks, oldHooks: 렌더링 전 스냅샷
function updateDepsPanel(hooks, oldHooks) {
  const area = document.getElementById('patch-area');

  if (!area) {
    return;
  }

  while (area.firstChild) {
    area.removeChild(area.firstChild);
  }

  if (!hooks || hooks.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '(deps 없음)';
    area.appendChild(empty);
    return;
  }

  let hasAny = false;

  hooks.forEach(function(hook, i) {
    if (!hook || hook.type === 'state') {
      return;
    }

    hasAny = true;
    const oldHook = oldHooks && oldHooks[i];
    const oldDeps = oldHook ? JSON.stringify(oldHook.deps) : null;
    const newDeps = JSON.stringify(hook.deps);
    const depsChanged = oldHook && oldDeps !== newDeps;

    const typeLabel = hook.type === 'effect' ? 'useEffect' : 'useMemo';

    const card = document.createElement('div');
    card.className = 'deps-card' + (depsChanged ? ' deps-card-changed' : ' deps-card-same');

    // 헤더
    const header = document.createElement('div');
    header.className = 'deps-card-header';

    const indexSpan = document.createElement('span');
    indexSpan.className = 'hook-index';
    indexSpan.textContent = 'hooks[' + i + ']';
    header.appendChild(indexSpan);

    const typeSpan = document.createElement('span');
    typeSpan.className = 'hook-type hook-type-' + typeLabel;
    typeSpan.textContent = typeLabel;
    header.appendChild(typeSpan);

    const statusSpan = document.createElement('span');
    statusSpan.className = 'deps-status ' + (depsChanged ? 'deps-status-run' : 'deps-status-skip');
    statusSpan.textContent = depsChanged
      ? (hook.type === 'effect' ? '실행' : '재계산')
      : '스킵';
    header.appendChild(statusSpan);

    card.appendChild(header);

    // deps 변화 표시
    const body = document.createElement('div');
    body.className = 'deps-card-body';

    if (!oldHook) {
      // 첫 렌더링
      const row = document.createElement('div');
      row.className = 'deps-row';
      row.textContent = '초기값: ' + newDeps;
      body.appendChild(row);
    } else if (depsChanged) {
      // 각 인덱스별로 변화 표시
      const oldArr = JSON.parse(oldDeps);
      const newArr = JSON.parse(newDeps);
      oldArr.forEach(function(oldVal, j) {
        const row = document.createElement('div');
        row.className = 'deps-row';
        const itemChanged = !Object.is(oldVal, newArr[j]);
        if (itemChanged) {
          row.classList.add('deps-row-changed');
        }
        row.textContent = '[' + j + '] ' + JSON.stringify(oldVal) + ' → ' + JSON.stringify(newArr[j]);
        body.appendChild(row);
      });
    } else {
      const row = document.createElement('div');
      row.className = 'deps-row';
      row.textContent = newDeps;
      body.appendChild(row);
    }

    card.appendChild(body);
    area.appendChild(card);
  });

  if (!hasAny) {
    const empty = document.createElement('p');
    empty.className = 'panel-empty';
    empty.textContent = '(useEffect/useMemo 없음)';
    area.appendChild(empty);
  }
}

// =============================================
// 테스트 러너
// =============================================

// 테스트 실행 전 앱 상태를 저장해두고, 실행 후 복원한다
function captureAppSnapshot() {
  return {
    currentVNode: cloneVNode(appInstance ? appInstance.vNode : null),
    gameState: getGameState()
  };
}

function restoreAppSnapshot(snapshot) {
  if (!snapshot) {
    return;
  }

  restoreGameState(snapshot.gameState);

  // useState 갱신 → component.update() 자동 호출로 시각적 복원
  if (_setGameState) {
    _setGameState(snapshot.gameState);
  }

  updateVDomPanel(appInstance ? appInstance.vNode : null);
  updateHooksPanel(appInstance ? appInstance.hooks : []);
}

function getWhiteBoxTestSections() {
  return [
    {
      title: 'vdom.js',
      tests: [
        test_domToVNode_텍스트노드_문자열반환,
        test_domToVNode_공백텍스트노드_null반환,
        test_domToVNode_주석노드_null반환,
        test_domToVNode_엘리먼트_VNode구조반환,
        test_domToVNode_속성있는엘리먼트_props수집,
        test_domToVNode_자식있는엘리먼트_children재귀변환,
        test_createNode_문자열입력_텍스트노드생성,
        test_createNode_VNode_태그생성,
        test_createNode_props있음_속성설정,
        test_createNode_children있음_자식생성,
        test_domToVNode_createNode_왕복변환,
        test_edge_domToVNode_속성없는엘리먼트_빈props,
        test_edge_createNode_빈children_자식없음,
        test_edge_domToVNode_공백섞인텍스트_trim후반환,
        test_edge_createNode_자식여러개_순서보장
      ]
    },
    {
      title: 'diff.js',
      tests: [
        test_createPatch,
        test_removePatch,
        test_replacePatch,
        test_textPatch,
        test_propsPatch,
        test_emptyRootNoopPatch,
        test_sameTextNoPatch,
        test_removeSecondChildOnly,
        test_edge_identicalNode_패치없음,
        test_edge_childAdded_createPatch생성,
        test_edge_deepNested_재귀탐색
      ]
    },
    {
      title: 'app.js',
      tests: [
        test_cloneVNode_null입력_null반환,
        test_cloneVNode_깊은복사_원본불변,
        test_escapeHtml_특수문자이스케이프,
        test_getHtmlStringFromVNode_null입력_빈문자열,
        test_getHtmlStringFromVNode_문자열_이스케이프,
        test_getHtmlStringFromVNode_false속성_제외,
        test_getHtmlStringFromVNode_true속성_속성명만출력,
        test_getHtmlStringFromVNode_일반VNode_HTML문자열생성,
        test_edge_cloneVNode_undefined입력_undefined반환
      ]
    }
  ];
}

function buildTestSummaryLogs(passCount, totalCount) {
  if (passCount === totalCount) {
    return [{
      type: 'create',
      label: 'SUMMARY',
      detail: '전체 통과 ' + passCount + ' / ' + totalCount
    }];
  }

  return [{
    type: 'remove',
    label: 'SUMMARY',
    detail: '실패 ' + (totalCount - passCount) + '개, 통과 ' + passCount + ' / ' + totalCount
  }];
}

function setRunTestsButtonState(isRunning) {
  const button = document.getElementById('btn-run-tests');

  if (!button) {
    return;
  }

  button.disabled = isRunning;
  button.textContent = isRunning ? '🧪 테스트 중...' : '🧪 테스트하기';
}

function waitForUi(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

async function onRunTestsClick() {
  const snapshot = captureAppSnapshot();
  const sections = getWhiteBoxTestSections();
  const logs = [];
  let passCount = 0;
  let totalCount = 0;

  setRunTestsButtonState(true);

  try {
    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
      const section = sections[sectionIdx];

      logs.push({ type: 'props', label: 'SUITE', detail: section.title });
      updatePatchLogPanel(logs);
      await waitForUi(20);

      for (let testIdx = 0; testIdx < section.tests.length; testIdx++) {
        const testFn = section.tests[testIdx];
        totalCount++;

        try {
          testFn();
          passCount++;
          logs.push({ type: 'create', label: 'PASS', detail: testFn.name });
        } catch (error) {
          logs.push({ type: 'remove', label: 'FAIL', detail: testFn.name + ' — ' + error.message });
          console.error('테스트 실패', error);
        }
        updatePatchLogPanel(logs);
        await waitForUi(20);
      }
    }
  } finally {
    restoreAppSnapshot(snapshot);
    updatePatchLogPanel(logs.concat(buildTestSummaryLogs(passCount, totalCount)));
    setRunTestsButtonState(false);
  }
}

// =============================================
// 앱 초기화
// =============================================

function initializeApp() {
  const realArea = document.getElementById('real-area');

  if (!realArea) {
    return;
  }

  try {
    // game.js 상태 초기화
    initializeGame();

    // FunctionComponent로 App 마운트 → hooks 시스템 연결
    appInstance = new FunctionComponent(App);
    appInstance.mount(realArea);

    // 패널 초기 렌더링
    updateVDomPanel(appInstance.vNode);
    updateHooksPanel(appInstance.hooks);
    updatePatchPanel([]);
  } catch (error) {
    console.error('초기 렌더링 중 오류', error);
  }
}

// DOM이 모두 준비된 뒤 초기 상태를 세팅한다
document.addEventListener('DOMContentLoaded', initializeApp);
