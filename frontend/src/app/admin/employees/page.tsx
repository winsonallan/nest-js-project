"use client";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import TablePagination from "@/components/TablePagination";
import { inputStyle, PAGE_SIZE_OPTIONS, SortDir } from "@/components/constants";
import AddEditEmployeeModal from "@/components/employees/AddEditEmployeeModal";
import { useRouter } from "next/navigation";

export type Employee = {
	id: number;
	employeeId: string;
	name: string;
	email: string;
	department: string;
	position: string;
	role: string;
	isActive: boolean;
};

type SortKey = keyof Employee;

const EMPTY_FORM = {
	name: "",
	email: "",
	password: "",
	department: "",
	position: "",
	role: "employee",
	employeeId: "",
	isActive: true,
};

export default function EmployeesPage() {
	const router = useRouter();

	const [employees, setEmployees] = useState<Employee[]>([]);
	const [filtered, setFiltered] = useState<Employee[]>([]);
	const [paged, setPaged] = useState<Employee[]>([]);
	const [search, setSearch] = useState("");
	const [dept, setDept] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("employeeId");
	const [sortDir, setSortDir] = useState<SortDir>("asc");
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [showModal, setShowModal] = useState(false);
	const [editTarget, setEditTarget] = useState<Employee | null>(null);
	const [form, setForm] = useState(EMPTY_FORM);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const load = () => {
		setLoading(true);
		api
			.get("/employees")
			.then((r) => setEmployees(r.data))
			.finally(() => setLoading(false));
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <load changes on every re-render.>
	useEffect(() => {
		load();
	}, []);

	useEffect(() => {
		let list = [...employees].filter((e) => e.role !== "admin");

		if (search)
			list = list.filter(
				(e) =>
					e.name.toLowerCase().includes(search.toLowerCase()) ||
					e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
					e.email.toLowerCase().includes(search.toLowerCase()),
			);
			
		if (dept) list = list.filter((e) => e.department === dept);
		list.sort((a, b) => {
			const av = String(a[sortKey] ?? "").toLowerCase();
			const bv = String(b[sortKey] ?? "").toLowerCase();
			return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
		});
		setFiltered(list);
		setPage(1);
	}, [employees, search, dept, sortKey, sortDir]);

	useEffect(() => {
		const start = (page - 1) * pageSize;
		setPaged(filtered.slice(start, start + pageSize));
	}, [filtered, page, pageSize]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const departments = [
		...new Set(employees.map((e) => e.department).filter(Boolean)),
	];

	const handleSort = (key: SortKey) => {
		if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
		else {
			setSortKey(key);
			setSortDir("asc");
		}
	};

	const SI = ({ k }: { k: SortKey }) => (
		<span
			className="ml-1 select-none"
			style={{
				color:
					sortKey === k
						? "var(--grape-purple, #9c528b)"
						: "var(--light-transparent-grey)",
			}}
		>
			{sortKey === k ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
		</span>
	);

	const openAdd = () => {
		setEditTarget(null);
		setForm(EMPTY_FORM);
		setShowModal(true);
	};
	const openEdit = (emp: Employee) => {
		setEditTarget(emp);
		setForm({ ...emp, password: "" });
		setShowModal(true);
	};

	const handleSave = async () => {
		setSaving(true);
		try {
			if (editTarget) {
				const payload = { ...form } as any;
				if (!payload.password) delete payload.password;
				await api.patch(`/employees/${editTarget.id}`, payload);
			} else {
				await api.post("/employees", form);
			}
			setShowModal(false);
			load();
		} catch (err: any) {
			alert(err.response?.data?.message ?? "Something went wrong");
		} finally {
			setSaving(false);
		}
	};

	const thStyle =
		"text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap";

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2
					className="text-xl font-bold"
					style={{ color: "var(--dark-blue-indigo, #2e294e)" }}
				>
					Employee master data
				</h2>
				<button
					onClick={openAdd}
					className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
					style={{
						background: "var(--grape-purple, #9c528b)",
						color: "#fff",
						boxShadow: "0 4px 16px rgba(156,82,139,0.25)",
					}}
					type="button"
				>
					<PlusCircle size={14} />
					Add employee
				</button>
			</div>

			{/* Filters */}
			<div className="flex gap-2 flex-wrap">
				<input
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search name, ID or email..."
					className="rounded-xl px-3 py-2 text-sm flex-1 min-w-48 outline-none transition-all"
					style={inputStyle}
					onFocus={(e) =>
						(e.target.style.borderColor = "var(--grape-purple, #9c528b)")
					}
					onBlur={(e) =>
						(e.target.style.borderColor = "var(--light-grey-purple)")
					}
				/>
				<select
					value={dept}
					onChange={(e) => setDept(e.target.value)}
					className="rounded-xl px-3 py-2 text-sm outline-none"
					style={inputStyle}
				>
					<option value="">All departments</option>
					{departments.map((d) => (
						<option key={d} value={d}>
							{d}
						</option>
					))}
				</select>
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
								borderColor: "var(--grape-purple, #9c528b)",
								borderTopColor: "transparent",
							}}
						/>
					</div>
				) : (
					<table className="w-full text-sm">
						<thead
							style={{
								background: "var(--floral-white, #fffaf2)",
								borderBottom: "1.5px solid var(--light-grey-purple)",
							}}
						>
							<tr>
								{(
									[
										{ label: "ID", key: "employeeId" },
										{ label: "Name", key: "name" },
										{ label: "Email", key: "email" },
										{ label: "Department", key: "department" },
										{ label: "Position", key: "position" },
										{ label: "Status", key: "isActive" },
									] as { label: string; key: SortKey }[]
								).map((col) => (
									<th
										key={col.key}
										className={thStyle}
										onClick={() => handleSort(col.key)}
										style={{
											color:
												sortKey === col.key
													? "var(--grape-purple, #9c528b)"
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
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{paged.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="text-center py-12 text-sm"
										style={{ color: "var(--brownish-dark-grey)" }}
									>
										No employees found.
									</td>
								</tr>
							) : (
								paged.map((emp) => (
									<tr
										key={emp.id}
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
											className="px-4 py-3 text-xs font-mono"
											style={{ color: "var(--brownish-dark-grey)" }}
										>
											{emp.employeeId}
										</td>
										<td
											className="px-4 py-3 font-semibold text-sm"
											style={{ color: "var(--dark-blue-indigo, #2e294e)" }}
										>
											{emp.name}
										</td>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--brownish-dark-grey)" }}
										>
											{emp.email}
										</td>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--dark-blue-indigo, #2e294e)" }}
										>
											{emp.department}
										</td>
										<td
											className="px-4 py-3 text-xs"
											style={{ color: "var(--dark-blue-indigo, #2e294e)" }}
										>
											{emp.position}
										</td>
										<td className="px-4 py-3">
											<span
												className="text-xs px-2.5 py-1 rounded-full font-semibold"
												style={
													emp.isActive
														? {
																background: "rgba(7,190,184,0.10)",
																color: "var(--sea-green, #07beb8)",
															}
														: {
																background: "var(--lighter-transparent-grey)",
																color: "var(--brownish-dark-grey)",
															}
												}
											>
												{emp.isActive ? "Active" : "Inactive"}
											</span>
										</td>
										<td className="flex flex-wrap gap-x-2 px-4 py-3 gap-y-1.5">
												<button
													onClick={() => openEdit(emp)}
													className="text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70 cursor-pointer text-left"
													style={{ color: "var(--grape-purple, #9c528b)" }}
													type="button"
												>
													Edit
												</button>
												{
													emp.role !== "admin" && (
														<button
															onClick={() => router.push(`/admin/attendance/employees/${emp.id}`)}
															className="text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70 cursor-pointer text-left"
															style={{ color: "var(--dark-tosca)" }}
															type="button"
														>
															View Attendance
														</button>
													)
												}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				)}
			</div>

			{/* Pagination */}
			{!loading && (
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

			{/* Add / Edit modal */}
			{showModal && (
				<AddEditEmployeeModal
					editTarget={editTarget}
					form={form}
					setForm={setForm}
					setShowModal={setShowModal}
					handleSave={handleSave}
					saving={saving}
				/>
			)}
		</div>
	);
}
