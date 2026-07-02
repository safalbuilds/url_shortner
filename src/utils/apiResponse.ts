export const successResponse = (message: string, data: unknown, shortUrl?:unknown) => {
  return {
    success: true,
    message,
    shortUrl,
    data,
  };
};

export const errorResponse = (message: string) => {
  return {
    success: false,
    message,
  };
};
