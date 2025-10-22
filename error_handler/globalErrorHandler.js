import errorLogger from "./errorLogger.js";

const globalErrorHandler = (err, req, res, next) => {
  // console.log(err);
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "something went wrong";

  errorLogger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

export default globalErrorHandler;
