// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debugLog(message: string, data?: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[DEBUG] ${message}`,
      data ? JSON.stringify(data, null, 2) : "",
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debugError(message: string, error: any) {
  console.error(`[ERROR] ${message}`, error);
}
