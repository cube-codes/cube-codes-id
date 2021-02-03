import { Cube, CubeState } from "@cube-codes/cube-codes-model";
import { WorkerFinishedSync } from "../../common/src/Message Bus/WorkerFinishedSync";
import { ExecutionApi } from "./ExecutionApi";
import { ProgramWorkerMessageBus } from "./ProgramWorkerMessageBus";

export class ExecutionContext {

	private readonly messageBus: ProgramWorkerMessageBus

	private readonly cube: Cube

	constructor(messageBus: ProgramWorkerMessageBus, cubeState: CubeState) {
		this.messageBus = messageBus;
		this.cube = new Cube(cubeState.spec, cubeState.solutionCondition, cubeState);
		this.cube.stateChanged.on(e => {
			messageBus.queueMessage({
				type: 'CubeStateSync',
				state: e.newState.export(),
				move: e.move?.export()
			});
		});
	}

	run(programCode: string): void {

		(self as any).API = new ExecutionApi(this.messageBus);
		(self as any).CUBE = this.cube;

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