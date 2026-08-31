import { Request, Response, NextFunction } from "express";
import { errorHandler, notFound } from "../errorHandler";

describe("errorHandler", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should return 500 for generic errors", () => {
    const err = new Error("Something went wrong");
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Something went wrong",
    });
  });

  it("should use err.statusCode when provided", () => {
    const err = { statusCode: 404, message: "Not found", stack: "stack" };
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it("should return default message when err.message is missing", () => {
    const err = { statusCode: 500, stack: "stack" };
    errorHandler(err, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Something went wrong on the server.",
    });
  });
});

describe("notFound", () => {
  it("should return 404 with route info", () => {
    const mockReq = { originalUrl: "/api/unknown" } as Partial<Request>;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    notFound(mockReq as Request, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Route not found: /api/unknown",
    });
  });
});
