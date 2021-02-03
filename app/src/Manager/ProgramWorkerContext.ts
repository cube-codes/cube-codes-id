import { ProgramWorkerContextMessageBus } from "./ProgramWorkerContextMessageBus";

export class ProgramWorkerContext {

	private readonly worker: Worker

	readonly messageBus: ProgramWorkerContextMessageBus

	constructor() {
		if (!Worker) throw new Error('Worker not available');
		this.worker = new Worker("../worker/worker.js");
		this.messageBus = new ProgramWorkerContextMessageBus(this.worker);
	}

	terminate() {
		this.worker.terminate();
	}

}