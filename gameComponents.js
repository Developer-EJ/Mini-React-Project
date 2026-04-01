// =============================================
// 담당: 강지현 | gameComponents.js
// 책임: 게임 프로필 UI를 구성하는 순수 함수 컴포넌트들
// 규칙: 모든 컴포넌트는 props만 받는 순수 함수 (Hook 사용 금지)
// 의존: game.js의 starsToString()
// =============================================

// 이름 + 레벨 뱃지
// props: { name, level, levelIcon, levelName }
// 이름과 레벨 정보를 묶어서 헤더 영역 VNode로 반환
function ProfileHeader(props) {
  return {
    type: 'div',
    props: {},
    children: [
      { type: 'h1', props: {}, children: [props.name] },
      {
        type: 'h2',
        props: { class: 'level level-' + props.level },
        children: [props.levelIcon + ' ' + props.levelName]
      }
    ]
  };
}

// 경력 · 골드 · 취업 보상
// props: { career, gold, hireReward }
// 경력, 골드, 취업 보상 정보를 묶어서 반환
function CareerInfo(props) {
  return {
    type: 'div',
    props: {},
    children: [
      {
        type: 'p',
        props: { class: 'career' },
        children: ['경력 ' + props.career + '년차']
      },
      {
        type: 'p',
        props: { class: 'gold' },
        children: ['💰 ' + props.gold + ' G']
      },
      {
        type: 'p',
        props: { class: 'hire-info' },
        children: ['퇴직 보상: ' + props.hireReward + ' G']
      }
    ]
  };
}

// 경험치 progress bar
// props: { exp, maxExp }
// 현재 경험치와 최대 경험치를 progress와 텍스트로 반환
function ExpBar(props) {
  return {
    type: 'div',
    props: { class: 'exp-bar' },
    children: [
      {
        type: 'progress',
        props: {
          value: String(props.exp),
          max: String(props.maxExp)
        },
        children: []
      },
      {
        type: 'span',
        props: {},
        children: [props.exp + ' / ' + props.maxExp + ' EXP']
      }
    ]
  };
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
// 프로필 카드 전체 구조를 하위 컴포넌트로 조립하여 반환
function ProfileCard(props) {
  const children = [
    ProfileHeader({
      name: props.name,
      level: props.level,
      levelIcon: props.levelIcon,
      levelName: props.levelName
    }),
    CareerInfo({
      career: props.career,
      gold: props.gold,
      hireReward: props.hireReward
    }),
    ExpBar({
      exp: props.exp,
      maxExp: props.maxExp
    }),
    { type: 'h3', props: {}, children: ['기술 스택'] },
    SkillList({
      skills: props.skills
    }),
    ProjectList({
      projects: props.projects
    }),
    WeaknessList({
      weaknesses: props.weaknesses
    }),
    StrengthList({
      strengths: props.strengths
    })
  ].filter((child) => child !== null);

  return {
    type: 'div',
    props: { class: 'profile' },
    children: children
  };
}
