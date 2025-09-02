class AppResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.status = `${this.statusCode}`.startsWith("2") ? true : false;
    this.data = data;
  }

  send(res) {
    res.status(this.statusCode).json({
      status: this.status,
      message: this.message,
      data: this.data,
    });
  }
}

export default AppResponse;
