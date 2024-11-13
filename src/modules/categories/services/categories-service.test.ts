import "reflect-metadata";
import { CreateCategoryDto } from "../../../modules/dtos/create-category.dto";
import { CategoriesService } from "./categories-service";
import { UpdateCategoryDto } from "../../../modules/dtos/update-category.dto";
import { QueuesNames } from "../../../shared/enums/queues-name.enum";
import { ClientRabbitMq } from "@/infra/rabbitmq/rabbitmq.config";

const mockCategoriesRepository = {
  getBy: jest.fn(),
  getAll: jest.fn(),
  findByNameAndParentId: jest.fn(),
  findByPosition: jest.fn(),
  findByNameAndPosition: jest.fn(),
  saveCategory: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategoriesAndChildrens: jest.fn(),
  findByParentId: jest.fn(),
  findAll: jest.fn(),
};

const mockConnect = jest.fn();
const mockCreateQueue = jest.fn();
const mockPublishToQueue = jest.fn();
const mockConsumeFromQueue = jest.fn();
const mockClose = jest.fn();

class ClientRabbitMqMock {
  connection = null;
  channel = null;
  connect = mockConnect;
  createQueue = mockCreateQueue;
  publishToQueue = mockPublishToQueue;
  consumeFromQueue = mockConsumeFromQueue;
  close = mockClose;
}

const mockRabbitMq = new ClientRabbitMqMock();

const makeService = () => {
  return new CategoriesService(
    mockCategoriesRepository as any,
    mockRabbitMq as unknown as ClientRabbitMq
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CategoriesService - saveCategory", () => {
  it("Must create category successfully", async () => {
    const service = makeService();

    const payload: CreateCategoryDto = {
      name: "Nova Categoria",
      is_active: "1",
    };

    mockCategoriesRepository.findByNameAndPosition.mockResolvedValue([]);

    await service.saveCategory({
      isUpdate: false,
      payload: payload,
    });

    expect(mockPublishToQueue).toHaveBeenCalledWith(
      QueuesNames.ADD_CATEGORY,
      JSON.stringify(payload)
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

    await expect(
      service.saveCategory({
        isUpdate: false,
        payload: payload,
      })
    ).rejects.toThrow("Categoria nivel superior não encontrada, verifique");
  });

  it("Must throw a new error if to surpass fifth level", async () => {
    const service = makeService();
    const payload: CreateCategoryDto = {
      name: "SubCategoria",
      parent_id: 1,
      is_active: "1",
    };

    mockCategoriesRepository.getBy.mockResolvedValue([{ id: 1, level: 5 }]);

    await expect(
      service.saveCategory({
        isUpdate: false,
        payload: payload,
      })
    ).rejects.toThrow("Categoria só pode ter até o quinto nivel");
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

    await expect(
      service.saveCategory({
        isUpdate: false,
        payload: payload,
      })
    ).rejects.toThrow(
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

    await expect(
      service.saveCategory({
        isUpdate: false,
        payload: payload,
      })
    ).rejects.toThrow("Categoria não pode ter mais de 20 itens, verifique");
  });
});

describe("CategoriesService - getCategoriesWithHierarchy", () => {
  it("Must return categories in a hierarchical format", async () => {
    const service = makeService();

    mockCategoriesRepository.getAll.mockResolvedValue([
      { id: 1, name: "Categoria pai", parent_id: null },
      { id: 2, name: "Categoria filha", parent_id: 1 },
    ]);

    const result = await service.getCategoriesWithHierarchy();

    expect(result).toEqual([
      {
        id: 1,
        name: "Categoria pai",
        parent_id: null,
        children: [
          {
            id: 2,
            name: "Categoria filha",
            parent_id: 1,
            children: [],
          },
        ],
      },
    ]);
  });
});

describe("CategoriesService - updateCategory", () => {
  it("Must publish a message to RabbitM, when update category", async () => {
    const service = makeService();
    const payload: UpdateCategoryDto = {
      name: "Updated Category",
      is_active: "0",
    };

    await service.saveCategory({
      isUpdate: true,
      payload,
      idCategory: 1,
    });

    expect(mockPublishToQueue).toHaveBeenCalledWith(
      QueuesNames.UPDATE_CATEGORY,
      JSON.stringify({ idCategory: 1, payload })
    );
  });
});

describe("CategoriesService - deleteCategoriesAndChildrens", () => {
  it("Must successfully publish message to RabbitMQ, when delete category", async () => {
    const service = makeService();

    await service.deleteCategoriesAndChildrens(1);

    expect(mockPublishToQueue).toHaveBeenCalledWith(
      QueuesNames.DELETE_CATEGORY,
      JSON.stringify({ idCategory: 1 })
    );
  });
});
