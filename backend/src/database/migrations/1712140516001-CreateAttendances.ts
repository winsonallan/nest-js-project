import {
	type MigrationInterface,
	type QueryRunner,
	Table,
	TableForeignKey,
} from "typeorm";

export class CreateAttendances1712140516001 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: "attendances",
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
						type: "int",
					},
					{
						name: "date",
						type: "date",
					},
					{
						name: "checkInTime",
						type: "time",
						isNullable: true,
					},
					{
						name: "photoPath",
						type: "varchar",
						length: "255",
						isNullable: true,
					},
					{
						name: "notes",
						type: "varchar",
						length: "500",
						isNullable: true,
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

		// Foreign key: attendance → employee
		await queryRunner.createForeignKey(
			"attendances",
			new TableForeignKey({
				columnNames: ["employeeId"],
				referencedTableName: "employees",
				referencedColumnNames: ["id"],
				onDelete: "CASCADE",
			}),
		);

		await queryRunner.query(
			`ALTER TABLE attendances ADD UNIQUE unique_checkin_per_day (employeeId, date)`,
		);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		const table = await queryRunner.getTable("attendances");
		const fk = table!.foreignKeys.find((fk) =>
			fk.columnNames.includes("employeeId"),
		);
		if (fk) await queryRunner.dropForeignKey("attendances", fk);
		await queryRunner.dropTable("attendances");
	}
}
