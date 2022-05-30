export const navigationService = {
  matchRoutePath: (pathname: string, path: string): boolean => {
    return pathname.includes(path);
  },
};
