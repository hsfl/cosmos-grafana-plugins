// Returns the MJD date of the current time
// offset is offset in mjd, positive for forwards from current time, negative for backwards from current time
export const currentMJD = (offset: number) => {
  const unixsec = Date.now() / 1000;
  //             as year              unix-mjd offset
  return unixsec / 86400 + offset + 40587;
};

// Check equality of floating point numbers
export const numEqual = (a: number, b: number): boolean => {
  return Math.abs(a - b) < Number.EPSILON;
};
