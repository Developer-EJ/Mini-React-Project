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
// 기술 스택 배열을 li 목록으로 변환하여 ul로 반환
function SkillList(props) {
  const items = props.skills.map((skill) => ({
    type: 'li',
    props: {},
    children: [skill.name + ' ' + starsToString(skill.stars)]
  }));

  return {
    type: 'ul',
    props: { class: 'skills' },
    children: items
  };
}

// 완성 프로젝트 목록
// props: { projects: string[] }
// 반환: VNode 또는 null (projects가 비어있으면 null)
// 프로젝트 목록이 비어 있으면 null을 반환하고, 있으면 제목과 목록을 반환
function ProjectList(props) {
  if (props.projects.length === 0) {
    return null;
  }

  return {
    type: 'div',
    props: {},
    children: [
      { type: 'h3', props: {}, children: ['완성한 프로젝트'] },
      {
        type: 'ul',
        props: { class: 'projects' },
        children: props.projects.map((project) => ({
          type: 'li',
          props: {},
          children: [project]
        }))
      }
    ]
  };
}

// 약점 목록
// props: { weaknesses: string[] }
// 반환: VNode 또는 null (weaknesses가 비어있으면 null)
// 약점 목록이 비어 있으면 null을 반환하고, 있으면 제목과 목록을 반환
function WeaknessList(props) {
  if (props.weaknesses.length === 0) {
    return null;
  }

  return {
    type: 'div',
    props: {},
    children: [
      { type: 'h3', props: {}, children: ['약점'] },
      {
        type: 'ul',
        props: { class: 'weaknesses' },
        children: props.weaknesses.map((weakness) => ({
          type: 'li',
          props: { class: 'bad' },
          children: [weakness]
        }))
      }
    ]
  };
}

// 강점 목록
// props: { strengths: string[] }
// 반환: VNode 또는 null (strengths가 비어있으면 null)
// 강점 목록이 비어 있으면 null을 반환하고, 있으면 제목과 목록을 반환
function StrengthList(props) {
  if (props.strengths.length === 0) {
    return null;
  }

  return {
    type: 'div',
    props: {},
    children: [
      { type: 'h3', props: {}, children: ['강점'] },
      {
        type: 'ul',
        props: { class: 'strengths' },
        children: props.strengths.map((strength) => ({
          type: 'li',
          props: { class: 'good' },
          children: [strength]
        }))
      }
    ]
  };
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
