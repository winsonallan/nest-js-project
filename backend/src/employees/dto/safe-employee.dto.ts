export class SafeEmployeeDto {
  id!: number;
  employeeId!: string;
  name!: string;
  email!: string;
  role!: string;
  department!: string | null;
  position!: string | null;
  isActive!: boolean;
  createdAt!: Date;
}