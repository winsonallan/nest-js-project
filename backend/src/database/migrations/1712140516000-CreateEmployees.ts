import { type MigrationInterface, type QueryRunner, Table } from "typeorm";

export class CreateEmployees1712140516000 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "employees",
				columns: [
					{
						name: "id",
						type: "int",
						isPrimary: true,
						isGenerated: true,
						generationStrategy: "increment",
					},
					{
						name: "employeeId",
						type: "varchar",
						length: "20",
						isUnique: true,
					},
					{
						name: "name",
						type: "varchar",
						length: "100",
					},
					{
						name: "email",
						type: "varchar",
						length: "150",
						isUnique: true,
					},
					{
						name: "password",
						type: "varchar",
						length: "255",
					},
					{
						name: "role",
						type: "varchar",
						length: "20",
						default: "'employee'",
					},
					{
						name: "department",
						type: "varchar",
						length: "100",
						isNullable: true,
					},
					{
						name: "position",
						type: "varchar",
						length: "100",
						isNullable: true,
					},
					{
						name: "isActive",
						type: "tinyint",
						default: 1,
					},
					{
						name: "createdAt",
						type: "timestamp",
						default: "CURRENT_TIMESTAMP",
					},
				],
			}),
			true,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable("employees");
	}
}
