export default function (func: () => void, interval: number) {
  func();
  const id = setInterval(func, interval);
  return id;
}
