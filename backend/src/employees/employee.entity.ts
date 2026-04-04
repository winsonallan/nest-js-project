import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Attendance } from "../attendance/attendance.entity";

@Entity("employees")
export class Employee {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	employeeId!: string;

	@Column()
	name!: string;

	@Column({ unique: true })
	email!: string;

	@Column()
	password!: string;

	@Column({ default: "employee" })
	role!: string;

	@Column({ type: "varchar", nullable: true })
	department!: string | null;

	@Column({ type: "varchar", nullable: true })
	position!: string | null;

	@Column({ default: true })
	isActive!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@OneToMany(
		() => Attendance,
		(attendance) => attendance.employee,
	)
	attendances!: Attendance[];
}
