// combine.ts
// This script combines all SDK .ts files into sdk.txt, separated by filename.

const files = [
  'src/vue/index.ts',
  'src/types.ts',
  'src/support/index.ts',
  'src/subscription/index.ts',
  'src/ipc/index.ts',
  'src/notifications/index.ts',
  'src/pubsub/index.ts',
  'src/socket/index.ts',
  'src/remote-config/index.ts',
  'src/scene-builder/index.ts',
  'src/auth/index.ts',
  'src/extension/index.ts',
  'src/coins/index.ts',
  'src/context/index.ts',
];

const encoder = new TextEncoder();
const output: string[] = [];

for (const file of files) {
  const content = await Deno.readTextFile(file);
  output.push(`---- ${file} ----\n${content}\n`);
}

await Deno.writeTextFile('sdk.txt', output.join('\n'));
console.log('sdk.txt created.');
