import { RepositoriesName } from "../../../shared/enums/repositories-names.enum";
import { inject, injectable } from "tsyringe";
import { CategoriesRepository } from "../repositories/categories.repository";
import { CreateCategoryDto } from "../../../modules/dtos/create-category.dto";
import { UpdateCategoryDto } from "../../../modules/dtos/update-category.dto";

@injectable()
export class CategoriesService {
  constructor(
    @inject(RepositoriesName.CATEGORIES)
    private categoriesRepository: CategoriesRepository
  ) {}

  async addCategory(payload: CreateCategoryDto) {
    if (payload.parent_id) {
      const [parentCategory] = await this.categoriesRepository.getBy({
        id: payload.parent_id,
      });

      if (!parentCategory) {
        throw new Error("Categoria nivel superior não encontrada, verifique");
      }

      payload.level = parentCategory.level + 1;

      if (payload.level > 5) {
        throw new Error(`Categoria só pode ter até o quinto nivel`);
      }

      const categoriesTheSameLevelAndName =
        await this.categoriesRepository.findByNameAndParentId({
          name: payload.name,
          parentId: payload.parent_id,
        });

      if (categoriesTheSameLevelAndName.length) {
        throw new Error(
          "Já existe uma categoria no mesmo nível com mesmo nome, verifique"
        );
      }

      const categoriesInTheSameLevel =
        await this.categoriesRepository.findByPosition({
          level: payload.level,
        });

      if (categoriesInTheSameLevel.length === 20) {
        throw new Error("Categoria não pode ter mais de 20 itens, verifique");
      }
    } else {
      const [categoryTheSameLevelAndName] =
        await this.categoriesRepository.findByNameAndPosition({
          name: payload.name,
          level: payload?.level ?? 1,
        });

      if (categoryTheSameLevelAndName) {
        throw new Error(
          "Já existe uma categoria no mesmo nível com mesmo nome, verifique"
        );
      }
    }

    return this.categoriesRepository.createCategory(payload);
  }

  async updateCategory(idCategory: number, payload: UpdateCategoryDto) {
    return this.categoriesRepository.updateCategory(idCategory, payload);
  }

  async deleteCategoriesAndChildrens(id: number) {
    return this.categoriesRepository.deleteCategoriesAndChildrens(id);
  }

  async getCategoriesWithHierarchy(): Promise<any> {
    const allCategories = await this.categoriesRepository.getAll();
    const categoriesMap = new Map<number, any>();

    allCategories.forEach((category) => {
      categoriesMap.set(category.id, { ...category, children: [] });
    });

    const rootCategories: any[] = [];

    allCategories.forEach((category) => {
      const categoryInMap = categoriesMap.get(category.id);
      if (category.parent_id) {
        const parentCategory = categoriesMap.get(category.parent_id);
        if (parentCategory) {
          parentCategory.children.push(categoryInMap);
        }
      } else {
        rootCategories.push(categoryInMap);
      }
    });

    return rootCategories;
  }
}
