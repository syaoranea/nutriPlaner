const fs = require('fs');
const path = require('path');

const envDirectory = path.join(__dirname, 'src/environments');

// Garante que a pasta exista
if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

// O conteúdo do arquivo usará as variáveis que você cadastrar no painel do Vercel
const content = `
export const environment = {
  production: true,
  firebase: {
    apiKey: '${process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY'}',
    authDomain: '${process.env.FIREBASE_AUTH_DOMAIN || 'nutriplanner-881b3.firebaseapp.com'}',
    projectId: '${process.env.FIREBASE_PROJECT_ID || 'nutriplanner-881b3'}',
    storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET || 'nutriplanner-881b3.firebasestorage.app'}',
    messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID || '850017512227'}',
    appId: '${process.env.FIREBASE_APP_ID || '1:850017512227:web:8bd4784756d8ded7e2fa96'}',
    perplexityKey: '${process.env.PERPLEXITY_KEY || 'YOUR_PERPLEXITY_API_KEY'}',
  },
};
`;

const targetPath = path.join(envDirectory, 'environment.ts');

fs.writeFileSync(targetPath, content);

console.info(`[Build] Arquivo environment.ts gerado com sucesso em ${targetPath}`);
