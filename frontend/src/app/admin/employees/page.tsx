"use client";
import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type Employee = {
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
type SortDir = "asc" | "desc";

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
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const inputStyle = {
	background: "var(--floral-white, #fffaf2)",
	border: "1.5px solid var(--light-grey-purple)",
	color: "var(--dark-blue-indigo, #2e294e)",
};

function StyledInput({
	value,
	onChange,
	type = "text",
	placeholder = "",
}: any) {
	return (
		<input
			type={type}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
			style={inputStyle}
			onFocus={(e) =>
				(e.target.style.borderColor = "var(--grape-purple, #9c528b)")
			}
			onBlur={(e) => (e.target.style.borderColor = "var(--light-grey-purple)")}
		/>
	);
}

function StyledSelect({ value, onChange, children }: any) {
	return (
		<select
			value={value}
			onChange={onChange}
			className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
			style={inputStyle}
		>
			{children}
		</select>
	);
}

export default function EmployeesPage() {
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
		let list = [...employees];
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
					className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
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
										<td className="px-4 py-3">
											<button
												onClick={() => openEdit(emp)}
												className="text-xs font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
												style={{ color: "var(--grape-purple, #9c528b)" }}
												type="button"
											>
												Edit
											</button>
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
										pageSize === n
											? "var(--grape-purple, #9c528b)"
											: "transparent",
									color: pageSize === n ? "#fff" : "var(--brownish-dark-grey)",
									border: `1.5px solid ${pageSize === n ? "var(--grape-purple, #9c528b)" : "var(--light-grey-purple)"}`,
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
							{filtered.length === 0
								? "0"
								: `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`}{" "}
							of {filtered.length}
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
									color: "var(--dark-blue-indigo, #2e294e)",
								}}
								type="button"
							>
								{btn.label}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Add / Edit modal */}
			{showModal && (
				<div
					className="fixed inset-0 flex items-center justify-center z-50 p-4"
					style={{ background: "var(--almost-light-grey-purple)" }}
				>
					<div
						className="rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
						style={{
							background: "#fff",
							boxShadow: "0 24px 64px rgba(46,41,78,0.18)",
						}}
					>
						<h3
							className="font-bold text-base mb-1"
							style={{ color: "var(--dark-blue-indigo, #2e294e)" }}
						>
							{editTarget ? "Edit employee" : "Add new employee"}
						</h3>
						<p
							className="text-xs mb-5"
							style={{ color: "var(--brownish-dark-grey)" }}
						>
							{editTarget
								? `Editing ${editTarget.name}`
								: "Fill in the details for the new employee"}
						</p>

						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-3">
								{[
									{ key: "name", label: "Full name", type: "text" },
									{ key: "employeeId", label: "Employee ID", type: "text" },
								].map((f) => (
									<div key={f.key}>
										<label
											className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
											style={{ color: "var(--brownish-dark-grey)" }}
											htmlFor=""
										>
											{f.label}
										</label>
										<StyledInput
											type={f.type}
											value={(form as any)[f.key]}
											onChange={(e: any) =>
												setForm((p) => ({ ...p, [f.key]: e.target.value }))
											}
										/>
									</div>
								))}
							</div>

							{[
								{ key: "email", label: "Email", type: "email" },
								{
									key: "password",
									label: editTarget
										? "New password (leave blank to keep)"
										: "Password",
									type: "password",
								},
							].map((f) => (
								<div key={f.key}>
									<label
										className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
										style={{ color: "var(--brownish-dark-grey)" }}
										htmlFor={f.key}
									>
										{f.label}
									</label>
									<StyledInput
										type={f.type}
										value={(form as any)[f.key]}
										onChange={(e: any) =>
											setForm((p) => ({ ...p, [f.key]: e.target.value }))
										}
									/>
								</div>
							))}

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
										style={{ color: "var(--brownish-dark-grey)" }}
										htmlFor="department"
									>
										Department
									</label>
									<StyledInput
										value={form.department}
										onChange={(e: any) =>
											setForm((p) => ({ ...p, department: e.target.value }))
										}
									/>
								</div>
								<div>
									<label
										className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
										style={{ color: "var(--brownish-dark-grey)" }}
										htmlFor=""
									>
										Position
									</label>
									<StyledInput
										value={form.position}
										onChange={(e: any) =>
											setForm((p) => ({ ...p, position: e.target.value }))
										}
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label
										className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
										style={{ color: "var(--brownish-dark-grey)" }}
										htmlFor="role"
									>
										Role
									</label>
									<StyledSelect
										value={form.role}
										onChange={(e: any) =>
											setForm((p) => ({ ...p, role: e.target.value }))
										}
									>
										<option value="employee">Employee</option>
										<option value="admin">Admin</option>
									</StyledSelect>
								</div>
								<div>
									<label
										className="text-xs font-semibold uppercase tracking-wider block mb-1.5"
										style={{ color: "var(--brownish-dark-grey)" }}
										htmlFor="status"
									>
										Status
									</label>
									<StyledSelect
										value={form.isActive ? "active" : "inactive"}
										onChange={(e: any) =>
											setForm((p) => ({
												...p,
												isActive: e.target.value === "active",
											}))
										}
									>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
									</StyledSelect>
								</div>
							</div>
						</div>

						<div className="flex gap-2 mt-6">
							<button
								onClick={() => setShowModal(false)}
								className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-all hover:opacity-80"
								style={{
									border: "1.5px solid var(--light-grey-purple)",
									color: "var(--dark-blue-indigo, #2e294e)",
								}}
								type="button"
							>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={saving}
								className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
								style={{
									background: "var(--grape-purple, #9c528b)",
									color: "#fff",
								}}
								type="button"
							>
								{saving ? "Saving…" : "Save"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
