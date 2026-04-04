"use client";
import { useEffect, useState } from "react";
import PhotoModal from "@/components/attendance/PhotoModal";
import { STATUS_STYLE } from "@/components/StatusStyles";
import api from "@/lib/api";

type SortDir = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

function getStatus(time: string | null): string {
	if (!time) return "Absent";
	const [h, m] = time.split(":").map(Number);
	return h < 9 || (h === 9 && m === 0) ? "On time" : "Late";
}

const inputStyle = {
	background: "var(--floral-white)",
	border: "1.5px solid var(--light-grey-purple)",
	color: "var(--dark-blue-indigo)",
};

export default function AdminAttendancePage() {
	const [records, setRecords] = useState<any[]>([]);
	const [filtered, setFiltered] = useState<any[]>([]);
	const [paged, setPaged] = useState<any[]>([]);
	const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [deptFilter, setDeptFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [sortKey, setSortKey] = useState("checkInTime");
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [loading, setLoading] = useState(true);
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);

	useEffect(() => {
		setLoading(true);
		api
			.get(`/attendance/all?date=${date}`)
			.then(({ data }) => setRecords(data))
			.finally(() => setLoading(false));
	}, [date]);

	useEffect(() => {
		let list = [...records];
		if (deptFilter)
			list = list.filter((r) => r.employee?.department === deptFilter);
		if (statusFilter)
			list = list.filter((r) => getStatus(r.checkInTime) === statusFilter);
		list.sort((a, b) => {
			let av = "",
				bv = "";
			if (sortKey === "name") {
				av = a.employee?.name ?? "";
				bv = b.employee?.name ?? "";
			}
			if (sortKey === "dept") {
				av = a.employee?.department ?? "";
				bv = b.employee?.department ?? "";
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
	}, [records, deptFilter, statusFilter, sortKey, sortDir]);

	useEffect(() => {
		const start = (page - 1) * pageSize;
		setPaged(filtered.slice(start, start + pageSize));
	}, [filtered, page, pageSize]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const departments = [
		...new Set(records.map((r: any) => r.employee?.department).filter(Boolean)),
	];

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

	const summary = {
		onTime: filtered.filter((r) => getStatus(r.checkInTime) === "On time")
			.length,
		late: filtered.filter((r) => getStatus(r.checkInTime) === "Late").length,
		absent: filtered.filter((r) => !r.checkInTime).length,
		total: filtered.length,
	};

	const thStyle =
		"text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap";

	return (
		<div className="space-y-4">
			<h2
				className="text-xl font-bold"
				style={{ color: "var(--dark-blue-indigo)" }}
			>
				Attendance log
			</h2>

			{/* Filters */}
			<div className="flex gap-2 flex-wrap">
				<input
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					className="rounded-xl px-3 py-2 text-sm outline-none transition-all"
					style={inputStyle}
					onFocus={(e) => (e.target.style.borderColor = "var(--grape-purple)")}
					onBlur={(e) =>
						(e.target.style.borderColor = "var(--light-grey-purple)")
					}
				/>
				{[
					{
						value: deptFilter,
						onChange: (e: any) => setDeptFilter(e.target.value),
						children: (
							<>
								<option value="">All departments</option>
								{departments.map((d) => (
									<option key={d as string} value={d as string}>
										{d as string}
									</option>
								))}
							</>
						),
					},
					{
						value: statusFilter,
						onChange: (e: any) => setStatusFilter(e.target.value),
						children: (
							<>
								<option value="">All status</option>
								<option>On time</option>
								<option>Late</option>
								<option>Absent</option>
							</>
						),
					},
				].map((sel, i) => (
					<select
						key={`item_${sel.value}`}
						value={sel.value}
						onChange={sel.onChange}
						className="rounded-xl px-3 py-2 text-sm outline-none"
						style={inputStyle}
					>
						{sel.children}
					</select>
				))}
			</div>

			{/* Summary pills */}
			<div className="flex gap-2 flex-wrap">
				{[
					{ label: `${summary.onTime} on time`, ...STATUS_STYLE["On time"] },
					{ label: `${summary.late} late`, ...STATUS_STYLE["Late"] },
					{ label: `${summary.absent} absent`, ...STATUS_STYLE["Absent"] },
					{
						label: `${summary.total} total`,
						bg: "var(--light-grey-purple)",
						color: "var(--dark-blue-indigo)",
					},
				].map((s) => (
					<span
						key={s.label}
						className="text-xs px-3 py-1.5 rounded-full font-semibold"
						style={{ background: s.bg, color: s.color }}
					>
						{s.label}
					</span>
				))}
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
						No records found.
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
									{ label: "Employee", key: "name" },
									{ label: "Department", key: "dept" },
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
								{["Notes", "Photo"].map((h) => (
									<th
										key={h}
										className={thStyle}
										style={{
											color: "var(--brownish-dark-grey)",
											cursor: "default",
										}}
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{paged.map((r: any) => {
								const status = getStatus(r.checkInTime);
								const s = STATUS_STYLE[status];
								return (
									<tr
										key={r.id}
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
										<td className="px-4 py-3">
											<p
												className="text-sm font-semibold"
												style={{ color: "var(--dark-blue-indigo)" }}
											>
												{r.employee?.name}
											</p>
											<p
												className="text-xs mt-0.5"
												style={{ color: "var(--brownish-dark-grey)" }}
											>
												{new Date(r.date).toLocaleDateString("id-ID", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</p>
										</td>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--brownish-dark-grey)" }}
										>
											{r.employee?.department}
										</td>
										<td
											className="px-4 py-3 font-semibold text-xs"
											style={{ color: "var(--dark-blue-indigo)" }}
										>
											{r.checkInTime?.slice(0, 5) ?? "—"}
										</td>
										<td className="px-4 py-3">
											<span
												className="text-xs px-2.5 py-1 rounded-full font-semibold"
												style={{ background: s.bg, color: s.color }}
											>
												{status}
											</span>
										</td>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--brownish-dark-grey)" }}
										>
											{r.notes ?? (
												<span
													style={{ color: "var(--light-transparent-grey)" }}
												>
													—
												</span>
											)}
										</td>
										<td className="px-4 py-3">
											{r.photoPath ? (
												<button
													onClick={() =>
														setPhotoUrl(
															`${process.env.NEXT_PUBLIC_BACKEND_URL}/${r.photoPath}`,
														)
													}
													className="text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
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
									</tr>
								);
							})}
						</tbody>
					</table>
				)}
			</div>

			{/* Pagination */}
			{!loading && filtered.length > 0 && (
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
								className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
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
								className="px-2 py-1 rounded-lg transition-all disabled:opacity-30"
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
			)}

			{/* Photo modal */}
			{photoUrl && <PhotoModal setPhotoUrl={setPhotoUrl} photoUrl={photoUrl} />}
		</div>
	);
}
