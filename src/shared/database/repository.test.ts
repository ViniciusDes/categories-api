import testsDataSource from "../../infra/database/data-source-tests";
import { ClientDatabase } from "./repository";
class entityMock {
  name: string;
  age: number;
}
describe("Repository test suite", () => {
  let repository;

  const classRepository = ClientDatabase<entityMock>;

  it("Repository must have insert method", () => {
    repository = new classRepository(entityMock, testsDataSource);

    expect(repository).toHaveProperty("insert");
  });

  it("Repository must have save method", () => {
    repository = new classRepository(entityMock, testsDataSource);

    expect(repository).toHaveProperty("save");
  });
  it("Repository must have getAll method", () => {
    const repo = ClientDatabase<entityMock>;
    const instance = new repo(entityMock, testsDataSource);

    expect(instance).toHaveProperty("getAll");
  });

  it("Repository must have getEspecificColumns method", () => {
    const repo = ClientDatabase<entityMock>;
    const instance = new repo(entityMock, testsDataSource);

    expect(instance).toHaveProperty("getEspecificColumns");
  });

  it("Repository must have delete method", () => {
    const repo = ClientDatabase<entityMock>;
    const instance = new repo(entityMock, testsDataSource);

    expect(instance).toHaveProperty("delete");
  });
  it("Repository must have connection established", () => {
    const repo = ClientDatabase<entityMock>;
    const instance: any = new repo(entityMock, testsDataSource);

    expect(instance.connection).toBeDefined();
  });

  it("Repository must have a entity defined", () => {
    const repo = ClientDatabase<entityMock>;
    const instance: any = new repo(entityMock, testsDataSource);

    expect(instance.entity).toBeDefined();
  });
});
