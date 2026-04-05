import type { Dispatch, SetStateAction } from "react";

export default function TablePagination({
  page, 
  pageSize, 
  setPage, 
  setPageSize,
  totalPages,
  PAGE_SIZE_OPTIONS,
  filtered, 
}:{
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
  PAGE_SIZE_OPTIONS: number[];
  filtered: any[];
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div
        className="flex items-center gap-2 text-xs"
        style={{ color: "var(--brownish-dark-grey)" }}
      >
        <span>Rows:</span>
        {PAGE_SIZE_OPTIONS.map((n) => (
          <button
            key={n}
            onClick={() => {
              setPageSize(n);
              setPage(1);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
            style={{
              background:
                pageSize === n ? "var(--grape-purple)" : "transparent",
              color: pageSize === n ? "#fff" : "var(--brownish-dark-grey)",
              border: `1.5px solid ${pageSize === n ? "var(--grape-purple)" : "var(--light-grey-purple)"}`,
            }}
            type="button"
          >
            {n}
          </button>
        ))}
      </div>
      <div
        className="flex items-center gap-1 text-xs"
        style={{ color: "var(--brownish-dark-grey)" }}
      >
        <span className="mr-2">
          {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </span>
        {[
          { label: "«", action: () => setPage(1), disabled: page === 1 },
          {
            label: "‹",
            action: () => setPage((p) => p - 1),
            disabled: page === 1,
          },
          {
            label: "›",
            action: () => setPage((p) => p + 1),
            disabled: page === totalPages,
          },
          {
            label: "»",
            action: () => setPage(totalPages),
            disabled: page === totalPages,
          },
        ].map((btn, i) => (
          <button
            key={btn.label}
            onClick={btn.action}
            disabled={btn.disabled}
            className="px-2 py-1 rounded-lg transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{
              border: "1.5px solid var(--light-grey-purple)",
              color: "var(--dark-blue-indigo)",
            }}
            type="button"
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}