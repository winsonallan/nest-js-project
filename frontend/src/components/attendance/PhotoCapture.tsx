"use client";

import { Camera, Check, RotateCcw } from "lucide-react"; 
import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
	onCapture: (file: File) => void;
};

export default function PhotoCapture({ onCapture }: Props) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [streaming, setStreaming] = useState(false);
	const [preview, setPreview] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const startCamera = async () => {
		setError(null);
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user" },
			});
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				setStreaming(true);
			}
		} catch {
			setError(
				"Camera access was denied. Please allow camera permissions and try again.",
			);
		}
	};

	const capture = () => {
		if (!videoRef.current) return;

		const canvas = document.createElement("canvas");
		canvas.width = videoRef.current.videoWidth;
		canvas.height = videoRef.current.videoHeight;

		const ctx = canvas.getContext("2d");
		if (ctx) {
			ctx.drawImage(videoRef.current, 0, 0);
		}

		canvas.toBlob((blob) => {
			if (!blob) return;

			const file = new File([blob], `checkin-${Date.now()}.jpg`, {
				type: "image/jpeg",
			});

			onCapture(file);
			setPreview(canvas.toDataURL("image/jpeg"));

			const stream = videoRef.current?.srcObject as MediaStream;
			stream?.getTracks().forEach((track) => {
				track.stop();
			});

			setStreaming(false);
		}, "image/jpeg");
	};

	const retake = () => {
		setPreview(null);
		startCamera();
	};

	return (
		<div className="flex flex-col items-center gap-3">
			{/* Idle state */}
			{!streaming && !preview && (
				<div
					className="w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all hover:opacity-90"
					style={{
						background: "var(--floral-white)",
						border: "1.5px dashed rgba(156,82,139,0.30)",
					}}
					onClick={startCamera}
				>
					<div
						className="w-12 h-12 rounded-full flex items-center justify-center"
						style={{ background: "rgba(156,82,139,0.10)" }}
					>
						<Camera
							size={22}
							strokeWidth={1.8}
							style={{ color: "var(--grape-purple)" }}
						/>
					</div>
					<div className="text-center">
						<p
							className="text-sm font-semibold"
							style={{ color: "var(--dark-blue-indigo)" }}
						>
							Open camera
						</p>
						<p
							className="text-xs mt-0.5"
							style={{ color: "var(--brownish-dark-grey)" }}
						>
							Tap to take your attendance photo
						</p>
					</div>
				</div>
			)}
			{/* Error */}
			{error && (
				<div
					className="w-full rounded-xl px-4 py-3 text-xs text-center font-medium"
					style={{
						background: "rgba(244,96,54,0.08)",
						color: "var(--fire-orange)",
						border: "1px solid rgba(244,96,54,0.2)",
					}}
				>
					{error}
				</div>
			)}
			{/* Live camera feed */}
			<div className={`w-full relative ${streaming ? "block" : "hidden"}`}>
				<video
					ref={videoRef}
					autoPlay
					className="w-full rounded-2xl"
					style={{ background: "#000" }}
				>
					<track
						kind="captions"
						src="data:text/vtt,WEBVTT%0A%0A"
						srcLang="en"
						label="English captions"
					/>
				</video>
				<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
					<div
						className="w-36 h-44 rounded-full"
						style={{ border: "2px dashed rgba(255,255,255,0.35)" }}
					/>
				</div>
			</div>
			{streaming && (
				<button
					onClick={capture}
					className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
					style={{
						background: "var(--grape-purple)",
						color: "#fff",
						boxShadow: "0 4px 16px rgba(156,82,139,0.30)",
					}}
					type="button"
				>
					<Camera size={16} strokeWidth={2} />
					Capture photo
				</button>
			)}
			{/* Preview */}
			{preview && (
				<div className="w-full flex flex-col items-center gap-3">
					<div className="relative w-full overflow-hidden rounded-2xl">
						<Image
							src={preview}
							alt="Captured photo"
							width={800}
							height={600}
							className="w-full h-auto object-cover"
							unoptimized
						/>

						{/* Confirmed checkmark badge */}
						<div
							className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
							style={{
								background: "var(--sea-green)",
								boxShadow: "0 2px 8px rgba(7,190,184,0.4)",
							}}
						>
							<Check size={14} strokeWidth={2.5} color="white" />
						</div>
					</div>

					<button
						onClick={retake}
						className="flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 transition-opacity hover:opacity-70 cursor-pointer"
						style={{ color: "var(--dark-blue-indigo)" }}
						type="button"
					>
						<RotateCcw size={12} strokeWidth={2.5} />
						Retake photo
					</button>
				</div>
			)}
		</div>
	);
}
