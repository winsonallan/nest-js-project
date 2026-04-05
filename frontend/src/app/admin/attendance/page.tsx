"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PhotoModal from "@/components/attendance/PhotoModal";
import { STATUS_STYLE } from "@/components/StatusStyles";
import api from "@/lib/api";
import AttendanceSummary from "@/components/AttendanceSummary";
import TablePagination from "@/components/TablePagination";
import { PAGE_SIZE_OPTIONS, inputStyle, type SortDir } from "@/components/constants";
import { getStatus, toLocalDateString } from "@/lib/attendance";

export default function AdminAttendancePage() {
  const router = useRouter();
  const [records, setRecords]       = useState<any[]>([]);
  const [employees, setEmployees]   = useState<any[]>([]);
  const [filtered, setFiltered]     = useState<any[]>([]);
  const [paged, setPaged]           = useState<any[]>([]);
  const [date, setDate]             = useState(() => toLocalDateString(new Date()));
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey]       = useState("time");
  const [sortDir, setSortDir]       = useState<SortDir>("asc");
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [loading, setLoading]       = useState(true);
  const [photoUrl, setPhotoUrl]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/attendance/all?date=${date}`),
      api.get("/employees"),
    ]).then(([attRes, empRes]) => {
      setRecords(attRes.data);
      setEmployees(empRes.data.filter((e: any) => e.isActive));
    }).finally(() => setLoading(false));
  }, [date]);

  const isWeekend = useMemo(() => {
    // Parse date parts directly to avoid UTC offset issues
    const [y, m, d] = date.split("-").map(Number);
    const dow = new Date(y, m - 1, d).getDay();
    return dow === 0 || dow === 6;
  }, [date]);

  // Merge real records with synthetic absent rows
  const fullList = useMemo(() => {
    if (isWeekend) return records;
    const checkedInIds = new Set(records.map((r: any) => r.employeeId));
    const absentRows = employees
      .filter((e: any) => !checkedInIds.has(e.id))
      .map((e: any) => ({
        id: `absent-${e.id}`,
        employeeId: e.id,
        employee: e,
        date,
        checkInTime: null,
        photoPath: null,
        notes: null,
      }));
    return [...records, ...absentRows];
  }, [records, employees, date, isWeekend]);

  // Filter + sort
  useEffect(() => {
    let list = [...fullList].filter(r => r.employee.role !== "admin");

    if (deptFilter)   list = list.filter(r => r.employee?.department === deptFilter);
    if (statusFilter) list = list.filter(r => getStatus(r.checkInTime) === statusFilter);
    list.sort((a, b) => {
      let av = "", bv = "";
      if (sortKey === "name")   { av = a.employee?.name ?? ""; bv = b.employee?.name ?? ""; }
      if (sortKey === "dept")   { av = a.employee?.department ?? ""; bv = b.employee?.department ?? ""; }
      if (sortKey === "time")   { av = a.checkInTime ?? "99:99"; bv = b.checkInTime ?? "99:99"; }
      if (sortKey === "status") { av = getStatus(a.checkInTime); bv = getStatus(b.checkInTime); }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    setFiltered(list);
    setPage(1);
  }, [fullList, deptFilter, statusFilter, sortKey, sortDir]);

  useEffect(() => {
    const start = (page - 1) * pageSize;
    setPaged(filtered.slice(start, start + pageSize));
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const departments = [...new Set(employees.map((e: any) => e.department).filter(Boolean))];

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SI = ({ k }: { k: string }) => (
    <span className="ml-1 select-none" style={{
      color: sortKey === k ? "var(--grape-purple)" : "var(--light-transparent-grey)",
    }}>
      {sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const summary = useMemo(() => {
    if (isWeekend) return { present: 0, late: 0, absent: 0, total: 0 };
    const onTime  = filtered.filter(r => getStatus(r.checkInTime) === "On time").length;
    const late    = filtered.filter(r => getStatus(r.checkInTime) === "Late").length;
    const absent  = filtered.filter(r => getStatus(r.checkInTime) === "Absent").length;
    return { present: onTime + late, late, absent, total: filtered.length };
  }, [filtered, isWeekend]);

  const thStyle = "text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold" style={{ color: "var(--dark-blue-indigo)" }}>
          Attendance log
        </h2>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none transition-all"
          style={inputStyle}
          onFocus={e => e.target.style.borderColor = "var(--grape-purple)"}
          onBlur={e => e.target.style.borderColor = "var(--light-grey-purple)"} />
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle}>
          <option value="">All departments</option>
          {departments.map(d => <option key={d as string} value={d as string}>{d as string}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm outline-none" style={inputStyle}>
          <option value="">All status</option>
          <option>On time</option>
          <option>Late</option>
          <option>Absent</option>
        </select>
      </div>

      {isWeekend ? (
        <p className="text-sm" style={{ color: "var(--brownish-dark-grey)" }}>
          Selected date is a weekend — no attendance expected.
        </p>
      ) : (
        <AttendanceSummary showTotal summary={summary} />
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "#fff", border: "1.5px solid var(--light-grey-purple)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: "var(--grape-purple)", borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: "var(--brownish-dark-grey)" }}>
            No records found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: "var(--floral-white)", borderBottom: "1.5px solid var(--light-grey-purple)" }}>
              <tr>
                {[
                  { label: "Employee", key: "name" },
                  { label: "Department", key: "dept" },
                  { label: "Time", key: "time" },
                  { label: "Status", key: "status" },
                ].map(col => (
                  <th key={col.key} className={thStyle} onClick={() => handleSort(col.key)}
                    style={{ color: sortKey === col.key ? "var(--grape-purple)" : "var(--brownish-dark-grey)" }}>
                    {col.label}<SI k={col.key} />
                  </th>
                ))}
                {["Notes", "Photo"].map(h => (
                  <th key={h} className={thStyle}
                    style={{ color: "var(--brownish-dark-grey)", cursor: "default" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r: any) => {
                const status = getStatus(r.checkInTime);
                const s = STATUS_STYLE[status];
                return (
                  <tr key={r.id}
                    style={{ borderBottom: "1px solid var(--light-grey-purple)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(156,82,139,0.03)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: "var(--dark-blue-indigo)" }}>
                        {r.employee?.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--brownish-dark-grey)" }}>
                        {new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--brownish-dark-grey)" }}>
                      {r.employee?.department}
                    </td>
                    <td className="px-4 py-3 font-semibold text-xs" style={{ color: "var(--dark-blue-indigo)" }}>
                      {r.checkInTime?.slice(0, 5) ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: s.bg, color: s.color }}>{status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--brownish-dark-grey)" }}>
                      {r.notes ?? <span style={{ color: "var(--light-transparent-grey)" }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {r.photoPath ? (
                        <button onClick={() => setPhotoUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${r.photoPath}`)}
                          className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 cursor-pointer"
                          style={{ color: "var(--grape-purple)" }} type="button">
                          View
                        </button>
                      ) : <span style={{ color: "var(--light-transparent-grey)" }}>—</span>}
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <TablePagination page={page} pageSize={pageSize} setPage={setPage}
          setPageSize={setPageSize} PAGE_SIZE_OPTIONS={PAGE_SIZE_OPTIONS}
          filtered={filtered} totalPages={totalPages} />
      )}

      {photoUrl && <PhotoModal setPhotoUrl={setPhotoUrl} photoUrl={photoUrl} />}
    </div>
  );
}