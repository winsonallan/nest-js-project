import * as bcrypt from "bcrypt";
import type { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";
import { Employee } from "../../employees/employee.entity";

const employees = [
	// Admin
	{
		employeeId: "ADM001",
		name: "HRD Admin",
		email: "admin@company.com",
		password: "admin123",
		role: "admin",
		department: "HRD",
		position: "HR Manager",
	},
	// Employees
	{
		employeeId: "EMP001",
		name: "Budi Budiman",
		email: "budi@company.com",
		password: "password123",
		role: "employee",
		department: "Engineering",
		position: "Backend Developer",
	},
	{
		employeeId: "EMP002",
		name: "Sammy Sullivan",
		email: "sam@company.com",
		password: "password123",
		role: "employee",
		department: "Finance",
		position: "Accountant",
	},
	{
		employeeId: "EMP003",
		name: "John Doe",
		email: "john@company.com",
		password: "password123",
		role: "employee",
		department: "Marketing",
		position: "Digital Marketer",
		isActive: false,
	},
	{
		employeeId: "EMP004",
		name: "Rina Riska",
		email: "rina@company.com",
		password: "password123",
		role: "employee",
		department: "Engineering",
		position: "Frontend Developer",
	},
	{
		employeeId: "EMP005",
		name: "Ahmad Maulana",
		email: "ahmad@company.com",
		password: "password123",
		role: "employee",
		department: "Engineering",
		position: "Fullstack Developer",
	},
	{
		employeeId: "EMP006",
		name: "Dewi Dewa",
		email: "dewi@company.com",
		password: "password123",
		role: "employee",
		department: "Design",
		position: "UI/UX Designer",
	},
	{
		employeeId: "EMP007",
		name: "Rayleigh Rogers",
		email: "ray@company.com",
		password: "password123",
		role: "employee",
		department: "Finance",
		position: "Finance Analyst",
	},
];

export class EmployeeSeeder implements Seeder {
	async run(dataSource: DataSource): Promise<void> {
		const repo = dataSource.getRepository(Employee);

		for (const data of employees) {
			const exists = await repo.findOne({ where: { email: data.email } });
			if (!exists) {
				const hashed = await bcrypt.hash(data.password, 10);
				await repo.save(repo.create({ ...data, password: hashed }));
				console.log(`  Seeded: ${data.name} (${data.email})`);
			} else {
				console.log(`  Skipped (exists): ${data.email}`);
			}
		}
	}
}
