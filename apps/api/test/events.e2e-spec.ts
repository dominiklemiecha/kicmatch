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

describe("Events (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const email = `events_${Date.now()}@kicmatch.test`;
  const password = "Passw0rd123";
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { email } });

    const reg = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password, firstName: "Ev", lastName: "Tester" })
      .expect(201);
    accessToken = reg.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  it("lists empty events initially", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/events")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body).toEqual([]);
  });

  let createdId: string;

  it("creates a DRAFT event", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/v1/events")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "KIC Motorsports Day",
        description: "Una giornata in pista",
        startAt: "2026-06-15T09:00:00.000Z",
        locationType: "PHYSICAL",
        locationName: "Monza Circuit",
        locationAddress: "Monza (MB), Italia",
      })
      .expect(201);
    expect(res.body.status).toBe("DRAFT");
    expect(res.body.slug).toContain("kic-motorsports-day");
    createdId = res.body.id;
  });

  it("lists the created event", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/v1/events")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(createdId);
  });

  it("updates the event", async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/events/${createdId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ description: "Aggiornata" })
      .expect(200);
    expect(res.body.description).toBe("Aggiornata");
  });

  it("rejects access without token", async () => {
    await request(app.getHttpServer()).get("/api/v1/events").expect(401);
  });
});
