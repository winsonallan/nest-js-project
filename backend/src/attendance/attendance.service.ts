import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private repo: Repository<Attendance>,
  ) {}

  async checkIn(
    employeeId: number,
    photoPath: string | null,
    notes?: string,
  ): Promise<Attendance> {
    const today = new Date().toLocaleDateString('en-CA', {
      timeZone: process.env.TZ ?? 'Asia/Jakarta',
    });

    const existing = await this.repo.findOne({
      where: { employeeId, date: today },
    });
    if (existing) throw new ConflictException('Already checked in today');

    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    const record = this.repo.create({
      employeeId,
      date: today,
      checkInTime,
      photoPath,
      notes: notes ?? null,
    });

    return this.repo.save(record);
  }

  async getByEmployee(employeeId: number): Promise<Attendance[]> {
    return this.repo.find({
      where: { employeeId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async getAll(date?: string): Promise<Attendance[]> {
    const query = this.repo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.employee', 'employee')
      .orderBy('attendance.createdAt', 'DESC');

    if (date) {
      query.where('attendance.date = :date', { date });
    }

    return query.getMany();
  }
}