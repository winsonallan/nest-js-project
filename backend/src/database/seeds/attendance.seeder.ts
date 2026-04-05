import type { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";
import { Attendance } from "../../attendance/attendance.entity";
import { Employee } from "../../employees/employee.entity";

function randomCheckIn(): string | null {
	const roll = Math.random();
	if (roll < 0.1) return null; // absent

	let hour: number, minute: number;
	if (roll < 0.8) {
		// On time: 08:00 – 09:00
		hour = 8;
		minute = Math.floor(Math.random() * 60);
	} else {
		// Late: 09:01 – 10:30
		hour = 9 + Math.floor(Math.random() * 2);
		minute =
			hour === 9
				? 1 + Math.floor(Math.random() * 59)
				: Math.floor(Math.random() * 31);
	}

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

function getWorkingDays(count: number): string[] {
	const days: string[] = [];
	const cursor = new Date();
	cursor.setDate(cursor.getDate() - 1); 

	while (days.length < count) {
		const dow = cursor.getDay();
		if (dow !== 0 && dow !== 6) {
			const y = cursor.getFullYear();
			const m = String(cursor.getMonth() + 1).padStart(2, "0");
			const d = String(cursor.getDate()).padStart(2, "0");
			
			days.push(`${y}-${m}-${d}`);
		}
		cursor.setDate(cursor.getDate() - 1);
	}
	return days;
}

export class AttendanceSeeder implements Seeder {
	async run(dataSource: DataSource): Promise<void> {
		const employeeRepo = dataSource.getRepository(Employee);
		const attendanceRepo = dataSource.getRepository(Attendance);

		const activeEmployees = await employeeRepo.find({
			where: { isActive: true },
		});
		const workingDays = getWorkingDays(14); 

		let created = 0;

		for (const employee of activeEmployees) {
			for (const date of workingDays) {
				try {
					const exists = await attendanceRepo.findOne({
						where: { employeeId: employee.id, date },
					});
					if (exists) continue;
	
					const checkInTime = randomCheckIn();
					if (!checkInTime) continue;
	
					await attendanceRepo.save(
						attendanceRepo.create({
							employeeId: employee.id,
							date,
							checkInTime,
							photoPath: null,
							notes: null,
						}),
					);
					created++;
				} catch (error) {
					console.error(`  Failed for employee ${employee.id} on ${date}:`, error);
				}
			}
		}

		console.log(`  Seeded ${created} attendance records`);
	}
}
