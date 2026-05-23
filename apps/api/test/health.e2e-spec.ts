process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://kicmatch:kicmatch@localhost:5434/kicmatch";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6381";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("GET /api/v1/health", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns status ok with db connected", async () => {
    const res = await request(app.getHttpServer()).get("/api/v1/health").expect(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.db).toBe("ok");
  });
});
