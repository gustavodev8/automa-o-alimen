export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = 'BAD_REQUEST',
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
