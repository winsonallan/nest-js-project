"use client";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser, logout } from "@/lib/auth";

const navItems = [
	{
		label: "Employees",
		href: "/admin/employees",
		icon: <Users size={15} />,
	},
	{
		label: "Attendance",
		href: "/admin/attendance",
		icon: <Calendar size={15} />,
	},
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const user = getUser();

	return (
		<div
			className="min-h-screen flex flex-col"
			style={{ background: "var(--floral-white, #fffaf2)" }}
		>
			{/* Top nav */}
			<nav
				className="sticky top-0 z-10"
				style={{
					background: "rgba(255,250,242,0.85)",
					backdropFilter: "blur(12px)",
					borderBottom: "1px solid rgba(156,82,139,0.10)",
				}}
			>
				<div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
					<div className="flex items-center gap-2.5">
						<span
							className="text-sm font-bold tracking-tight"
							style={{ color: "var(--grape-purple, #9c528b)" }}
						>
							AbsensiKu
						</span>
						<span
							className="text-xs px-2 py-0.5 rounded-full font-semibold"
							style={{
								background: "var(--light-grey-purple)",
								color: "var(--dark-blue-indigo, #2e294e)",
							}}
						>
							Admin
						</span>
					</div>
					<div className="flex items-center gap-2">
						<span
							className="text-xs hidden sm:block"
							style={{ color: "var(--brownish-dark-grey)" }}
						>
							{user?.name}
						</span>
						<div
							className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
							style={{
								background: "var(--dark-blue-indigo, #2e294e)",
								color: "#fff",
							}}
						>
							HR
						</div>
						<button
							onClick={logout}
							className="text-xs rounded-lg px-2.5 py-1 transition-all hover:opacity-80"
							style={{
								border: "1.5px solid var(--light-grey-purple)",
								color: "var(--dark-blue-indigo, #2e294e)",
							}}
							type="button"
						>
							Logout
						</button>
					</div>
				</div>
			</nav>

			<div className="flex flex-1 max-w-6xl mx-auto w-full">
				{/* Sidebar */}
				<aside
					className="w-48 shrink-0 pt-6"
					style={{
						background: "#fff",
						borderRight: "1px solid var(--light-grey-purple)",
					}}
				>
					<p
						className="px-5 mb-2 text-xs font-semibold uppercase tracking-widest"
						style={{ color: "var(--light-transparent-grey)" }}
					>
						Menu
					</p>
					<nav className="space-y-0.5 px-2">
						{navItems.map((item) => {
							const active = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
									style={{
										background: active
											? "var(--grape-purple, #9c528b)"
											: "transparent",
										color: active ? "#fff" : "var(--brownish-dark-grey)",
									}}
								>
									{item.icon}
									{item.label}
								</Link>
							);
						})}
					</nav>
				</aside>

				{/* Main */}
				<main
					className="flex-1 p-6"
					style={{ background: "var(--floral-white, #fffaf2)" }}
				>
					{children}
				</main>
			</div>
		</div>
	);
}
