import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from "class-validator";

export class CreateEmployeeDto {
	@IsNotEmpty()
	@IsString()
	employeeId!: string;

	@IsNotEmpty()
	@IsString()
	name!: string;

	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@MinLength(6)
	password!: string;

	@IsOptional()
	@IsString()
	department?: string;

	@IsOptional()
	@IsString()
	position?: string;

	@IsOptional()
	@IsString()
	role?: string;
}
