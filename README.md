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
 |    ├── 📂assets
 |    ├── 📂components
 |    |    ├── 📂layouts
 |    |    |    ├── 💾Header.vue
 |    |    |    ├── 💾SideBar.vue
 |    |    |    └── 💾Footer.vue
 |    |    ├── 📂trainee
 |    |    |    ├── 📂exam
 |    |    |    ├── 📂result
 |    |    |    └── 📂feedback
 |    |    └── 📂trainer
 |    |         ├── 📂document
 |    |         ├── 📂exam
 |    |         ├── 📂question
 |    |         └── 📂trainee
 |    ├── 📂pages
 |    |    ├── 📂admin
 |    |    ├── 📂general
 |    |    ├── 📂trainee
 |    |    └── 📂trainer
 |    ├── 📂router
 |    |    └── 💾index.ts
 |    ├── 💾App.vue
 |    └── 💾main.ts
 ├── 💾index.html
 ├── 💾package.json
 ├── 💾tsconfig.json
 └── 💾vite.config.ts
```