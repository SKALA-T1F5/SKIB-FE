# SKIB-FE

## Commit Code
1. `git add .`: 변경 사항 Staging
1. `git commit -m {commit_message}`: Commit Message 입력
1. `git push origin {branch}`: branch로 Push

## Commit Message
- `feat`: 새로운 기능 추가
- `fix`: 기능 수정, 버그 수정
- `refactor`: 코드 재구성
- `style`: 코드에 영향을 미치지 않는 수정(ex. 띄어쓰기, 이름, 주석 등)
- `docs`: 문서 추가 및 변경(ex. README.md, requirements.txt, .gitignore)
- `test`: 테스트코드, 리팩토링 테스트 코드 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 수정

## Directory Structure
```Plain Text
📂SIKB-FE
 ├── 📂public
 ├── 📂src
 |    ├── 📂assets                  - 이미지, 폰트, 전역 스타일 등 정적 리소스 저장
 |    ├── 📂components              - 역할별 Component
 |    |    ├── 📂admin                  - Admin Component
 |    |    ├── 📂layouts                - 공통 Component: Header, Footer, MainLayout
 |    |    |    └── 📂header               - Header 내부 Component (LangSwitcher, LogoArea 등)
 |    |    ├── 📂trainee                - Trainee Component
 |    |    |    ├── 📂feedback             - 피드백 차트, 분석 Component
 |    |    |    ├── 📂main                 - 메인 Component
 |    |    |    ├── 📂result               - 시험 결과 Component
 |    |    |    └── 📂test                 - 시험 응시 Component
 |    |    └── 📂trainer                - Trainer Component
 |    |         ├── 📂document             - 문서 관리 Component
 |    |         ├── 📂feedback             - 성과/분석 대시보드 Component
 |    |         ├── 📂main                 - 메인 Component
 |    |         ├── 📂project              - 프로젝트 상세 Component
 |    |         ├── 📂question             - 문제 출제/검토 Component
 |    |         ├── 📂test                 - 시험 관리 Component
 |    |         └── 📂trainee              - Trainee 관리 Component
 |    ├── 📂pages                   - 역할별 Page
 |    |    ├── 📂admin                  - Admin Page
 |    |    ├── 📂general                - General Page: Login, MyPage, ...
 |    |    ├── 📂trainee                - Trainee Page
 |    |    └── 📂trainer                - Trainer Page
 |    ├── 📂config                  - 공통 설정 파일
 |    |    └── 💾axios.js               - axios 경로 설정: Springboot 연동 간 사용
 |    ├── 📂router                  - 페이지 간 Routing Logic 설정
 |    |    └── 💾index.js               - Route 경로 설정
 |    ├── 📂stores                  - Pinia 기반 상태 관리
 |    ├── 💾App.vue
 |    └── 💾main.js
 └── 💾vite.config.js               - Springboot 연동 간 사용
```