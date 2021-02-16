import { ProgramManagerState } from "./ProgramManagerState";
import { ProgramWorkerContext } from "./ProgramWorkerContext";
import { ProgramManagerStateChanged } from "./ProgramManagerStateChanged";
import { CubeMove, CubeState, Event } from "@cube-codes/cube-codes-model";
import { Level } from "../../../common/src/Level";
import { Ui } from "../UI/Ui";

export class ProgramManager {

	readonly stateChanged = new Event<ProgramManagerStateChanged>()

	private state: ProgramManagerState

	private workerContext?: ProgramWorkerContext

	constructor(private readonly ui: Ui) {
		this.state = ProgramManagerState.IDLE;
		this.workerContext = undefined;
	}

	private setState(newState: ProgramManagerState) {
		const oldState = this.state;
		this.state = newState;
		if (this.state === ProgramManagerState.IDLE) {
			this.workerContext = undefined;
		}
		this.stateChanged.trigger({
			oldState: oldState,
			newState: newState
		});
	}

	start(programCode: string, animation: boolean): void {

		if (this.state !== ProgramManagerState.IDLE) throw new Error(`Invalid state: ${this.state}`);

		this.setState(ProgramManagerState.STARTING);

		this.workerContext = new ProgramWorkerContext();
		this.workerContext.messageBus.cubeStateSync.on(async m => {
			if (m.move) {
				await this.ui.cube.move(CubeMove.import(this.ui.cube.spec, JSON.parse(m.move)), {
					animation: animation
				});
			} else {
				await this.ui.cube.setState(CubeState.import(this.ui.cube.spec, JSON.parse(m.state)), {
					animation: animation
				});
			}
			this.workerContext?.messageBus.send({ type: 'WorkerContinueSync' });
		});
		this.workerContext.messageBus.uiSync.on(m => {
			m.logs.forEach(logSync => this.ui.editorWidget.log(logSync.message, logSync.level));
			m.overlays.forEach(overlaySync => this.ui.overlay(`Program: ${overlaySync.title}`, overlaySync.message, overlaySync.level, overlaySync.duration));
			this.workerContext?.messageBus.send({ type: 'WorkerContinueSync' });
		});
		this.workerContext.messageBus.workerFinishedSync.on(m => {
			this.setState(ProgramManagerState.IDLE);
			if (m.crash) {
				console.debug('Unexpected error in program worker', m.crash);
			} else if (m.failure) {
				this.ui.editorWidget.log(`Program failed with an error: ${m.failure.stack}`, Level.ERROR, true);
				this.ui.editorWidget.logSeparator();
				this.ui.overlay('Program failed with an error', m.failure.message, Level.ERROR, 8000);
			} else {
				this.ui.editorWidget.log(`Program finished successfully`, Level.SUCCESS, true);
				this.ui.editorWidget.logSeparator();
				this.ui.overlay('Program finished successfully', '', Level.SUCCESS, 5000);
			}
		});

		this.workerContext?.messageBus.send({ type: 'WorkerStartSync', programCode: programCode, cubeSpec: JSON.stringify(this.ui.cube.spec.export()), cubeSolutionCondition: JSON.stringify(this.ui.cube.solutionCondition.export()), cubeState: JSON.stringify(this.ui.cube.getState().export()) });
		this.workerContext?.messageBus.send({ type: 'WorkerContinueSync' });

		this.setState(ProgramManagerState.RUNNING);
		this.ui.editorWidget.log('Program started', Level.INFO, true);
		this.ui.overlay('Program started', '', Level.INFO, 5000);

	}

	abort(): void {

		if (this.state !== ProgramManagerState.RUNNING) throw new Error(`Invalid worker state: ${this.state}`);

		this.workerContext?.terminate();

		this.setState(ProgramManagerState.IDLE);
		this.ui.editorWidget.log(`Program aborted`, Level.WARNING, true);
		this.ui.editorWidget.logSeparator();
		this.ui.overlay('Program aborted', '', Level.WARNING, 8000);

	}

}