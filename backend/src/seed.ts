import * as bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { Employee } from "./employees/employee.entity";

const ds = new DataSource({
	type: "mysql",
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT || "3306"),
	username: process.env.DB_USERNAME || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME ||"nestjs_absensi_db",
	entities: [Employee],
	synchronize: true,
});

async function seed() {
	await ds.initialize();
	const repo = ds.getRepository(Employee);

	const exists = await repo.findOne({ where: { email: "admin@company.com" } });
	if (!exists) {
		await repo.save(
			repo.create({
				employeeId: "ADM001",
				name: "HRD Admin",
				email: "admin@company.com",
				password: await bcrypt.hash("admin123", 10),
				role: "admin",
				department: "HRD",
				position: "HR Manager",
			}),
		);
		console.log("Admin seeded!");
	} else {
		console.log("Admin already exists");
	}
	await ds.destroy();
}

seed();
