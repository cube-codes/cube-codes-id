import { ExecutionContext } from "./ExecutionContext";
import { ProgramWorkerGlobal } from "./ProgramWorkerGlobal";
import { ProgramWorkerMessageBus } from "./ProgramWorkerMessageBus";

export class ProgramWorker {

	public readonly messageBus: ProgramWorkerMessageBus

	constructor(global: ProgramWorkerGlobal) {
		this.messageBus = new ProgramWorkerMessageBus(global);
		this.messageBus.workerStartSync.on(m => {
			new ExecutionContext(this.messageBus, m.cubeState).run(m.programCode);
		});
		this.messageBus.workerContinueSync.on(() => {
			this.messageBus.flushQueue();
		});
	}

}