# AI 규약 (팀 전체 공통 — 모든 AI가 이 규약을 따를 것)

> 고민석 · 박승현 · 강지현 · 김은재 4인 팀 규약

---

## 팀원별 할 일

### 고민석 — `component.js`
`FunctionComponent` 클래스 구현. `mount()`는 최초 렌더링, `update()`는 diff+patch 실행. hooks.js가 쓸 `setCurrentComponent` / `getCurrentComponent` / `resetHookIndex` 함께 구현. 박승현과 인터페이스 먼저 합의.

### 박승현 — `hooks.js`
`useState` / `useEffect` / `useMemo` 구현. 고민석이 만든 `getCurrentComponent()`로 현재 컴포넌트의 `hooks[]` 배열에 상태 저장. 고민석과 인터페이스 합의 후 시작.

### 강지현 — `gameComponents.js` + `game.js`
`ProfileCard` 및 하위 컴포넌트(`ProfileHeader`, `ExpBar`, `SkillList` 등) 구현. 모두 props만 받는 순수 함수. `game.js`의 `generateProfileVNode()` 제거 후 `ProfileCard`로 교체. 김은재와 props 구조 사전 합의.

### 김은재 — `app.js` + `index.html`
루트 `App` 컴포넌트 작성. `useState`로 `gameState` 관리, 게임 버튼 클릭 시 `setState` 호출로 자동 리렌더링. `FunctionComponent`로 마운트. 스크립트 로드 순서 반영 및 PATCH 버튼 처리. 강지현과 props 구조 사전 합의.

---

## 파일 소유권 (담당자 외 수정 금지)

| 파일 | 담당자 | 권한 |
|------|--------|------|
| `component.js` | 고민석 | 읽기·쓰기 |
| `hooks.js` | 박승현 | 읽기·쓰기 |
| `gameComponents.js` | 강지현 | 읽기·쓰기 |
| `game.js` | 강지현 | 읽기·쓰기 |
| `app.js` | 김은재 | 읽기·쓰기 |
| `index.html` | 김은재 | 읽기·쓰기 |
| `vdom.js` | **전원** | 읽기 전용 (수정 금지) |
| `diff.js` | **전원** | 읽기 전용 (수정 금지) |
| `vdom.test.js` | **전원** | 읽기 전용 (수정 금지) |
| `app.test.js` | **전원** | 읽기 전용 (수정 금지) |

> AI에게: 위 표에서 담당자가 아닌 파일은 절대 수정하지 말 것.
> 수정이 필요하다고 판단되면 코드 제안만 하고 담당자에게 확인받을 것.

---

## 공유 인터페이스 (파일 간 계약 — 절대 변경 금지)

> 이 인터페이스는 팀 전원이 합의한 계약이다.
> 변경이 필요하면 반드시 전원 합의 후 이 문서를 먼저 수정한다.

### VNode 구조 (기존 유지)

```js
{
  type: string,       // 태그명. 예) 'div', 'p', 'h2'
  props: object,      // 속성. 예) { class: 'card', id: 'wrap' }
  children: Array     // 자식. 각 요소는 VNode 또는 string(텍스트)
}
```

### patches 배열 (diff → patch 간 전달, 기존 유지)

```js
{ type: 'create',  parentEl: Node, vNode: VNode }
{ type: 'remove',  el: Node }
{ type: 'replace', el: Node, vNode: VNode }
{ type: 'text',    el: Node, value: string }
{ type: 'props',   el: Node, oldProps: object, newProps: object }
```

### component.js → hooks.js 계약 (고민석 ↔ 박승현)

```js
// component.js가 외부에 노출하는 함수
setCurrentComponent(component);   // 렌더링 시작 시 호출
resetHookIndex();                  // 렌더링 시작 시 호출 (hookIndex = 0)
getCurrentComponent();             // hooks.js가 호출하여 현재 컴포넌트 접근

// component 인스턴스 구조 (hooks.js가 읽고 쓰는 필드)
component.hooks      // Array — hook 상태 저장 배열
component.hookIndex  // number — 현재 렌더링 중 hook 호출 순서
```

### hooks.js → 전원 계약 (박승현이 구현, 모두가 사용)

```js
// 반환 타입 고정
useState(initialValue)              // → [currentValue, setterFn]
useEffect(callback, deps)           // → void
useMemo(factory, deps)              // → cachedValue

// setter 시그니처
const [value, setValue] = useState(0);
setValue(newValue);                 // 새 값으로 교체
setValue(prev => prev + 1);        // 이전 값 기반 업데이트 (선택 구현)
```

### gameComponents.js → app.js 계약 (강지현 ↔ 김은재)

```js
// 강지현이 export할 컴포넌트 함수 목록
// 모두 (props) => VNode 형태의 순수 함수
ProfileCard(props)      // 전체 카드 조립
ProfileHeader(props)    // 이름 + 레벨 뱃지
CareerInfo(props)       // 경력 · 골드 · 보상
ExpBar(props)           // 경험치 progress bar
SkillList(props)        // 기술 스택 목록
ProjectList(props)      // 완성 프로젝트 (없으면 null 반환)
WeaknessList(props)     // 약점 목록 (없으면 null 반환)
StrengthList(props)     // 강점 목록 (없으면 null 반환)

// props 구조 (김은재가 전달할 형태)
ProfileCard({
  name: string,
  level: number,
  levelName: string,
  levelIcon: string,
  career: number,
  gold: number,
  hireReward: number,
  exp: number,
  maxExp: number,
  skills: Array<{ name: string, stars: number }>,
  projects: string[],
  weaknesses: string[],
  strengths: string[]
})
```

---

## 컴포넌트 함수 작성 규칙 (강지현 적용)

- 반드시 `function` 키워드로 선언
- props가 없어도 매개변수 `props` 명시
- 반환값은 항상 VNode 또는 `null`
- 내부에서 `useState` 등 Hook 호출 금지 (순수 함수)

```js
// 올바른 예
function SkillList(props) {
  const items = props.skills.map((skill) => ({
    type: 'li',
    props: {},
    children: [skill.name + ' ' + starsToString(skill.stars)]
  }));
  return { type: 'ul', props: { class: 'skills' }, children: items };
}

// 잘못된 예 — Hook 사용 금지
function SkillList(props) {
  const [open, setOpen] = useState(false); // ❌
  ...
}
```

---

## 언어

- 코드 내 주석: 한국어
- 변수명·함수명: 영어 camelCase
- console.log 디버그 메시지: 한국어

---

## 코드 스타일

- 들여쓰기: 스페이스 2칸
- 문자열: 작은따옴표(`''`) 사용
- 세미콜론: 항상 붙임
- 함수 선언: `function` 키워드 사용 (화살표 함수 X)
  - 단, 콜백·배열 메서드 내부는 화살표 함수 허용

---

## 네이밍

- VNode 관련 변수: `oldNode` / `newNode` / `vNode` (약어 금지)
- 실제 DOM 관련 변수: `el` / `parentEl` / `realEl`
- patches 배열 아이템: `patch` (단수)
- Boolean 변수: `is~` / `has~` 접두사
- 컴포넌트 함수명: PascalCase (`ProfileCard`, `ExpBar`)
- 일반 유틸 함수명: camelCase (`starsToString`, `getCurrentLevel`)

---

## 에러 처리

- 미구현 함수: `throw new Error('미구현: 함수명')`
- 예외 처리: try-catch 사용, catch 블록에 `console.error('설명', error)` 포함

---

## 금지 사항

- `innerHTML` 직접 조작 금지 (XSS 위험)
- `eval()` 사용 금지
- `var` 사용 금지 (`let` / `const`만 허용)
- 외부 라이브러리 import 금지 (Vanilla JS만)
- 자식 컴포넌트 내부에서 `useState` / `useEffect` / `useMemo` 호출 금지

---

## AI 행동 규약

- 담당 파일 외에는 절대 수정하지 말 것
- 구현 전에 반드시 입출력 예시를 먼저 보여주고 확인받을 것
- 불확실한 부분은 임의로 결정하지 말고 물어볼 것
- 코드 수정 시 변경된 부분과 이유를 반드시 설명할 것
- 공유 인터페이스 변경이 필요하면 코드 수정 전에 먼저 알릴 것
