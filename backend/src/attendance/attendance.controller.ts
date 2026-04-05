import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private service: AttendanceService) {}

  @Post('check-in')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `checkin-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (!file.mimetype.startsWith('image/') || !ALLOWED_EXTENSIONS.includes(ext)) {
          return cb(new Error('Only image files (.jpg, .jpeg, .png, .webp) are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  checkIn(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateAttendanceDto,
  ) {
    const photoPath = file?.path?.replace(/\\/g, '/') ?? null;
    return this.service.checkIn(req.user.id, photoPath, dto.notes);
  }

  @Get('my-history')
  getMyHistory(@Request() req) {
    return this.service.getByEmployee(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getAll(@Query('date') date?: string) {
    return this.service.getAll(date);
  }

  @Get('employee/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getByEmployeeId(@Param('id', ParseIntPipe) id: number) {
    return this.service.getByEmployee(id);
  }
}