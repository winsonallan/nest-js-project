"use client";

import { useEffect, useState, useMemo } from "react";
import PhotoModal from "@/components/attendance/PhotoModal";
import { STATUS_STYLE } from "@/components/StatusStyles";
import api from "@/lib/api";
import AttendanceSummary from "@/components/AttendanceSummary";
import TablePagination from "@/components/TablePagination";
import { PAGE_SIZE_OPTIONS, type SortDir } from "@/components/constants";
import { getWorkingDaysInMonth } from "@/lib/attendance";
import { getStatus } from "@/lib/attendance";

export default function HistoryPage() {
	const [records, setRecords] = useState<any[]>([]);
	const [filtered, setFiltered] = useState<any[]>([]);
	const [paged, setPaged] = useState<any[]>([]);
	const [month, setMonth] = useState(() =>
		new Date().toISOString().slice(0, 7),
	);
	const [sortKey, setSortKey] = useState("date");
	const [sortDir, setSortDir] = useState<SortDir>("desc");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);

	useEffect(() => {
		api
			.get("/attendance/my-history")
			.then(({ data }) => setRecords(data))
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		const list = records.filter((r) => r.date?.startsWith(month));
		list.sort((a, b) => {
			let av = "",
				bv = "";
			if (sortKey === "date") {
				av = a.date ?? "";
				bv = b.date ?? "";
			}
			if (sortKey === "time") {
				av = a.checkInTime ?? "99:99";
				bv = b.checkInTime ?? "99:99";
			}
			if (sortKey === "status") {
				av = getStatus(a.checkInTime);
				bv = getStatus(b.checkInTime);
			}
			return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
		});
		setFiltered(list);
		setPage(1);
	}, [records, month, sortKey, sortDir]);

	useEffect(() => {
		const start = (page - 1) * pageSize;
		setPaged(filtered.slice(start, start + pageSize));
	}, [filtered, page, pageSize]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

	const handleSort = (key: string) => {
		if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else {
			setSortKey(key);
			setSortDir("asc");
		}
	};

	const SI = ({ k }: { k: string }) => (
		<span
			className="ml-1 select-none"
			style={{
				color:
					sortKey === k
						? "var(--grape-purple)"
						: "var(--light-transparent-grey)",
			}}
		>
			{sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
		</span>
	);

	const summary = useMemo(() => {
		const workingDays = getWorkingDaysInMonth(month);
		const checkedInDates = new Set(filtered.map(r => r.date));

		const present = filtered.filter(r => getStatus(r.checkInTime) === 'On time').length;
		const late    = filtered.filter(r => getStatus(r.checkInTime) === 'Late').length;
		const absent  = workingDays.filter(d => !checkedInDates.has(d)).length;

		return { present, late, absent };
	}, [filtered, month]);
	const thStyle =
		"text-left px-4 py-3 text-xs font-semibold cursor-pointer select-none whitespace-nowrap uppercase tracking-wider";

	return (
		<div className="space-y-4">
			<h2
				className="text-xl font-bold"
				style={{ color: "var(--dark-blue-indigo)" }}
			>
				Attendance history
			</h2>

			{/* Filter + summary */}
			<div
				className="rounded-2xl p-4"
				style={{
					background: "#fff",
					border: "1.5px solid var(--light-grey-purple)",
				}}
			>
				<div className="flex items-center gap-3 mb-3">
					<input
						type="month"
						value={month}
						onChange={(e) => setMonth(e.target.value)}
						className="rounded-xl px-3 py-1.5 text-sm outline-none transition-all"
						style={{
							background: "var(--floral-white)",
							border: "1.5px solid var(--light-grey-purple)",
							color: "var(--dark-blue-indigo)",
						}}
					/>
				</div>
				<AttendanceSummary showTotal={false} summary={summary}/>
			</div>

			{/* Table */}
			<div
				className="rounded-2xl overflow-hidden"
				style={{
					background: "#fff",
					border: "1.5px solid var(--light-grey-purple)",
				}}
			>
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div
							className="w-6 h-6 rounded-full border-2 animate-spin"
							style={{
								borderColor: "var(--grape-purple)",
								borderTopColor: "transparent",
							}}
						/>
					</div>
				) : filtered.length === 0 ? (
					<div
						className="text-center py-12 text-sm"
						style={{ color: "var(--brownish-dark-grey)" }}
					>
						No records for this month.
					</div>
				) : (
					<table className="w-full text-sm">
						<thead
							style={{
								background: "var(--floral-white)",
								borderBottom: "1.5px solid var(--light-grey-purple)",
							}}
						>
							<tr>
								{[
									{ label: "Date", key: "date" },
									{ label: "Time", key: "time" },
									{ label: "Status", key: "status" },
								].map((col) => (
									<th
										key={col.key}
										className={thStyle}
										onClick={() => handleSort(col.key)}
										style={{
											color:
												sortKey === col.key
													? "var(--grape-purple)"
													: "var(--brownish-dark-grey)",
										}}
									>
										{col.label}
										<SI k={col.key} />
									</th>
								))}
								<th
									className={thStyle}
									style={{
										color: "var(--brownish-dark-grey)",
										cursor: "default",
									}}
								>
									Photo
								</th>
								<th
									className={thStyle}
									style={{
										color: "var(--brownish-dark-grey)",
										cursor: "default",
									}}
								>
									Notes
								</th>
							</tr>
						</thead>
						<tbody>
							{paged.map((item: any) => {
								const status = getStatus(item.checkInTime);
								const s = STATUS_STYLE[status];
								return (
									<tr
										key={item.id}
										className="transition-colors"
										style={{
											borderBottom: "1px solid var(--light-grey-purple)",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background =
												"rgba(156,82,139,0.03)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "transparent")
										}
									>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--dark-blue-indigo)" }}
										>
											{new Date(item.date).toLocaleDateString("en-US", {
												weekday: "short",
												day: "numeric",
												month: "short",
											})}
										</td>
										<td
											className="px-4 py-3 font-semibold text-xs"
											style={{ color: "var(--dark-blue-indigo)" }}
										>
											{item.checkInTime?.slice(0, 5) ?? "—"}
										</td>
										<td className="px-4 py-3">
											<span
												className="text-xs px-2.5 py-1 rounded-full font-semibold"
												style={{ background: s.bg, color: s.color }}
											>
												{status}
											</span>
										</td>
										<td className="px-4 py-3">
											{item.photoPath ? (
												<button
													onClick={() =>
														setPhotoUrl(
															`${process.env.NEXT_PUBLIC_BACKEND_URL}/${item.photoPath}`,
														)
													}
													className="text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70 cursor-pointer"
													style={{ color: "var(--grape-purple)" }}
													type="button"
												>
													View
												</button>
											) : (
												<span
													style={{ color: "var(--light-transparent-grey)" }}
												>
													—
												</span>
											)}
										</td>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--brownish-dark-grey)" }}
										>
											{item.notes ?? (
												<span
													style={{ color: "var(--light-transparent-grey)" }}
												>
													—
												</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>

			{/* Pagination */}
			{!loading && filtered.length > 0 && (
				<TablePagination 
					page={page} 
					pageSize={pageSize} 
					setPage={setPage} 
					setPageSize={setPageSize} 
					PAGE_SIZE_OPTIONS={PAGE_SIZE_OPTIONS} 
					filtered={filtered} 
					totalPages={totalPages}
				/>
			)}

			{/* Photo modal */}
			{photoUrl && <PhotoModal setPhotoUrl={setPhotoUrl} photoUrl={photoUrl} />}
		</div>
	);
}
