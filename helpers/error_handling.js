class StatusError extends Error{
  constructor(statusCode=500, messages, defaultMessage = 'Internal Server Error'){
    super(defaultMessage); // Error class takes a string message
    this.status = statusCode;
    if(!Array.isArray(messages)){
      messages = [messages];
    }
    this.messages = messages;
  }
}
exports.StatusError = StatusError;