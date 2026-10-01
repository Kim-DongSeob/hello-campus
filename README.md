# HELLO, CAMPUS! — 새봄대학교 웰컴 페스티벌

**배포 사이트:** https://hello-campus.vercel.app

**GitHub:** https://github.com/Kim-DongSeob/hello-campus

민트·라벤더 색상과 입체 별 마스코트로 만든 한국어 대학 신입생 이벤트 페이지입니다. [참고 페이지](https://onlinepage.co.kr/2024sangji/portfolio.php)의 축하 캠페인, 퀴즈, 룰렛, 스크래치 흐름을 현대적인 반응형 화면으로 재구성했습니다.

새봄대학교는 가상의 브랜드입니다. 실제 대학의 공식 행사, 입학 접수 또는 경품 추첨 서비스가 아닙니다.

## 실행

Node.js 22에서 별도 의존성 설치 없이 실행합니다.

```sh
npm run dev
npm test
npm run build
```

미리보기: http://127.0.0.1:4197

## 기능

- PC·태블릿·모바일 반응형 메인, 네 가지 이벤트 탭, FAQ, 링크 공유
- 퀴즈 정답·오답 확인과 축하 결과창
- 회전 결과와 포인터 위치가 일치하는 6칸 룰렛, 중복 클릭 방지
- 마우스·터치로 지우는 스크래치 카드, 38% 이상 지우면 공개, 키보드용 공개 버튼
- 별명과 문구로 만드는 응원 카드, 입력 검증과 문구 추천
- 키보드 방향키·Home·End 탭 탐색, native dialog, 포커스 표시, 동작 감소 설정 지원
- 개인정보 수집, 서버 전송, 쿠키, localStorage, 외부 추적 없음

룰렛 결과와 응원 문구는 현재 화면에서만 사용하며 새로고침하면 초기화됩니다. 날짜, 브랜드, 경품은 디자인 예시이고 실제 상품을 지급하지 않습니다. 실제 캠페인 운영을 위해서는 승인된 행사 정보, 참여자 인증, 서버 측 당첨·수량·중복 참여 관리, 경품 발송 시스템과 운영 정책을 별도로 연결해야 합니다.

## 배포

Vercel Framework Preset: Other. `vercel.json`에 빌드 명령과 `dist` 출력 경로가 포함되어 있습니다. 환경변수나 별도 백엔드는 필요하지 않습니다.

## 수정 위치

- `dist/index.html`: 브랜드, 안내 문구, 예시 일정, 퀴즈 및 섹션 구성
- `dist/styles.css`: 디자인, 반응형 레이아웃, 모션
- `dist/app.js`: 이벤트 동작, 공유, 결과창, 카드
- `dist/event-core.js`: 룰렛 결과와 입력 검증
- `dist/assets/`: 자체 호스팅 이미지 및 Pretendard 글꼴

## 이미지와 글꼴

히어로 일러스트는 내장 ImageGen 도구로 새로 생성했습니다. 참고 사이트의 로고나 일러스트를 복제하지 않았습니다. 프로젝트에 최적화한 투명 WebP 파일을 포함했습니다.

- 이미지: `dist/assets/welcome-gift.webp`
- 글꼴: Pretendard Variable 1.3.9, SIL Open Font License (`dist/assets/Pretendard-LICENSE.txt`)
- 생성 프롬프트: `ASSET-PROMPT.txt`

## 검증

`npm test`는 모든 룰렛 칸 및 연속 72회 회전의 포인터·결과 일치와 응원 카드 입력 경계를 검증합니다. `npm run build`는 JavaScript 문법, 로컬 에셋, 고유 ID, 내비게이션 연결을 확인합니다. 브라우저에서는 퀴즈 정답·오답, 룰렛, 스크래치, 카드 생성, 공유, FAQ, 작은 화면 레이아웃을 확인합니다.
