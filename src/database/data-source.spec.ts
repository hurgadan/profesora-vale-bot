jest.mock("dotenv", () => ({ config: jest.fn() }));

describe("AppDataSource", () => {
  const databaseEnv = {
    DB_HOST: "localhost",
    DB_PORT: "5432",
    DB_LOGIN: "test_login",
    DB_PASSWORD: "test_password",
    DB_NAME: "test_db",
    DB_ENABLE_LOGGING: "false",
  };

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...databaseEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("builds connection options from DB_* variables only", async () => {
    const { AppDataSource } = await import("./data-source");

    expect(AppDataSource.options).toMatchObject({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "test_login",
      password: "test_password",
      database: "test_db",
      logging: false,
      synchronize: false,
    });
  });

  it("does not require application variables unrelated to the database", async () => {
    await expect(import("./data-source")).resolves.toBeDefined();
  });
});
