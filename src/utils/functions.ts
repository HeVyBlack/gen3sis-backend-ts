export const objectKeys = <Obj>(obj: Object): (keyof Obj)[] => {
  return Object.keys(obj) as (keyof Obj)[];
};
