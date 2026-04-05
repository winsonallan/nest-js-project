"use client";
import { Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STATUS_STYLE } from "@/components/StatusStyles";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { getStatus } from "@/components/constants";

export default function DashboardPage() {
	const user = getUser();
	const [stats, setStats] = useState({ present: 0, late: 0 });
	const [recent, setRecent] = useState<any[]>([]);
	const [week, setWeek] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api
			.get("/attendance/my-history")
			.then(({ data }) => {
				setRecent(data.slice(0, 5));
				const thisMonth = new Date().getMonth();
				const monthly = data.filter(
					(a: any) => new Date(a.date).getMonth() === thisMonth,
				);
				const late = monthly.filter(
					(a: any) => getStatus(a.checkInTime) === "Late",
				).length;
				setStats({ present: monthly.length, late });
				setWeek(data.slice(0, 5).reverse());
			})
			.finally(() => setLoading(false));
	}, []);

	const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

	if (loading)
		return (
			<div className="flex items-center justify-center py-20">
				<div
					className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
					style={{
						borderColor: "var(--grape-purple)",
						borderTopColor: "transparent",
					}}
				/>
			</div>
		);

	return (
		<div className="space-y-4">
			{/* Header */}
			<div>
				<h2
					className="text-xl font-bold"
					style={{ color: "var(--dark-blue-indigo)" }}
				>
					Good day, {user?.name?.split(" ")[0]} 👋
				</h2>
				<p
					className="text-xs mt-0.5"
					style={{ color: "var(--brownish-dark-grey)" }}
				>
					{new Date().toLocaleDateString("id-ID", {
						weekday: "long",
						day: "numeric",
						month: "long",
						year: "numeric",
					})}
				</p>
			</div>

			{/* Metrics */}
			<div className="grid grid-cols-3 gap-3">
				{[
					{
						label: "Days present",
						value: stats.present,
						accent: "var(--sea-green)",
					},
					{
						label: "Days late",
						value: stats.late,
						accent: "var(--fire-orange)",
					},
					{
						label: "This month",
						value: new Date().toLocaleString("default", { month: "short" }),
						accent: "var(--grape-purple)",
					},
				].map((m) => (
					<div
						key={m.label}
						className="rounded-2xl p-4"
						style={{
							background: "#fff",
							border: "1.5px solid var(--light-grey-purple)",
						}}
					>
						<div className="text-2xl font-bold" style={{ color: m.accent }}>
							{m.value}
						</div>
						<div
							className="text-xs mt-0.5"
							style={{ color: "var(--brownish-dark-grey)" }}
						>
							{m.label}
						</div>
					</div>
				))}
			</div>

			{/* Week strip */}
			<div
				className="rounded-2xl p-4"
				style={{
					background: "#fff",
					border: "1.5px solid var(--light-grey-purple)",
				}}
			>
				<h3
					className="text-sm font-semibold mb-3"
					style={{ color: "var(--dark-blue-indigo)" }}
				>
					This week
				</h3>
				<div className="grid grid-cols-5 gap-2">
					{days.map((day, i) => {
						const entry = week[i];
						const today = i === new Date().getDay() - 1;
						const status = entry ? getStatus(entry.checkInTime) : null;
						const style = status
							? STATUS_STYLE[status]
							: {
									bg: "var(--lighter-transparent-grey)",
									color: "var(--brownish-dark-grey)",
								};
						return (
							<div
								key={day}
								className="rounded-xl p-2 text-center"
								style={{
									background: style.bg,
									outline: today ? `2px solid var(--grape-purple)` : "none",
									outlineOffset: "2px",
								}}
							>
								<div
									className="text-xs font-semibold"
									style={{ color: "var(--dark-blue-indigo)" }}
								>
									{day}
								</div>
								<div className="text-xs mt-1" style={{ color: style.color }}>
									{entry ? entry.checkInTime?.slice(0, 5) : "—"}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Recent activity */}
			<div
				className="rounded-2xl p-4"
				style={{
					background: "#fff",
					border: "1.5px solid var(--light-grey-purple)",
				}}
			>
				<div className="flex justify-between items-center mb-3">
					<h3
						className="text-sm font-semibold"
						style={{ color: "var(--dark-blue-indigo)" }}
					>
						Recent activity
					</h3>
					<Link
						href="/history"
						className="text-xs font-semibold transition-opacity hover:opacity-70"
						style={{ color: "var(--grape-purple)" }}
					>
						View all →
					</Link>
				</div>
				{recent.length === 0 ? (
					<p className="text-sm" style={{ color: "var(--brownish-dark-grey)" }}>
						No attendance recorded yet.
					</p>
				) : (
					<div>
						{recent.map((item: any) => {
							const status = getStatus(item.checkInTime);
							const s = STATUS_STYLE[status];
							return (
								<div
									key={item.id}
									className="flex justify-between items-center py-2.5"
									style={{ borderBottom: "1px solid var(--light-grey-purple)" }}
								>
									<div>
										<p
											className="text-sm font-semibold"
											style={{ color: "var(--dark-blue-indigo)" }}
										>
											{item.checkInTime?.slice(0, 5) ?? "—"}
										</p>
										<p
											className="text-xs"
											style={{ color: "var(--brownish-dark-grey)" }}
										>
											{new Date(item.date).toLocaleDateString("id-ID", {
												weekday: "short",
												day: "numeric",
												month: "short",
											})}
										</p>
									</div>
									<span
										className="text-xs px-2.5 py-1 rounded-full font-semibold"
										style={{ background: s.bg, color: s.color }}
									>
										{status}
									</span>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* CTA */}
			<Link
				href="/checkin"
				className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
				style={{
					background: "var(--grape-purple)",
					color: "#fff",
					boxShadow: "0 4px 20px var(--lighter-grey-purple)",
				}}
			>
				<Clock size={15} />
				Check in for today
			</Link>
		</div>
	);
}
