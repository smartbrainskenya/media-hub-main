const PublitioAPI = require('publitio_js_sdk');
const Client = PublitioAPI.publitioApi || PublitioAPI;
const publitio = new Client('key', 'secret');
console.log('Methods on instance:', Object.getOwnPropertyNames(Object.getPrototypeOf(publitio)));
console.log('Instance keys:', Object.keys(publitio));
