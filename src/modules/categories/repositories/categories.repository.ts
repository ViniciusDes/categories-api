import {
  CreateCategoryDto,
  IsActive,
} from "../../../modules/dtos/create-category.dto";
import { CategoriesEntity } from "../../../infra/database/entities";
import { ClientDatabase } from "../../../shared/database/repository";
import "reflect-metadata";
import { inject, injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { UpdateCategoryDto } from "../../../modules/dtos/update-category.dto";

@injectable()
export class CategoriesRepository extends ClientDatabase<CategoriesEntity> {
  constructor(
    @inject("dataSource")
    private datasource: DataSource
  ) {
    super(CategoriesEntity, datasource);
  }

  createCategory(category: CreateCategoryDto) {
    if (!category.is_active) {
      category.is_active = "1";
    }

    if (!category?.level) {
      category.level = 1;
    }

    return this.insert(category);
  }

  async updateCategory(idCategory: number, payload: UpdateCategoryDto) {
    const [oldCategory] = await this.getBy({
      id: idCategory,
    });

    if (!oldCategory) {
      throw new Error("Categoria não encontrada, verifique");
    }

    if (oldCategory.is_active !== payload?.is_active) {
      await this.update(
        {
          parent_id: idCategory,
        },
        {
          is_active: payload.is_active,
        }
      );
    }
    await this.save({ ...oldCategory, ...payload });
  }

  findByNameAndParentId(filterData: {
    name: string;
    parentId: number;
    isActive?: IsActive;
  }) {
    return this.getBy({
      name: filterData.name,
      parent_id: filterData.parentId,
    });
  }

  findByNameAndPosition(filterData: { name: string; level: number }) {
    return this.getBy({
      name: filterData.name,
      level: filterData.level,
    });
  }

  findByPosition(filterData: { level: number }) {
    return this.getBy({
      level: filterData.level,
    });
  }

  findByParentId(parentId?: number | null) {
    return this.getBy(
      {
        parent_id: parentId || undefined,
      },
      {
        orderBy: {
          id: "ASC",
        },
      }
    );
  }

  findById(id: number) {
    return this.getBy({
      id,
    });
  }

  async deleteCategoriesAndChildrens(id: number) {
    const [oldCategory] = await this.getBy({
      id: id,
    });

    if (!oldCategory) {
      throw new Error("Categoria não encontrada, verifique");
    }

    await this.delete({
      parent_id: id,
    });

    await this.delete({
      id: id,
    });
  }

  getCategories() {
    return this.getAll();
  }
}
