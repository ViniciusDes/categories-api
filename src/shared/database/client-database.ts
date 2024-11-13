export type OrderByInterface<Type> = {
  [P in keyof Type]?: "ASC" | "DESC";
};
export type WhereFindByInterface<Type> = {
  [P in keyof Type]?: Type[P];
};

export type AtLeastOne<T> = {
  [K in keyof T]-?: Pick<T, K> & Partial<T>;
}[keyof T];

export type PayloadToCreate<EntityType> = AtLeastOne<EntityType>;

export abstract class ClientDataBase<T> {
  abstract insert(arg: T): Promise<void>;

  abstract save(arg: T): Promise<T>;

  abstract getBy(arg: WhereFindByInterface<T>): Promise<T[]>;

  abstract getBy(arg: WhereFindByInterface<T>): Promise<T[]>;

  abstract update(conditions: WhereFindByInterface<T>, arg: T): Promise<void>;

  abstract getAll(): Promise<T[]>;

  abstract delete(arg: WhereFindByInterface<T>): Promise<any>;

  abstract getEspecificColumns(arg: Array<string>): Promise<T[]>;
}
