import jwt from "jsonwebtoken";
import { generateToken } from "../generateToken";

describe("generateToken", () => {
  const originalSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key-for-unit-tests";
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret;
  });

  it("should generate a valid JWT token", () => {
    const userId = "507f1f77bcf86cd799439011";
    const token = generateToken(userId);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
  });

  it("should contain the correct userId in payload", () => {
    const userId = "507f1f77bcf86cd799439011";
    const token = generateToken(userId);
    const decoded = jwt.verify(token, "test-secret-key-for-unit-tests") as { userId: string };

    expect(decoded.userId).toBe(userId);
  });

  it("should have 7d expiration", () => {
    const userId = "507f1f77bcf86cd799439011";
    const token = generateToken(userId);
    const decoded = jwt.decode(token) as { exp: number; iat: number };

    const diff = decoded.exp - decoded.iat;
    expect(diff).toBe(7 * 24 * 60 * 60); // 7 days in seconds
  });

  it("should generate different tokens for different users", () => {
    const token1 = generateToken("user1");
    const token2 = generateToken("user2");

    expect(token1).not.toBe(token2);
  });
});
