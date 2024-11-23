import { Entity, Column } from "typeorm";

@Entity({
  name: "categories",
})
export class CategoriesEntity {
  @Column("int4", {
    name: "id",
    generated: "identity",
    primary: true,
  })
  id: number;

  @Column("varchar", {
    name: "name",
    nullable: false,
  })
  name: string;

  @Column("varchar", {
    name: "is_active",
    nullable: false,
    length: 1,
  })
  is_active: string;

  @Column("int4", {
    name: "level",
    nullable: false,
  })
  level: number;

  @Column("int4", {
    name: "parent_id",
    nullable: true,
  })
  parent_id: number;

  @Column("date", {
    name: "created_at",
    nullable: false,
    default: new Date(),
  })
  created_at: Date;
}
