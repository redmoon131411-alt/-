# 잔반톡 (Vercel 배포용)

링크만 열면 학생들이 가입 없이 쓸 수 있는 챗봇이에요.
학생 화면은 `public/index.html`, Claude를 부르는 서버 코드는 `api/chat.js`입니다.
API 키는 서버에만 있어서 학생 화면에는 보이지 않아요.

## 올리는 방법 (처음 한 번만)

### 1. Claude API 키 만들기
1. https://console.anthropic.com 에 로그인합니다.
2. **API Keys**에서 키를 새로 만들고 복사해 둡니다. (`sk-ant-...`)
3. **Billing**에서 결제 수단이나 크레딧을 넣고, **월 사용 한도**를 작게 정해 두세요.
   수업용이면 한도를 낮게 걸어 두는 게 안전해요.

### 2. Vercel에 올리기 (둘 중 편한 방법)

**방법 A. GitHub 사용**
1. 이 폴더 전체를 GitHub 저장소에 올립니다.
2. https://vercel.com 에서 **Add New → Project**로 그 저장소를 가져옵니다.
3. **Environment Variables**에 `ANTHROPIC_API_KEY` = 복사한 키를 넣고 **Deploy**를 누릅니다.

**방법 B. 명령어 사용 (컴퓨터에 Node.js가 있을 때)**
```
cd janban-vercel
npx vercel            # 안내에 따라 로그인하고 프로젝트 만들기
npx vercel env add ANTHROPIC_API_KEY    # 키 붙여 넣기 (Production 선택)
npx vercel --prod     # 배포
```

### 3. 링크 나눠 주기
배포가 끝나면 `https://○○○.vercel.app` 주소가 나와요. 이 주소를 학생들에게 알려 주면 끝이에요.
주소가 열리지 않고 Vercel 로그인 화면이 나오면 프로젝트의 **Settings → Deployment Protection**에서
Production 주소가 공개로 되어 있는지 확인하세요.

## 고칠 수 있는 것
- 친구 말투와 설명: `api/_personas.js` (고친 뒤 다시 배포)
- 친구 이름, 추천 질문, 인사말: `public/index.html`의 `FRIENDS` 부분
- 모델 바꾸기: Vercel 환경 변수 `CLAUDE_MODEL` (기본값 `claude-haiku-5-5`)
- 1분당 요청 한도: 환경 변수 `PER_MINUTE_LIMIT` (기본값 같은 와이파이당 120번)

## 알아 두세요
- 대화 내용은 서버에 저장하지 않아요. 각자 기기 브라우저에만 남고, `대화 지우기`로 지울 수 있어요.
- 학생 입력은 한 번에 100자까지만 서버로 보냅니다.
- 사용량은 만든 API 키 계정에서 계산돼요. Console에서 사용량을 가끔 확인해 주세요.
