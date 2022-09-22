export const sleep = (ms: number): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
};
