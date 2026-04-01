// =============================================
// 담당: 강지현 | gameComponents.js
// 책임: 게임 프로필 UI를 구성하는 순수 함수 컴포넌트들
// 규칙: 모든 컴포넌트는 props만 받는 순수 함수 (Hook 사용 금지)
// 의존: game.js의 starsToString()
// =============================================

// 이름 + 레벨 뱃지
// props: { name, level, levelIcon, levelName }
function ProfileHeader(props) {
  throw new Error('미구현: ProfileHeader');
}

// 경력 · 골드 · 취업 보상
// props: { career, gold, hireReward }
function CareerInfo(props) {
  throw new Error('미구현: CareerInfo');
}

// 경험치 progress bar
// props: { exp, maxExp }
function ExpBar(props) {
  throw new Error('미구현: ExpBar');
}

// 기술 스택 목록
// props: { skills: Array<{ name: string, stars: number }> }
function SkillList(props) {
  throw new Error('미구현: SkillList');
}

// 완성 프로젝트 목록
// props: { projects: string[] }
// 반환: VNode 또는 null (projects가 비어있으면 null)
function ProjectList(props) {
  throw new Error('미구현: ProjectList');
}

// 약점 목록
// props: { weaknesses: string[] }
// 반환: VNode 또는 null (weaknesses가 비어있으면 null)
function WeaknessList(props) {
  throw new Error('미구현: WeaknessList');
}

// 강점 목록
// props: { strengths: string[] }
// 반환: VNode 또는 null (strengths가 비어있으면 null)
function StrengthList(props) {
  throw new Error('미구현: StrengthList');
}

// 전체 프로필 카드 조립
// props: {
//   name, level, levelName, levelIcon,
//   career, gold, hireReward,
//   exp, maxExp,
//   skills, projects, weaknesses, strengths
// }
function ProfileCard(props) {
  throw new Error('미구현: ProfileCard');
}
