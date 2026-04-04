"use client";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PhotoCapture from "@/components/attendance/PhotoCapture";
import api from "@/lib/api";

export default function CheckInPage() {
	const router = useRouter();
	const [photo, setPhoto] = useState<File | null>(null);
	const [notes, setNotes] = useState("");
	const [loading, setLoading] = useState(false);
	const [done, setDone] = useState(false);
	const [checkedTime, setCheckedTime] = useState("");

	const handleCheckIn = async () => {
		if (!photo) return alert("Please capture a photo first");
		setLoading(true);
		try {
			const form = new FormData();
			form.append("photo", photo);
			if (notes) form.append("notes", notes);
			await api.post("/attendance/check-in", form, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			setCheckedTime(
				new Date().toLocaleTimeString("id-ID", {
					hour: "2-digit",
					minute: "2-digit",
				}),
			);
			setDone(true);
		} catch (err: any) {
			alert(
				err.response?.data?.message ?? "Check-in failed. Please try again.",
			);
		} finally {
			setLoading(false);
		}
	};

	if (done) {
		return (
			<div className="max-w-md mx-auto">
				<div
					className="rounded-3xl p-10 text-center"
					style={{
						background: "#fff",
						border: "1.5px solid var(--light-grey-purple)",
					}}
				>
					<div
						className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
						style={{ background: "rgba(7,190,184,0.12)" }}
					>
						<CheckCircle size={32} style={{ color: "var(--sea-green)" }} />
					</div>
					<h2
						className="text-xl font-bold mb-1"
						style={{ color: "var(--dark-blue-indigo)" }}
					>
						You're checked in!
					</h2>
					<p
						className="text-xs mb-2"
						style={{ color: "var(--brownish-dark-grey)" }}
					>
						{new Date().toLocaleDateString("id-ID", {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</p>
					<p
						className="text-3xl font-bold mb-6"
						style={{ color: "var(--sea-green)" }}
					>
						{checkedTime}
					</p>
					<div
						className="rounded-xl p-3 text-xs mb-6"
						style={{
							background: "var(--floral-white, #fffaf2)",
							color: "var(--brownish-dark-grey)",
						}}
					>
						Your photo has been saved as attendance proof and is visible to HRD
						admin.
					</div>
					<button
						onClick={() => router.push("/dashboard")}
						className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90"
						style={{ background: "var(--grape-purple)", color: "#fff" }}
						type="button"
					>
						Back to dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-md mx-auto space-y-4">
			<div>
				<h2
					className="text-xl font-bold"
					style={{ color: "var(--dark-blue-indigo)" }}
				>
					Check in
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
					{" · "}
					{new Date().toLocaleTimeString("id-ID", {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>
			</div>

			<div
				className="rounded-2xl p-5"
				style={{
					background: "#fff",
					border: "1.5px solid var(--light-grey-purple)",
				}}
			>
				<h3
					className="text-xs font-semibold uppercase tracking-widest mb-3"
					style={{ color: "var(--brownish-dark-grey)" }}
				>
					Proof photo
				</h3>
				<PhotoCapture onCapture={setPhoto} />
			</div>

			<div
				className="rounded-2xl p-5"
				style={{
					background: "#fff",
					border: "1.5px solid var(--light-grey-purple)",
				}}
			>
				<h3
					className="text-xs font-semibold uppercase tracking-widest mb-2"
					style={{ color: "var(--brownish-dark-grey)" }}
				>
					Notes{" "}
					<span
						className="normal-case font-normal"
						style={{ color: "var(--light-transparent-grey)" }}
					>
						(optional)
					</span>
				</h3>
				<textarea
					value={notes}
					onChange={(e) => setNotes(e.target.value)}
					placeholder="e.g. Working from home in Bandung today..."
					rows={3}
					className="w-full rounded-xl px-3 py-2.5 text-sm resize-none outline-none transition-all"
					style={{
						background: "var(--floral-white)",
						border: "1.5px solid var(--light-grey-purple)",
						color: "var(--dark-blue-indigo)",
					}}
					onFocus={(e) => (e.target.style.borderColor = "var(--grape-purple)")}
					onBlur={(e) =>
						(e.target.style.borderColor = "var(--light-grey-purple)")
					}
				/>
			</div>

			<button
				onClick={handleCheckIn}
				disabled={!photo || loading}
				className="w-full py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100"
				style={{
					background: "var(--grape-purple)",
					color: "#fff",
					boxShadow: photo ? "0 4px 20px rgba(156,82,139,0.25)" : "none",
				}}
				type="button"
			>
				{loading ? "Submitting…" : "Check in now"}
			</button>

			{!photo && (
				<p
					className="text-xs text-center"
					style={{ color: "var(--brownish-dark-grey)" }}
				>
					Capture a photo above to enable check-in
				</p>
			)}
		</div>
	);
}
