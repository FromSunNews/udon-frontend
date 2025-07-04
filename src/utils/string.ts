export const ensureBuffer = (input: Buffer | string): Buffer => {
  if (typeof input === 'string') {
    return Buffer.from(input, 'hex');
  }
  return input;
};

export const ensureString = (input: Buffer | string | number | Record<string, unknown>) => {
  if (!input) return null;

  if (typeof input === 'string') {
    return input;
  } else if (Buffer.isBuffer(input)) {
    return input.toString('hex');
  } else if (typeof input === 'number') {
    return;
  } else if (input && typeof input.toString === 'function') {
    return input.toString();
  }

  return input;
};

export const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
