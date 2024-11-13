export type IsActive = "0" | "1";

export interface CreateCategoryDto {
  name: string;
  is_active: IsActive;
  parent_id?: number;
  level?: number;
}
