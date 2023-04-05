export const objectKeys = <Obj>(obj: Object): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
};

export const isObject = (i: unknown) => {
  if (typeof i === "object" && !Array.isArray(i)) {
    return true;
  }
  return false;
};

export const isArray = (i: unknown) => {
  if (Array.isArray(i)) {
    return true;
  }
  return false;
};
