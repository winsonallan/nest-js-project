import { config } from "dotenv";
import { DataSource, type DataSourceOptions } from "typeorm";

config(); // load env

export const dataSourceOptions: DataSourceOptions = {
	type: "mysql",
	host: process.env.DB_HOST || "localhost",
	port: Number(process.env.DB_PORT) || 3306,
	username: process.env.DB_USERNAME || "root",
	password: process.env.DB_PASSWORD || "",
	database: process.env.DB_NAME || "absensi_db",

	entities: ["dist/**/*.entity.js"],
	migrations: ["dist/database/migrations/*.js"],

	synchronize: false, 
	migrationsRun: false, 
	logging: true,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
