process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://kicmatch:kicmatch@localhost:5432/kicmatch";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "test_access_secret_min_32_chars_for_tests_xx";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test_refresh_secret_min_32_chars_for_tests_xx";
process.env.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN ?? "localhost";
process.env.COOKIE_SECURE = process.env.COOKIE_SECURE ?? "false";

import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser from "cookie-parser";
import request from "supertest";
import { PrismaService } from "../src/common/prisma/prisma.service";
import { AppModule } from "../src/app.module";

describe("Auth flow (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const uniqueEmail = `e2e_${Date.now()}@kicmatch.test`;
  const password = "Passw0rd123";

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email: uniqueEmail } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: uniqueEmail } });
    await app.close();
  });

  let accessToken: string;
  let refreshCookie: string;

  it("registers a new user", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail, password, firstName: "E2E", lastName: "Tester" })
      .expect(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(uniqueEmail);
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    refreshCookie = (Array.isArray(setCookie) ? setCookie[0] : setCookie)!.split(";")[0];
    accessToken = res.body.accessToken;
  });

  it("rejects duplicate registration", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: uniqueEmail, password, firstName: "X", lastName: "Y" })
      .expect(409);
  });

  it("logs in with correct password", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: uniqueEmail, password })
      .expect(200);
    expect(res.body.accessToken).toBeDefined();
    const setCookie = res.headers["set-cookie"];
    refreshCookie = (Array.isArray(setCookie) ? setCookie[0] : setCookie)!.split(";")[0];
    accessToken = res.body.accessToken;
  });

  it("rejects login with wrong password", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: uniqueEmail, password: "wrongpassword" })
      .expect(401);
  });

  it("returns current user from /me", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.email).toBe(uniqueEmail);
  });

  it("rejects /me without token", async () => {
    await request(app.getHttpServer()).get("/api/v1/auth/me").expect(401);
  });

  it("refreshes token", async () => {
    // Wait >1s so the new JWT has a different iat (JWT precision is 1s)
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const res = await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.accessToken).not.toBe(accessToken);
  });

  it("rejects refresh after rotation (replay)", async () => {
    await request(app.getHttpServer())
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie)
      .expect(401);
  });
});
