"use client";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { setAuth } from "@/lib/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		if (!email || !password) return setError("Please fill in all fields");
		setLoading(true);
		setError("");
		try {
			const { data } = await api.post("/auth/login", { email, password });
			setAuth(data.access_token, data.user);
			window.location.href =
				data.user.role === "admin" ? "/admin/employees" : "/dashboard";
		} catch {
			setError("Invalid email or password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className="min-h-screen flex items-center justify-center relative overflow-hidden"
			style={{ background: "var(--floral-white, #fffaf2)" }}
		>
			{/* Decorative circles */}
			<div
				className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15 pointer-events-none"
				style={{ background: "var(--grape-purple)" }}
			/>
			<div
				className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10 pointer-events-none"
				style={{ background: "var(--fire-orange)" }}
			/>
			<div
				className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full opacity-10 pointer-events-none"
				style={{ background: "var(--sea-green)" }}
			/>

			<div
				className="relative z-10 w-full max-w-sm mx-4 rounded-3xl p-8"
				style={{
					background: "#fff",
					boxShadow: "0 8px 48px var(--light-grey-purple)",
					border: "1.5px solid rgba(156,82,139,0.10)",
				}}
			>
				{/* Brand */}
				<div className="flex flex-col items-center mb-8">
					<div
						className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
						style={{ background: "var(--grape-purple)" }}
					>
						<ClipboardCheck size={24} color="white" strokeWidth={1.8} />
					</div>
					<h1
						className="text-2xl font-bold tracking-tight"
						style={{ color: "var(--dark-blue-indigo)" }}
					>
						AbsensiKu
					</h1>
					<p
						className="text-xs mt-1 tracking-widest uppercase font-medium"
						style={{ color: "var(--brownish-dark-grey)" }}
					>
						WFH Attendance System
					</p>
				</div>

				{/* Error */}
				{error && (
					<div
						className="mb-5 px-4 py-2.5 rounded-xl text-sm text-center font-medium"
						style={{
							background: "var(--light-fire-orange)",
							color: "var(--fire-orange)",
							border: "1px solid rgba(244,96,54,0.2)",
						}}
					>
						{error}
					</div>
				)}

				{/* Fields */}
				<div className="flex flex-col gap-4">
					<div>
						<label
							className="text-xs font-semibold uppercase tracking-widest block mb-1.5"
							style={{ color: "var(--brownish-dark-grey)" }}
							htmlFor="email"
						>
							Email
						</label>
						<input
							type="email"
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="budi@company.com"
							className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
							style={{
								background: "var(--floral-white, #fffaf2)",
								border: "1.5px solid var(--light-grey-purple)",
								color: "var(--dark-blue-indigo, #2e294e)",
							}}
							onFocus={(e) =>
								(e.target.style.borderColor = "var(--grape-purple, #9c528b)")
							}
							onBlur={(e) =>
								(e.target.style.borderColor = "var(--light-grey-purple)")
							}
						/>
					</div>

					<div>
						<label
							className="text-xs font-semibold uppercase tracking-widest block mb-1.5"
							style={{ color: "var(--brownish-dark-grey)" }}
							htmlFor="password"
						>
							Password
						</label>
						<input
							type="password"
							name="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleLogin()}
							placeholder="••••••••"
							className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
							style={{
								background: "var(--floral-white, #fffaf2)",
								border: "1.5px solid var(--light-grey-purple)",
								color: "var(--dark-blue-indigo)",
							}}
							onFocus={(e) =>
								(e.target.style.borderColor = "var(--grape-purple)")
							}
							onBlur={(e) =>
								(e.target.style.borderColor = "var(--light-grey-purple)")
							}
						/>
					</div>

					<button
						onClick={handleLogin}
						disabled={loading}
						className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-1"
						style={{
							background: "var(--grape-purple)",
							color: "#fff",
							boxShadow: "0 4px 20px rgba(156,82,139,0.3)",
						}}
						type="button"
					>
						{loading ? "Signing in…" : "Sign in"}
					</button>
				</div>

				{/* Footer */}
				<p
					className="text-center text-xs mt-6"
					style={{ color: "var(--brownish-dark-grey)" }}
				>
					Having trouble?{" "}
					<a
						href="mailto:support@company.com"
						className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
						style={{ color: "var(--dark-blue-indigo, #2e294e)" }}
					>
						Contact IT
					</a>
				</p>
			</div>
		</div>
	);
}
