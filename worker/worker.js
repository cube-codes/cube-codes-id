'use strict';

importScripts('./dist/browser/browser.js');

Object.assign(this, CCI);

const programWorker = new ProgramWorker();