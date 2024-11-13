import "reflect-metadata";
import { container } from "tsyringe";
import { DataSource } from "typeorm";
import dataSource from "../../infra/database/data-source";
import { RepositoriesName } from "../enums/repositories-names.enum";
import { CategoriesRepository } from "../../modules/categories/repositories/categories.repository";
import { DataSourceName } from "../enums/data-source-name.enum";

container.registerSingleton(RepositoriesName.CATEGORIES, CategoriesRepository);

container.register<DataSource>(DataSourceName.DATA_SOURCE, {
  useValue: dataSource,
});
