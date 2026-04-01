// =============================================
// 담당: 강지현 | gameComponents.js
// 책임: 게임 프로필 UI를 구성하는 순수 함수 컴포넌트들
// 규칙: 모든 컴포넌트는 props만 받는 순수 함수 (Hook 사용 금지)
// 의존: game.js의 starsToString()
// =============================================

const LEVEL_PIXEL_ARTS = {
  1: {
    title: '첫 커밋',
    role: 'HTML 새싹',
    focus: '작은 div 한 줄도 직접 쌓는 중',
    palette: {
      A: '#63d68d',
      B: '#4a3329',
      C: '#ffe4c8',
      D: '#ffafc5',
      E: '#3fb7c6',
      F: '#1b2438',
      G: '#7fe6ff',
      H: '#8cf26b',
      I: '#7c5a43',
      J: '#42556d',
      K: '#2a3950',
      M: '#b4c2cf'
    },
    rows: [
      '........A.......',
      '.......AAA......',
      '....FFGGGGFF....',
      '....FGHHHHGF....',
      '......BB........',
      '.....BCCB.......',
      '.....BCDCB......',
      '.....BEEEKK.....',
      '....MKKKKKFF....',
      '..IIIIIIIIIIII..',
      '.....J....J.....',
      '....JJ....JJ....',
      '................'
    ]
  },
  2: {
    title: '기능 구현',
    role: 'UI 빌더',
    focus: '클릭마다 화면이 바뀌는 재미를 배우는 중',
    palette: {
      A: '#67b2ff',
      B: '#4a352d',
      C: '#ffe3c4',
      D: '#ffafc8',
      E: '#5b7dff',
      F: '#1a2f4c',
      G: '#7fe6ff',
      H: '#8cf26b',
      I: '#7b5a42',
      J: '#455f7b',
      K: '#273649',
      M: '#b8c6d3'
    },
    rows: [
      '.FFGGF..FFGGF...',
      '.FGHHF..FGHHF...',
      '.FFGGF..FFGGF...',
      '......AA........',
      '.....BBCCBB.....',
      '.....BCDDCB.....',
      '.....BEEEEB.....',
      '....CKEEEKK.....',
      '...MKKKKKFFF....',
      '..IIIIIIIIIIII..',
      '....J......J....',
      '...JJ......JJ...',
      '................'
    ]
  },
  3: {
    title: '디버깅 마스터',
    role: '버그 헌터',
    focus: '콘솔 로그와 예외를 추적하며 성장 중',
    palette: {
      A: '#ff9852',
      B: '#4a2843',
      C: '#ffe4c6',
      D: '#ffafc8',
      E: '#7358ff',
      F: '#1e2338',
      G: '#8ef3ff',
      H: '#96ff7d',
      I: '#7b5c45',
      J: '#404866',
      K: '#2a3146',
      M: '#d7c36a'
    },
    rows: [
      '..FFGGGGGGGGFF..',
      '..FGHHHGGHHHGF..',
      '..FFGGGGGGGGFF..',
      '.....AAAAAA.....',
      '....BBCCCCBB....',
      '....BCDDDDCB....',
      '....BEEEEEEB....',
      '...CKEEEEEEKK...',
      '..MKKKKKKKKFFM..',
      '.IIIIIIIIIIIIII.',
      '....J......J....',
      '...JJ......JJ...',
      '................'
    ]
  },
  4: {
    title: '시니어 멘토',
    role: '리팩터 멘토',
    focus: '구조를 다듬고 주니어를 이끄는 단계',
    palette: {
      A: '#7dd3fc',
      B: '#3d2f2a',
      C: '#ffe2c2',
      D: '#ffafc7',
      E: '#a6b4c4',
      F: '#1c314c',
      G: '#8ef2ff',
      H: '#8cff7d',
      I: '#7c5d45',
      J: '#43546b',
      K: '#2c394c',
      M: '#d5dce6',
      N: '#f4c542'
    },
    rows: [
      '.FFGGG..FFGGG...',
      '.FGHHG..FGHHG...',
      '.FFGGGFFGGGFF...',
      '....AANNNAA.....',
      '....BBCCCCBB....',
      '....BCDDDDCBM...',
      '....BEEEEEEB....',
      '...CKEEEEEEKK...',
      '.MKKKKKKKKKKFFM.',
      'IIIIIIIIIIIIIIII',
      '....J......J....',
      '...JJ......JJ...',
      '................'
    ]
  },
  5: {
    title: '테크 리드',
    role: '시스템 리드',
    focus: '설계와 팀 성장을 동시에 관리하는 단계',
    palette: {
      A: '#ffd86b',
      B: '#49342a',
      C: '#ffe2c0',
      D: '#ffb0c8',
      E: '#d85e7d',
      F: '#2a2438',
      G: '#84f2ff',
      H: '#97ff84',
      I: '#7d5d45',
      J: '#4a374f',
      K: '#32243a',
      M: '#dfe6f0'
    },
    rows: [
      'FFGG..FFGG..FFGG',
      'FGHH..FGHH..FGHH',
      'FFGGGGGGGGGGGGFF',
      '....A.AAA.A.....',
      '....BBCCCCBB....',
      '...BBCDDDDCBB...',
      '...BEEEEEEEEB...',
      '..CKEEEEEEEEKK..',
      'MKKKKKKKKKKKFFFM',
      'IIIIIIIIIIIIIIII',
      '...JJ......JJ...',
      '..JJJ......JJJ..',
      '................'
    ]
  }
};

const pixelArtSrcCache = {};

function buildLevelPixelArtSrc(level) {
  const art = LEVEL_PIXEL_ARTS[level] || LEVEL_PIXEL_ARTS[1];
  const pixelSize = 12;
  const width = art.rows[0].length * pixelSize;
  const height = art.rows.length * pixelSize;
  const rects = [];

  art.rows.forEach(function (row, y) {
    row.split('').forEach(function (token, x) {
      const color = art.palette[token];

      if (!color) {
        return;
      }

      rects.push(
        '<rect x="' + (x * pixelSize) + '" y="' + (y * pixelSize) + '" width="' + pixelSize + '" height="' + pixelSize + '" fill="' + color + '"/>'
      );
    });
  });

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '" shape-rendering="crispEdges">' +
    rects.join('') +
    '</svg>';

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function getLevelPixelArtSrc(level) {
  if (!pixelArtSrcCache[level]) {
    pixelArtSrcCache[level] = buildLevelPixelArtSrc(level);
  }

  return pixelArtSrcCache[level];
}

function LevelPixelArt(props) {
  const art = LEVEL_PIXEL_ARTS[props.level] || LEVEL_PIXEL_ARTS[1];

  return {
    type: 'div',
    props: { class: 'profile-mascot profile-mascot-level-' + props.level },
    children: [
      {
        type: 'div',
        props: { class: 'profile-mascot-frame' },
        children: [
          {
            type: 'span',
            props: { class: 'profile-mascot-badge' },
            children: ['STAGE ' + props.level]
          },
          {
            type: 'img',
            props: {
              class: 'profile-mascot-image',
              src: getLevelPixelArtSrc(props.level),
              alt: props.levelName + ' 픽셀 아트'
            },
            children: []
          }
        ]
      },
      {
        type: 'p',
        props: { class: 'profile-mascot-name' },
        children: [art.title]
      },
      {
        type: 'p',
        props: { class: 'profile-mascot-role' },
        children: [art.role]
      },
      {
        type: 'p',
        props: { class: 'profile-mascot-focus' },
        children: [art.focus]
      }
    ]
  };
}

// 이름 + 레벨 뱃지
// props: { name, level, levelIcon, levelName }
// 이름과 레벨 정보를 묶어서 헤더 영역 VNode로 반환
function ProfileHeader(props) {
  // h1과 h2를 하나의 VNode로 반환하기 위해 div로 묶음
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
  // p 요소 3개를 하나의 VNode로 반환하기 위해 div로 묶음
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
    {
      type: 'div',
      props: { class: 'profile-top' },
      children: [
        {
          type: 'div',
          props: { class: 'profile-copy' },
          children: [
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
            })
          ]
        },
        LevelPixelArt({
          level: props.level,
          levelName: props.levelName
        })
      ]
    },
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
    // ProjectList, WeaknessList, StrengthList가 null을 반환할 수 있으므로 children에서 제거
  ].filter((child) => child !== null);

  return {
    type: 'div',
    props: { class: 'profile' },
    children: children
  };
}
