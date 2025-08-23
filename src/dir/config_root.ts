import path from 'path';
const a = process.argv.slice(2);
export default async function configRoot() {
  if (a[0]) {
    console.log(path.resolve(a[0]));
  }
}

configRoot();
