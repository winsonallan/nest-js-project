import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AttendanceModule } from "./attendance/attendance.module.";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { EmployeesModule } from "./employees/employees.module";

@Module({
	imports: [
		DatabaseModule,
		AuthModule,
		EmployeesModule,
		AttendanceModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, "..", "uploads"),
			serveRoot: "/uploads",
		}),
		ConfigModule.forRoot({ isGlobal: true }),
	],
})
export class AppModule {}
