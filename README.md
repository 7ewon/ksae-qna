# KSAE Q&A

KSAE(대학생 자작자동차대회) 게시판에 쌓인 Q&A 글을 모아 제목/본문 통합 검색과 답변 상태별 필터링을 제공하는 정적 웹앱입니다.

## 기능

- 제목 가중치를 둔 다중 키워드 검색 (모든 키워드를 포함하는 글만, 제목 매치 우선 정렬)
- 전체 / 답변완료 / 미답변 필터, 검색어 하이라이트
- 목록 → 상세 페이지 전환, 페이지네이션
- 질문/답변 원문 링크, 첨부파일 다운로드 링크

## 기술 스택

- React 19 + Vite
- Tailwind CSS v4 (`@theme` 기반 디자인 토큰)
- TypeScript(빌드 체크) + Oxlint

## 시작하기

```bash
npm install
npm run dev       # 개발 서버 (http://localhost:5173)
npm run build     # 타입 체크 + 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # Oxlint
```

## 프로젝트 구조

```
src/
  components/
    KsaeSearch.jsx      # 상태 관리 + 하위 컴포넌트 조립
    qna/
      Header.jsx        # 상단 로고 바
      FilterTabs.jsx     # 전체/답변완료/미답변 탭
      SearchInput.jsx    # 검색창
      QnaList.jsx        # 목록 행
      Pagination.jsx     # 페이지네이션
      QnaDetail.jsx      # 상세 페이지
      search.js          # 검색/정렬/텍스트 정규화 로직
      highlight.jsx       # 검색어 하이라이트
      icons.jsx          # 인라인 SVG 아이콘
  data/
    index.js             # 파트별 JSON 병합
    ksae_formula_qna_part*.json  # 원본 Q&A 데이터
  index.css              # 디자인 토큰(@theme) + 컴포넌트 클래스
public/
  logo-ksae.png
  logo-gbunge.png
```

## 데이터

`src/data/ksae_formula_qna_part*.json`은 KSAE 홈페이지 Q&A 게시판(`ksae.org/jajak/bbs`)에서 수집한 정적 스냅샷입니다. 새 글을 반영하려면 데이터를 다시 수집해 해당 JSON 파일들을 갱신하면 됩니다.