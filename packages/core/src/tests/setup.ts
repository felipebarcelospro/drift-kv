// Exemplo de polyfill para Float16Array
// @ts-ignore
if (typeof Float16Array === "undefined") {
  global.Float16Array = class Float16Array extends Float32Array {};
}
