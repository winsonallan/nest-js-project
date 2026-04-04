import Image from "next/image";
import type { SetStateAction } from "react";

export default function PhotoModal({
	setPhotoUrl,
	photoUrl,
}: {
	setPhotoUrl: (value: SetStateAction<string | null>) => void;
	photoUrl: string;
}) {
	return (
		<div
			className="fixed inset-0 flex items-center justify-center z-50 p-4"
			style={{ background: "var(--light-grey-purple)" }}
			onClick={() => setPhotoUrl(null)}
		>
			<div
				className="rounded-3xl p-4 max-w-sm w-full"
				style={{ background: "#fff" }}
				onClick={(e) => e.stopPropagation()}
			>
				<p
					className="text-sm font-semibold mb-3"
					style={{ color: "var(--dark-blue-indigo)" }}
				>
					Attendance proof photo
				</p>
				<Image
					src={photoUrl}
					alt="Attendance proof"
					width={0}
					height={0}
					sizes="100vw"
					className="w-full h-auto rounded-2xl"
					unoptimized
				/>

				<button
					onClick={() => setPhotoUrl(null)}
					className="mt-3 w-full text-sm font-semibold transition-opacity hover:opacity-70"
					style={{ color: "var(--brownish-dark-grey)" }}
					type="button"
				>
					Close
				</button>
			</div>
		</div>
	);
}
