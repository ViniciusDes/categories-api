import { CategoriesRepository } from "../../modules/categories/repositories/categories.repository";
import { RepositoriesName } from "../../shared/enums/repositories-names.enum";
import { inject, injectable } from "tsyringe";

@injectable()
export class MessagesProcessor {
  constructor(
    @inject(RepositoriesName.CATEGORIES)
    private categoriesRepository: CategoriesRepository
  ) {}

  async processAddCategory(message: string) {
    const payload = JSON.parse(message);

    await this.categoriesRepository.createCategory(payload);
  }
  async processUpdateCategory(message: string) {
    const msgObj = JSON.parse(message);

    if (!msgObj?.idCategory || !msgObj?.payload) {
      throw new Error("Invalid message to update category");
    }

    await this.categoriesRepository.updateCategory(
      msgObj.idCategory,
      msgObj.payload
    );
  }

  async processDeleteCategory(message: string) {
    const msgObj = JSON.parse(message);

    if (!msgObj?.idCategory) {
      throw new Error("Invalid message to update category");
    }

    await this.categoriesRepository.deleteCategoriesAndChildrens(
      msgObj.idCategory
    );
  }
}
