import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";
import { Employee } from "../employees/employee.entity";

@Entity("attendances")
export class Attendance {
	@PrimaryGeneratedColumn()
	id!: number;

	@ManyToOne(
		() => Employee,
		(employee) => employee.attendances,
	)
	@JoinColumn({ name: "employeeId" })
	employee!: Employee;

	@Column()
	employeeId!: number;

	@Column({ type: "date" })
	date!: string;

	@Column({ type: "varchar", nullable: true })
	checkInTime!: string | null;

	@Column({ type: "varchar", nullable: true })
	photoPath!: string | null;

	@Column({ type: "varchar", nullable: true })
	notes!: string | null;

	@CreateDateColumn()
	createdAt!: Date;
}
