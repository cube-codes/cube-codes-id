'use strict';

importScripts('../dist/browser/cube-codes-ide.js');

const programWorker = new CCI.ProgramWorker(globalThis);
const API = new CCI.ExecutionApi(programWorker.messageBus);