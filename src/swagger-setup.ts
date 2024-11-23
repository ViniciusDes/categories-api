import { Application } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "API para gerenciamento de categorias",
      version: "0.1.0",
      description: "This is service to handle with categories",
    },
    servers: [
      {
        url: `${process.env.URL_APP}:3334`,
      },
    ],
  },
  apis: [`${__dirname}/routes/*.ts`],
};

const specs = swaggerJsdoc(options);

export default function makeSetupSwagger(app: Application) {
  return app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}
