import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { SafeEmployeeDto } from './dto/safe-employee.dto';
import { Employee } from './employee.entity';

const SAFE_COLUMNS: (keyof Employee)[] = [
  'id', 'employeeId', 'name', 'email',
  'department', 'position', 'role', 'isActive', 'createdAt',
];

function toSafe(employee: Employee): SafeEmployeeDto {
  const { password: _omit, ...safe } = employee;
  return safe as SafeEmployeeDto;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private repo: Repository<Employee>,
  ) {}

  async findAll(): Promise<SafeEmployeeDto[]> {
    const employees = await this.repo.find({
      select: SAFE_COLUMNS,
      order: { createdAt: 'DESC' },
    });
    return employees.map(toSafe);
  }

  async findOne(id: number): Promise<SafeEmployeeDto> {
    const employee = await this.repo.findOne({
      where: { id },
      select: SAFE_COLUMNS,
    });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    return toSafe(employee);
  }

  async create(dto: CreateEmployeeDto): Promise<SafeEmployeeDto> {
    const existing = await this.repo.findOne({
      where: [{ email: dto.email }, { employeeId: dto.employeeId }],
    });
    if (existing) throw new ConflictException('Email or Employee ID already exists');

    const hashed = await bcrypt.hash(dto.password, 10);
    const employee = this.repo.create({ ...dto, password: hashed });
    const saved = await this.repo.save(employee);
    return toSafe(saved);
  }

  async update(id: number, dto: UpdateEmployeeDto): Promise<SafeEmployeeDto> {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);

    const updateData: Partial<Employee> = { ...dto };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    Object.assign(employee, updateData);
    const saved = await this.repo.save(employee);
    return toSafe(saved);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException(`Employee #${id} not found`);
    await this.repo.remove(employee);
  }
}