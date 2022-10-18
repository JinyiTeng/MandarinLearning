export const baseName = (f: string): string => {
  if (!f) {
    return '';
  }

  const l1 = f.lastIndexOf('/');
  const l2 = f.lastIndexOf('\\');
  if (l1 >= 0) {
    f = f.substring(l1 + 1);
  }
  if (l2 >= 0) {
    f = f.substring(l2 + 1);
  }

  const e = f.lastIndexOf('.');
  if (e >= 0) {
    f = f.substring(0, e);
  }
  return f;
};

export const toStdNameTag = (f: string): string => {
  f = (f ?? '').replace(/[`’]+/gi, '');
  const fname = f.replace(/[^a-zA-Z0-9]+/gi, ' ').trim();
  return fname.replace(/\s+/gi, '_').toLowerCase();
};
