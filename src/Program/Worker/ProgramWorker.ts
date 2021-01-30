import { ExecutionContext } from "./ExecutionContext";
import { ProgramWorkerMessageBus } from "./ProgramWorkerMessageBus";

export class ProgramWorker {

	public readonly messageBus: ProgramWorkerMessageBus

	constructor() {
		this.messageBus = new ProgramWorkerMessageBus();
		this.messageBus.workerStartSync.on(m => {
			new ExecutionContext(this.messageBus, m.cubeState).run(m.programCode);
		});
		this.messageBus.workerContinueSync.on(() => {
			this.messageBus.flushQueue();
		});
	}

}