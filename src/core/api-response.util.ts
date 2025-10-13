export class ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;

  constructor(data: T, message: string = 'Success') {
    this.success = true;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(data, message);
  }

  static error<T>(message: string): ApiResponse<T> {
    const response = new ApiResponse<T>(null as T, message);
    response.success = false;
    return response;
  }
}