// Genera el hash scrypt de la contraseña de grupo para APP_PASSWORD_HASH (opcional).
// Uso: npm run hash-password -- "mi contraseña"
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 6) {
  console.error('Uso: npm run hash-password -- "contraseña (mín. 6 caracteres)"');
  process.exit(1);
}
const N = 16384, r = 8, p = 1;
const salt = randomBytes(16);
const key = scryptSync(password, salt, 32, { N, r, p, maxmem: 64 * 1024 * 1024 });
console.log(["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join("$"));
