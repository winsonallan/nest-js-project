"use client";
import { Clock, FileText, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

const navItems = [
	{
		label: "Dashboard",
		href: "/dashboard",
		icon: <LayoutGrid size={14} />,
	},
	{
		label: "Check in",
		href: "/checkin",
		icon: <Clock size={14} />,
	},
	{
		label: "History",
		href: "/history",
		icon: <FileText size={14} />,
	},
];

export default function EmployeeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const user = getUser();

	const initials =
		user?.name
			?.split(" ")
			.map((n: string) => n[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() ?? "US";

	return (
		<div className="min-h-screen" style={{ background: "var(--floral-white)" }}>
			<nav
				className="sticky top-0 z-10"
				style={{
					background: "var(--floral-white)",
					backdropFilter: "blur(12px)",
					borderBottom: "1px solid rgba(156,82,139,0.10)",
				}}
			>
				<div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
					{/* Brand + Nav */}
					<div className="flex items-center gap-5">
						<span
							className="text-sm font-bold tracking-tight"
							style={{ color: "var(--grape-purple)" }}
						>
							AbsensiKu
						</span>
						<div className="flex gap-1">
							{navItems.map((item) => {
								const active = pathname === item.href;
								return (
									<Link
										key={item.href}
										href={item.href}
										className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
										style={{
											background: active
												? "var(--grape-purple)"
												: "transparent",
											color: active ? "#fff" : "var(--brownish-dark-grey)",
										}}
									>
										{item.icon}
										{item.label}
									</Link>
								);
							})}
						</div>
					</div>

					{/* User area */}
					<div className="flex items-center gap-2">
						<span
							className="text-xs hidden sm:block"
							style={{ color: "var(--brownish-dark-grey)" }}
						>
							{user?.name}
						</span>
						<div
							className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
							style={{ background: "var(--grape-purple)", color: "#fff" }}
						>
							{initials}
						</div>
						<button
							onClick={logout}
							className="text-xs rounded-lg px-2.5 py-1 transition-all hover:opacity-80"
							style={{
								border: "1.5px solid var(--light-grey-purple)",
								color: "var(--dark-blue-indigo)",
							}}
							type="button"
						>
							Logout
						</button>
					</div>
				</div>
			</nav>
			<main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
		</div>
	);
}
