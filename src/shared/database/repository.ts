import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import {
  ClientDataBase,
  OrderByInterface,
  PayloadToCreate,
  WhereFindByInterface,
} from "./client-database";

export class ClientDatabase<Entity extends ObjectLiteral>
  implements ClientDataBase<Entity>
{
  private entity: EntityTarget<Entity>;

  constructor(
    entity: EntityTarget<Entity>,

    private connection: DataSource
  ) {
    this.entity = entity;
  }

  public async insert(payload: PayloadToCreate<Entity>): Promise<void> {
    const instance = this.connection.getRepository(this.entity).create(payload);
    await this.connection.getRepository(this.entity).insert(instance);
  }

  public save(payload: PayloadToCreate<Entity>): Promise<Entity> {
    const instance = this.connection.getRepository(this.entity).create(payload);
    return this.connection.getRepository(this.entity).save(instance);
  }

  public async update(
    conditions: WhereFindByInterface<Entity>,
    payload: PayloadToCreate<Entity>
  ): Promise<void> {
    this.connection.getRepository(this.entity).update(conditions, payload);
  }

  public getBy(
    conditions: WhereFindByInterface<Entity>,
    orderParams?: { orderBy: OrderByInterface<Entity> }
  ): Promise<Entity[]> {
    return this.connection.getRepository(this.entity).find({
      where: conditions,
      order: orderParams?.orderBy ?? (undefined as any),
    });
  }

  public getAll(): Promise<Entity[]> {
    return this.connection.getRepository(this.entity).find();
  }

  public delete(conditions: WhereFindByInterface<Entity>): Promise<any> {
    return this.connection.getRepository(this.entity).delete(conditions);
  }

  public getEspecificColumns(columns: Array<string>): Promise<Entity[]> {
    return this.connection
      .getRepository(this.entity)
      .createQueryBuilder("entity")
      .select([...columns])
      .getRawMany();
  }
}
