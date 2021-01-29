import { Cube, CubeState } from "@cube-codes/cube-codes-model";
import { WorkerFinishedSync } from "../Message Bus/WorkerFinishedSync";
import { ProgramWorkerMessageBus } from "./ProgramWorkerMessageBus";

export class ExecutionContext {

	private readonly messageBus: ProgramWorkerMessageBus

	private readonly cube: Cube

	constructor(messageBus: ProgramWorkerMessageBus, cubeState: CubeState) {
		this.messageBus = messageBus;
		this.cube = new Cube(cubeState.spec, undefined, cubeState);
		this.cube.stateChanged.on(e => {
			messageBus.queueMessage({
				type: 'CubeStateSync',
				state: e.newState,
				move: e.move
			});
		});
	}

	run(programCode: string): void {
	
		let workerFinishedSync: WorkerFinishedSync = {
			type: 'WorkerFinishedSync',
		}

		try {
			Function(programCode)();
		} catch(failure) {
			workerFinishedSync = {
				type: 'WorkerFinishedSync',
				failure: failure
			}
		}
		
		this.messageBus.queueMessage(workerFinishedSync);

	}
	
}