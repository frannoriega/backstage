enum Reason {
  UNKNOWN,
  UNIQUE_CONSTRAINT_VIOLATION,
}

class DbError extends Error {
  reason: Reason;
  message: string;
  cause?: any;

  constructor(reason: Reason, message: string, cause?: any) {
    super();
    this.reason = reason;
    this.message = message;
    this.cause = cause;
  }
}

export { DbError, Reason as DbErrorReason };
