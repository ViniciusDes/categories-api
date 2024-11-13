import "reflect-metadata";
import { CreateCategoryDto } from "../../../modules/dtos/create-category.dto";
import { CategoriesService } from "./categories-service";
import { UpdateCategoryDto } from "@/modules/dtos/update-category.dto";

const mockCategoriesRepository = {
  getBy: jest.fn(),
  findByNameAndParentId: jest.fn(),
  findByPosition: jest.fn(),
  findByNameAndPosition: jest.fn(),
  createCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategoriesAndChildrens: jest.fn(),
  findByParentId: jest.fn(),
  findAll: jest.fn(),
};

const makeService = () => {
  return new CategoriesService(mockCategoriesRepository as any);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CategoriesService - addCategory", () => {
  it("Must create category successfully", async () => {
    const service = makeService();

    const payload: CreateCategoryDto = {
      name: "Nova Categoria",
      is_active: "1",
    };

    mockCategoriesRepository.findByNameAndPosition.mockResolvedValue([]);

    await service.addCategory(payload);

    expect(mockCategoriesRepository.createCategory).toHaveBeenCalledWith(
      payload
    );
  });

  it("Must throw a new error if the upper category won't be finded", async () => {
    const service = makeService();

    const payload: CreateCategoryDto = {
      name: "SubCategoria",
      parent_id: 1,
      is_active: "1",
    };

    mockCategoriesRepository.getBy.mockResolvedValue([]);

    await expect(service.addCategory(payload)).rejects.toThrow(
      "Categoria nivel superior não encontrada, verifique"
    );
  });

  it("Must throw a new error if to surpass fifth level", async () => {
    const service = makeService();
    const payload: CreateCategoryDto = {
      name: "SubCategoria",
      parent_id: 1,
      is_active: "1",
    };

    mockCategoriesRepository.getBy.mockResolvedValue([{ id: 1, level: 5 }]);

    await expect(service.addCategory(payload)).rejects.toThrow(
      "Categoria só pode ter até o quinto nivel"
    );
  });

  it("Should throw error when trying to create category with same name at same level", async () => {
    const service = makeService();
    const payload: CreateCategoryDto = {
      name: "SubCategoria",
      parent_id: 1,
      is_active: "1",
    };

    mockCategoriesRepository.getBy.mockResolvedValue([{ id: 1, level: 2 }]);
    mockCategoriesRepository.findByNameAndParentId.mockResolvedValue([
      { id: 2 },
    ]);

    await expect(service.addCategory(payload)).rejects.toThrow(
      "Já existe uma categoria no mesmo nível com mesmo nome, verifique"
    );
  });

  it("Should throw a new error if parent already have 20 children", async () => {
    const service = makeService();
    const payload: CreateCategoryDto = {
      name: "SubCategoria",
      parent_id: 1,
      is_active: "1",
    };

    mockCategoriesRepository.getBy.mockResolvedValue([{ id: 1, level: 2 }]);
    mockCategoriesRepository.findByNameAndParentId.mockResolvedValue([]);
    mockCategoriesRepository.findByPosition.mockResolvedValue(
      Array(20).fill({})
    );

    await expect(service.addCategory(payload)).rejects.toThrow(
      "Categoria não pode ter mais de 20 itens, verifique"
    );
  });
});

describe("CategoriesService - getCategoriesWithHierarchy", () => {
  it("Must return categories with hierarchy format", async () => {
    const service = makeService();

    mockCategoriesRepository.findByParentId
      .mockResolvedValueOnce([{ id: 1, name: "Categoria Pai", parentId: null }])
      .mockResolvedValueOnce([{ id: 2, name: "SubCategoria", parentId: 1 }])
      .mockResolvedValueOnce([]);

    const result = await service.getCategoriesWithHierarchy();

    expect(result).toEqual([
      {
        id: 1,
        name: "Categoria Pai",
        parentId: null,
        children: [
          {
            id: 2,
            name: "SubCategoria",
            parentId: 1,
            children: [],
          },
        ],
      },
    ]);
  });
});

describe("CategoriesService - updateCategory", () => {
  it("Must update an category", async () => {
    const service = makeService();
    const payload: UpdateCategoryDto = {
      name: "Categoria Atualizada",
    } as UpdateCategoryDto;

    mockCategoriesRepository.updateCategory.mockResolvedValue(true);

    const result = await service.updateCategory(1, payload);

    expect(mockCategoriesRepository.updateCategory).toHaveBeenCalledWith(
      1,
      payload
    );
    expect(result).toBe(true);
  });
});

describe("CategoriesService - deleteCategoriesAndChildrens", () => {
  it("Must delete the category and yours sub-categories", async () => {
    const service = makeService();

    mockCategoriesRepository.deleteCategoriesAndChildrens.mockResolvedValue(
      true
    );

    const result = await service.deleteCategoriesAndChildrens(1);

    expect(
      mockCategoriesRepository.deleteCategoriesAndChildrens
    ).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });
});
