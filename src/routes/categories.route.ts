import express, { NextFunction, Request, Response } from "express";
import { container } from "tsyringe";
import { CategoriesService } from "../modules/categories/services/categories-service";

const categoryRouter = express.Router();
/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gerenciamento de categorias
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCategoryDto:
 *       type: object
 *       required:
 *         - name
 *         - is_active
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da categoria
 *         is_active:
 *           type: string
 *           description: Status se está ativa ou não a categoria
 *         parent_id:
 *           type: integer
 *           description: ID da categoria pai
 *         level:
 *           type: integer
 *           description: Nível da categoria
 *       example:
 *         name: "Eletrônicos"
 *         is_active: "1"
 *         parent_id: 1
 *         level: 1
 *
 *     UpdateCategoryDto:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/CreateCategoryDto'
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 */
categoryRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const createCategory = container.resolve(CategoriesService);

    try {
      await createCategory.saveCategory({
        isUpdate: false,
        payload: req.body,
      });

      res.status(201).json({
        message: "Categoria criada com sucesso",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryDto'
 *     responses:
 *       201:
 *         description: Categoria salva com sucesso
 */

categoryRouter.patch(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const createCategory = container.resolve(CategoriesService);

    try {
      await createCategory.saveCategory({
        isUpdate: true,
        payload: req.body,
        idCategory: +req.params.id,
      });

      res.status(201).json({
        message: "Categoria salva com sucesso",
        data: null,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retorna a lista de categorias aninhadas
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreateCategoryDto'
 */

categoryRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const categoriesService = container.resolve(CategoriesService);
    const categories = await categoriesService.getCategoriesWithHierarchy();
    try {
      res.status(200).json({
        message: "Categorias",
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Deleta uma categoria e seus filhos
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 */
categoryRouter.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const categoriesService = container.resolve(CategoriesService);
    await categoriesService.deleteCategoriesAndChildrens(+req.params.id);
    try {
      res.status(200).json({
        message: "Categoria deletada com sucesso!",
        data: [],
      });
    } catch (err) {
      next(err);
    }
  }
);

export default categoryRouter;
