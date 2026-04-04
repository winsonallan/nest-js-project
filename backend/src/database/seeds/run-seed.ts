import { DataSource } from "typeorm";
import { dataSourceOptions } from "../data-source";
import { AttendanceSeeder } from "./attendance.seeder";
import { EmployeeSeeder } from "./employee.seeder";

async function runSeed() {
	const ds = new DataSource({
		...dataSourceOptions,
		entities: ["src/**/*.entity.ts"],
		migrations: [],
	});

	await ds.initialize();
	console.log("\n Running seeders...\n");

	console.log("Employees:");
	await new EmployeeSeeder().run(ds);

	console.log("\nAttendance:");
	await new AttendanceSeeder().run(ds);

	await ds.destroy();
	console.log("\n Done!\n");
}

runSeed().catch((err) => {
	console.error(err);
	process.exit(1);
});
