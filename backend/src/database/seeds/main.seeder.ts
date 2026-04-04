import type { DataSource } from "typeorm";
import { runSeeders, type Seeder } from "typeorm-extension";
import { AttendanceSeeder } from "./attendance.seeder";
import { EmployeeSeeder } from "./employee.seeder";

export default class MainSeeder implements Seeder {
	async run(dataSource: DataSource): Promise<void> {
		await runSeeders(dataSource, {
			seeds: [EmployeeSeeder, AttendanceSeeder],
		});
	}
}
