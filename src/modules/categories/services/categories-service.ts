import { RepositoriesName } from "../../../shared/enums/repositories-names.enum";
import { inject, injectable } from "tsyringe";
import { CategoriesRepository } from "../repositories/categories.repository";
import { CreateCategoryDto } from "../../../modules/dtos/create-category.dto";
import { UpdateCategoryDto } from "../../../modules/dtos/update-category.dto";
import { RabbitmqNames } from "../../../shared/enums/rabbitmq-name.enum";
import { ClientRabbitMq } from "../../../infra/rabbitmq/rabbitmq.config";
import { QueuesNames } from "../../../shared/enums/queues-name.enum";

@injectable()
export class CategoriesService {
  constructor(
    @inject(RepositoriesName.CATEGORIES)
    private categoriesRepository: CategoriesRepository,

    @inject(RabbitmqNames.CATEGORIES)
    private rabbitmqClient: ClientRabbitMq
  ) {}

  async saveCategory({
    payload,
    isUpdate,
    idCategory,
  }: {
    payload: CreateCategoryDto | UpdateCategoryDto;
    isUpdate: boolean;
    idCategory?: number;
  }) {
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
        if (
          !isUpdate &&
          !categoriesTheSameLevelAndName.find(
            (x) => x.id === idCategory && x.is_active === payload.is_active
          )
        ) {
          throw new Error(
            "Já existe uma categoria no mesmo nível com mesmo nome, verifique"
          );
        }
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
    if (isUpdate) {
      this.rabbitmqClient.publishToQueue(
        QueuesNames.UPDATE_CATEGORY,
        JSON.stringify({
          idCategory: idCategory,
          payload: payload,
        })
      );
    } else {
      this.rabbitmqClient.publishToQueue(
        QueuesNames.ADD_CATEGORY,
        JSON.stringify(payload)
      );
    }
  }

  async deleteCategoriesAndChildrens(id: number) {
    const [oldCategory] = await this.categoriesRepository.findById(id);

    if (!oldCategory) {
      throw new Error("Categoria não encontrada, verifique");
    }
    this.rabbitmqClient.publishToQueue(
      QueuesNames.DELETE_CATEGORY,
      JSON.stringify({
        idCategory: id,
      })
    );
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
