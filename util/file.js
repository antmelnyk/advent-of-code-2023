export async function readString(path) {
  const file = Bun.file(path);
  return await file.text();
}