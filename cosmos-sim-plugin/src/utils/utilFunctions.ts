// Returns the MJD date of the current time
export const currentMJD = () => {
  const unixsec = Date.now() / 1000;
  //             as year    unix-mjd offset
  return unixsec / 86400 + 40587;
};

// Check equality of floating point numbers
export const numEqual = (a: number, b: number): boolean => {
  return Math.abs(a - b) < Number.EPSILON;
};
