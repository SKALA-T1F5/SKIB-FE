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
 |    ├── 📂assets // 이미지, 폰트, 전역 스타일 등 정적 리소스 저장
 |    ├── 📂components // 여러 페이지에서 재사용할 UI 컴포넌트 정의
 |    |    ├── 📂layouts // 공통 Layouts: Header, SideBar, Footer
 |    |    ├── 📂trainee // Trainee Component
 |    |    └── 📂trainer // Trainer Component
 |    ├── 📂pages // 개별 페이지 컴포넌트
 |    |    ├── 📂admin // Admin Page
 |    |    ├── 📂general // General Page: Login, MyPage, ...
 |    |    ├── 📂trainee // Trainee Page
 |    |    └── 📂trainer // Trainer Page
 |    ├── 📂pulgins // 외부 라이브러리 전역 등록
 |    ├── 📂router // 페이지 간 Routing Logic 설정
 |    ├── 📂stores // Pinia 기반 상태 관리
 |    ├── 📂theme // 색상, 폰트, 공통 스타일 변수
 |    ├── 💾App.vue
 |    └── 💾main.js
 └── 💾vite.config.js // Springboot 연동 간 사용
```