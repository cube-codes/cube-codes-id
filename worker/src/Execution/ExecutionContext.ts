import { Cube, CubeSolutionCondition, CubeSpecification, CubeState } from "@cube-codes/cube-codes-model";
import { WorkerFinishedSync } from "../../../common/src/Message Bus/WorkerFinishedSync";
import { CubeApi } from "../../../common/src/Cube Api/CubeApi";
import { UiApi } from "./UiApi";
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
				move: e.move === undefined ? undefined : JSON.stringify(e.move.export()),
				source: JSON.stringify(e.source ?? {})
			});
		});
	}

	async run(programCode: string): Promise<void> {

		const workerGlobal = self as any;

		// Set main API entrypoints
		workerGlobal.UI = new UiApi(this.messageBus);
		workerGlobal.CUBE = new CubeApi(this.cube);
		workerGlobal.CUBELETS = workerGlobal.CUBE.cubelets;

		let workerFinishedSync: WorkerFinishedSync = {
			type: 'WorkerFinishedSync',
		}

		try {
			new Function(`globalThis.program = async () => {${programCode}}`)();
			await workerGlobal.program();
		} catch(failure) {
			workerFinishedSync = {
				type: 'WorkerFinishedSync',
				failure: failure
			}
		}
		
		this.messageBus.queueMessage(workerFinishedSync);

	}
	
}