'use strict';

importScripts('./dist/browser/cube-codes-ide-worker.js');

Object.assign(this, CCI);

const programWorker = new ProgramWorker();