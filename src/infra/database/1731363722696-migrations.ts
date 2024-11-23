import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class Migrations1731363722696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "categories",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          { name: "name", type: "varchar(250)" },
          {
            name: "is_active",
            type: "varchar(1)",
            default: "1",
            isNullable: false,
          },
          {
            name: "level",
            isNullable: false,
            type: "int",
          },
          {
            name: "parent_id",
            isNullable: true,
            type: "int",
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("categories");
  }
}
