import PublitioAPI from 'publitio_js_sdk';
// @ts-expect-error (SDK types missing)
const Client = PublitioAPI.publitioApi || PublitioAPI;
// @ts-expect-error (SDK types missing)
const publitio = new Client('key', 'secret');
console.log('Methods on instance:', Object.getOwnPropertyNames(Object.getPrototypeOf(publitio)));
console.log('Instance keys:', Object.keys(publitio));
