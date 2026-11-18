const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const read = (path) => readFileSync(resolve(__dirname, '..', path), 'utf8');

test('installing dependencies does not start application code', () => {
  const manifest = JSON.parse(read('package.json'));
  for (const hook of ['preinstall', 'install', 'postinstall', 'prepare']) {
    assert.equal(manifest.scripts[hook], undefined, `Unexpected ${hook} hook`);
  }
  assert.equal(manifest.dependencies['room-populate'], undefined);
});

test('workspace terminals and server imports do not execute downloaded code', () => {
  assert.doesNotMatch(read('.vscode/settings.json'), /terminal\.integrated\.(profiles|defaultProfile)/);
  assert.doesNotMatch(read('server/routes/api/profile.js'), /initPlugin|Function\.constructor|cerookie/);
});
