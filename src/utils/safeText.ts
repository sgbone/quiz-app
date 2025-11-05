export const toStr = (v: any): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(toStr).join(", ");
  try {
    return String(v);
  } catch {
    return "";
  }
};

export type RawQuestion = any;

export const normalizeQuestion = (q: RawQuestion) => ({
  ...q,
  id: q.id ?? crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  question: toStr(q.question),
  explanation: toStr(q.explanation),
  A: toStr(q.A),
  B: toStr(q.B),
  C: toStr(q.C),
  D: toStr(q.D),
  E: toStr(q.E),
  F: toStr(q.F),
  // nếu options là chuỗi “A;B;C” thì tách, nếu là mảng lẫn kiểu thì ép về string
  options: Array.isArray(q.options)
    ? q.options.map(toStr)
    : toStr(q.options)
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter(Boolean),
  tags: toStr(q.tags),
  subject: toStr(q.subject),
});
