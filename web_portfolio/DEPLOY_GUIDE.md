# GitHub 배포 가이드

웹 포트폴리오를 인터넷에 공개하기 위한 단계별 가이드입니다.

## 1. GitHub 저장소 생성
1. [GitHub](https://github.com)에 로그인합니다.
2. 우측 상단의 `+` 버튼을 누르고 **New repository**를 선택합니다.
3. **Repository name**에 원하는 이름(예: `my-portfolio` 또는 `portfolio`)을 입력합니다.
4. **Public**이 선택되어 있는지 확인합니다.
5. 다른 설정은 건드리지 않고 **Create repository** 버튼을 클릭합니다.

## 2. 코드 업로드 (터미널 명령어)
생성된 저장소 주소(예: `https://github.com/사용자명/portfolio.git`)를 복사한 후, 아래 명령어를 터미널에 순서대로 입력하세요.

```bash
# 원격 저장소 연결 (주소를 본인의 것으로 변경하세요!)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 코드 업로드
git branch -M main
git push -u origin main
```

## 3. GitHub Pages 설정
1. 업로드가 완료되면 GitHub 저장소 페이지에서 **Settings** 탭으로 이동합니다.
2. 좌측 메뉴에서 **Pages**를 클릭합니다.
3. **Build and deployment** 섹션의 **Source**가 `Deploy from a branch`로 되어 있는지 확인합니다.
4. **Branch** 설정에서 `main` 브랜치를 선택하고 `/ (root)` 폴더를 선택한 뒤 **Save**를 누릅니다.
5. 약 1~3분 후 상단에 생성된 웹사이트 주소(예: `https://사용자명.github.io/portfolio/`)가 나타납니다.

이제 전 세계 누구나 이 주소를 통해 포트폴리오를 볼 수 있습니다!
