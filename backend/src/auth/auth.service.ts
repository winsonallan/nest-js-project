import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import type { Repository } from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const employee = await this.employeeRepo.findOne({ where: { email } });

    if (!employee) throw new UnauthorizedException('Invalid credentials');

    if (!employee.isActive) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: employee.id,
      email: employee.email,
      role: employee.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    };
  }
}