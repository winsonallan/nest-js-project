import { Dispatch, SetStateAction } from "react";
import { inputStyle } from "../constants";
import type { Employee } from "@/app/admin/employees/page";

export default function AddEditEmployeeModal({
  editTarget,
  form,
  setForm,
  setShowModal,
  handleSave,
  saving
} : {
  editTarget: Employee | null;
  form: {
    name: string;
    email: string;
    password: string;
    department: string;
    position: string;
    role: string;
    employeeId: string;
    isActive: boolean;
  };
  setForm: Dispatch<SetStateAction<{
      name: string;
      email: string;
      password: string;
      department: string;
      position: string;
      role: string;
      employeeId: string;
      isActive: boolean;
  }>>;
  handleSave:  () => Promise<void>;
  setShowModal: Dispatch<SetStateAction<boolean>>
  saving: boolean;
}) {
  return (
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
							<StyledSelect
								value={form.department}
								onChange={(e: any) =>
									setForm((p) => ({ ...p, department: e.target.value }))
								}
							>
								<option value="Finance">Finance</option>
								<option value="HRD">HRD</option>
								<option value="Engineering">Engineering</option>
								<option value="Design">Design</option>
								<option value="Marketing">Marketing</option>
							</StyledSelect>
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
						className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-all hover:opacity-80 cursor-pointer"
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
						className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
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
  )
}

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