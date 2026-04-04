import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "../employees/employee.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "nest_js_project",
			signOptions: { expiresIn: "1d" },
		}),
		TypeOrmModule.forFeature([Employee]),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [JwtModule],
})
export class AuthModule {}
