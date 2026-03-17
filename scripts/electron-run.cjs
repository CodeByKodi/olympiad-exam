#!/usr/bin/env node
/**
 * Wrapper to run Electron with correct environment.
 * Unsets ELECTRON_RUN_AS_NODE which causes require('electron') to return path instead of API.
 */
const { spawn } = require('child_process');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const electronPath = require('electron');
const child = spawn(electronPath, [path.join(__dirname, '..')], {
  stdio: 'inherit',
  env,
});
child.on('exit', (code) => process.exit(code || 0));
