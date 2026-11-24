# 구름 위 꿈의 섬 — 파일 구조

`index.html` 이 아래 파일들을 순서대로 불러와요. 빌드 과정 없이 파일을 고치면 바로 반영돼요.

```
index.html            화면 뼈대(HTML)와 스크립트 불러오는 순서
css/style.css         화면 꾸밈(색, 버튼, 패널 모양)
js/
  core/util.js        숫자 표기(1K·1M·1aa), 색 변환, 난수
  data/               ← 밸런스·콘텐츠 수정은 대부분 여기서 끝나요
    balance.js        적 체력/보상/피해 성장률, 보스 체력 배율, 보스 제한시간, 환생 조건, 별가루 공식
    regions.js        지역 이름, 지역당 스테이지 수, 보스 이름/종류, 지역 배경 색
    enemies.js        일반 적 종류와 배율
    upgrades.js       꿈 조각 강화 6종 (비용, 증가율, 효과)
    skills.js         스킬 4종: 이름, 해금 스테이지, 쿨타임, 비용, 설명, 아이콘, 자동 사용 조건, 효과(cast)
    companions.js     동료 3명 (영입 비용, 공격 간격, 피해 배율, 부가 효과)
    equipment.js      장비 등급 이름/색, 부위별 효과 수치
    prestige.js       별가루 영구 강화 목록
    quests.js         일일 퀘스트 목록과 목표치
    achievements.js   업적 목록과 달성 조건
  art/
    sprites.js        픽셀아트: 별 궁수, 등대, 적, 보스, 동료, 섬 (문자 한 칸 = 픽셀 한 칸, 색은 PAL)
    icons.js          메뉴·버튼 아이콘 (스킬 아이콘은 data/skills.js)
  audio/audio.js      효과음과 배경음
  systems/            게임 규칙
    state.js          저장 데이터 구조, 저장/불러오기, 능력치 계산
    world.js          진행 중 상태(적·화살·타이머)
    waves.js          웨이브, 스테이지 클리어/실패, 보스 도전, 지역 변경
    boss.js           보스 등장과 패턴(시험지, 구멍, 돌진, 시계)
    combat.js         조준, 화살, 피해, 처치 보상, 탭 공격, 동료 공격
    skills.js         스킬 사용 공통 처리, 스킬 해금
    items.js          장비 획득/합성/장착
    prestige.js       환생 처리와 아침 연출
    quests.js         퀘스트·업적 진행과 보상, 모두 받기
    fx.js             데미지 숫자, 파티클, 꿈 조각 흡수
    update.js         한 프레임 진행
  render/render.js    캔버스 그리기
  ui/                 common.js(토스트) · hud.js(상단 정보, 스킬 버튼) · panel.js(하단 탭) · modals.js(팝업)
  main.js             시작, 게임 루프, 입력, 자동 저장
```

## 자주 하는 수정

- **스킬 수치 바꾸기**: `js/data/skills.js` 에서 `cd`(쿨타임), `m`(피해 배율), `unlock`(해금 스테이지)을 고쳐요.
- **새 스킬 추가**: `js/data/skills.js` 에 항목 하나를 추가하면 스킬 버튼, 스킬 탭, 저장 데이터, 키보드 단축키가 자동으로 따라와요.
- **난이도 조절**: `js/data/balance.js` 의 `hp`(적 체력 성장률), `gold`(보상 성장률).
- **퀘스트/업적 추가**: `js/data/quests.js`, `js/data/achievements.js` 에 한 줄 추가.

## 불러오는 순서 규칙

`index.html` 의 순서는 core → data → art → audio → systems → render → ui → main 이에요.
새 파일을 만들면 같은 묶음 안에 `<script>` 한 줄을 추가해 주세요.
