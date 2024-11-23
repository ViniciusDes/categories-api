import { DataSource } from "typeorm";
import { CategoriesRepository } from "./categories.repository";
import testDataSource from "../../../infra/database/data-source-tests";
import { CreateCategoryDto } from "../../../modules/dtos/create-category.dto";
import { CategoriesEntity } from "../../../infra/database/entities";
import { UpdateCategoryDto } from "@/modules/dtos/update-category.dto";

describe("CategoriesRepository - Integration Tests", () => {
  let dataSource: DataSource;
  let repository: CategoriesRepository;

  beforeAll(async () => {
    dataSource = await testDataSource.initialize();
    repository = new CategoriesRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await dataSource.manager.clear(CategoriesEntity);
  });

  describe("createCategory", () => {
    it("Must create a new category successfully", async () => {
      const payload: CreateCategoryDto = {
        name: "Categoria Teste",
        is_active: "1",
        level: 1,
      };

      const result = await repository.createCategory(payload);

      const categories = await repository.getCategories();

      expect(categories).toHaveLength(1);
      expect(categories[0]).toMatchObject(payload);
    });
  });

  describe("updateCategory", () => {
    it("Must update an existing category", async () => {
      const payload: CreateCategoryDto = {
        name: "Categoria atualizada ",
        is_active: "1",
        level: 1,
      };

      await repository.createCategory(payload);

      const [createdCategory] = await repository.getBy({ name: payload.name });

      expect(createdCategory).toBeDefined();

      const updatePayload = {
        name: "Categoria atualizada",
        is_active: "0",
      } as UpdateCategoryDto;

      await repository.updateCategory(createdCategory.id, updatePayload);

      const [updatedCategory] = await repository.getBy({
        id: createdCategory.id,
      });

      expect(updatedCategory.name).toBe("Categoria atualizada");
      expect(updatedCategory.is_active).toBe("0");
    });
  });

  describe("deleteCategoriesAndChildrens", () => {
    it("Must delete a category and its child categories", async () => {
      const parentPayload: CreateCategoryDto = {
        name: "Categoria pai",
        is_active: "1",
        level: 1,
      };

      const childPayload: CreateCategoryDto = {
        name: "Categoria filha",
        is_active: "1",
        parent_id: 1,
        level: 2,
      };

      await repository.createCategory(parentPayload);
      const [parent] = await repository.getBy(parentPayload);
      const child = await repository.createCategory({
        ...childPayload,
        parent_id: parent.id,
      });

      await repository.deleteCategoriesAndChildrens(parent.id);

      const categories = await repository.getCategories();

      expect(categories).toHaveLength(0);
    });
  });
});
