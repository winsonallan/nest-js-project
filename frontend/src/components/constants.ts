export function getStatus(time: string | null): string {
	if (!time) return "Absent";
	const [h, m] = time.split(":").map(Number);
	return h < 9 || (h === 9 && m === 0) ? "On time" : "Late";
}

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export const inputStyle = {
  background: "var(--floral-white)",
  border: "1.5px solid var(--light-grey-purple)",
  color: "var(--dark-blue-indigo)",
};

export type SortDir = "asc" | "desc";