import { useEffect, useMemo, useState } from 'react'
import { qnaData } from '../data/index.js'
import { Header } from './qna/Header.jsx'
import { FilterTabs } from './qna/FilterTabs.jsx'
import { SearchInput } from './qna/SearchInput.jsx'
import { QnaList } from './qna/QnaList.jsx'
import { Pagination } from './qna/Pagination.jsx'
import { QnaDetail } from './qna/QnaDetail.jsx'
import { tokenize, searchAndSort } from './qna/search.js'

const PAGE_SIZE = 10

export default function KsaeSearch() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const keywords = useMemo(() => tokenize(query), [query])

  const results = useMemo(() => {
    let items = qnaData
    if (filter === 'answered') items = items.filter((it) => it.answer)
    if (filter === 'unanswered') items = items.filter((it) => !it.answer)
    return searchAndSort(items, keywords)
  }, [keywords, filter])

  useEffect(() => {
    setPage(1)
  }, [keywords, filter])

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE))
  const pagedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-surface text-fg">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        {selected ? (
          <QnaDetail item={selected} keywords={keywords} onBack={() => setSelected(null)} />
        ) : (
          <>
            <h1 className="page-title mb-8 text-center">KSAE Q&A</h1>

            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <FilterTabs filter={filter} onChange={setFilter} />
              <SearchInput value={query} onChange={setQuery} />
            </div>

            <div className="mb-3 flex items-center justify-end">
              <span className="text-sm text-fg-muted">총 {results.length}건</span>
            </div>

            <QnaList
              items={pagedResults}
              page={page}
              pageSize={PAGE_SIZE}
              total={results.length}
              keywords={keywords}
              onSelect={setSelected}
            />

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
          </>
        )}
      </div>
    </div>
  )
}
