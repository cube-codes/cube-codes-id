import { CubeSolutionCondition, CubeSpecification, CubeState } from "@cube-codes/cube-codes-model";
import { ExecutionContext } from "../Execution/ExecutionContext";
import { ProgramWorkerMessageBus } from "./ProgramWorkerMessageBus";

export class ProgramWorker {

	public readonly messageBus: ProgramWorkerMessageBus

	constructor() {
		this.messageBus = new ProgramWorkerMessageBus();
		this.messageBus.workerStartSync.on(m => {
			
			const cubeSpec = CubeSpecification.import(JSON.parse(m.cubeSpec));
			const cubeSolutionCondition = CubeSolutionCondition.import(JSON.parse(m.cubeSolutionCondition));
			const cubeState = CubeState.import(cubeSpec, JSON.parse(m.cubeState));
			
			const executionContext = new ExecutionContext(this.messageBus, cubeSpec, cubeSolutionCondition, cubeState);
			executionContext.run(m.programCode);
		});
		this.messageBus.workerContinueSync.on(() => {
			this.messageBus.flushQueue();
		});
	}

}