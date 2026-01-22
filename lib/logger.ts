export const Logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, highly recommended for debugging in production too unless sensitive
    console.error(...args);
  },
  warn: (...args: any[]) => {
    // Warnings are usually fine to show
    console.warn(...args);
  },
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(...args);
    }
  }
};
