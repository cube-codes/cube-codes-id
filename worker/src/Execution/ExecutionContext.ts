import { Cube, CubeSolutionCondition, CubeSpecification, CubeState } from "@cube-codes/cube-codes-model";
import { WorkerFinishedSync } from "../../../common/src/Message Bus/WorkerFinishedSync";
import { CubeApi } from "../../../common/src/Cube Api/CubeApi";
import { ExecutionApi } from "./ExecutionApi";
import { ProgramWorkerMessageBus } from "../Worker/ProgramWorkerMessageBus";

export class ExecutionContext {

	private readonly messageBus: ProgramWorkerMessageBus

	private readonly cube: Cube

	constructor(messageBus: ProgramWorkerMessageBus, cubeSpec: CubeSpecification, cubeSolutionCondition: CubeSolutionCondition, cubeState: CubeState) {
		this.messageBus = messageBus;
		this.cube = new Cube(cubeSpec, cubeSolutionCondition, cubeState);
		this.cube.stateChanged.on(e => {
			messageBus.queueMessage({
				type: 'CubeStateSync',
				state: JSON.stringify(e.newState.export()),
				move: e.move === undefined ? undefined : JSON.stringify(e.move.export())
			});
		});
	}

	run(programCode: string): void {

		(self as any).API = new ExecutionApi(this.messageBus);
		(self as any).CUBE = new CubeApi(this.cube);

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