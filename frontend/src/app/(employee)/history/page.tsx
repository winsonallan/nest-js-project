"use client";

import { useEffect, useState } from "react";
import PhotoModal from "@/components/attendance/PhotoModal";
import { STATUS_STYLE } from "@/components/StatusStyles";
import api from "@/lib/api";

type SortDir = "asc" | "desc";
const PAGE_SIZE_OPTIONS = [5, 10, 20];

function getStatus(time: string | null): string {
	if (!time) return "Absent";
	const [h, m] = time.split(":").map(Number);
	return h < 9 || (h === 9 && m === 0) ? "On time" : "Late";
}

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

	const summary = {
		present: filtered.filter((r) => getStatus(r.checkInTime) !== "Absent")
			.length,
		late: filtered.filter((r) => getStatus(r.checkInTime) === "Late").length,
		absent: filtered.filter((r) => !r.checkInTime).length,
	};

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
				<div className="flex gap-2 flex-wrap">
					{[
						{ label: `${summary.present} present`, ...STATUS_STYLE["On time"] },
						{ label: `${summary.late} late`, ...STATUS_STYLE["Late"] },
						{ label: `${summary.absent} absent`, ...STATUS_STYLE["Absent"] },
					].map((s) => (
						<span
							key={s.label}
							className="text-xs px-3 py-1 rounded-full font-semibold"
							style={{ background: s.bg, color: s.color }}
						>
							{s.label}
						</span>
					))}
				</div>
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
											{new Date(item.date).toLocaleDateString("id-ID", {
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
