import { ProgramManagerState } from "./ProgramManagerState";
import { ProgramWorkerContext } from "./ProgramWorkerContext";
import { ProgramManagerStateChanged } from "./ProgramManagerStateChanged";
import { Event } from "@cube-codes/cube-codes-model";
import { Level } from "../../Ui/Level";
import { Ui } from "../../Ui/Ui";

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

	start(programCode: string, animationTime: number): void {

		if (this.state !== ProgramManagerState.IDLE) throw new Error(`Invalid state: ${this.state}`);

		this.setState(ProgramManagerState.STARTING);

		this.workerContext = new ProgramWorkerContext();
		this.workerContext.messageBus.cubeStateSync.on(m => {
			if (m.move) {
				this.ui.getCube().move(m.move);
			} else {
				this.ui.getCube().setState(m.state);
			}
			this.workerContext?.messageBus.send({ type: 'WorkerContinueSync' });
		});
		this.workerContext.messageBus.uiSync.on(m => {
			m.logs.forEach(logSync => this.ui.log(logSync.message, logSync.level));
			m.overlays.forEach(overlaySync => this.ui.overlay(`Program: ${overlaySync.title}`, overlaySync.message, overlaySync.level, overlaySync.duration));
			this.workerContext?.messageBus.send({ type: 'WorkerContinueSync' });
		});
		this.workerContext.messageBus.workerFinishedSync.on(m => {
			this.setState(ProgramManagerState.IDLE);
			if (m.crash) {
				console.debug('Unexpected error in program worker', m.crash);
			} else if (m.failure) {
				this.ui.log(`Program failed with an error: ${m.failure.stack}`, Level.ERROR, true);
				this.ui.logSeparator();
				this.ui.overlay('Program failed with an error', m.failure.message, Level.ERROR, 8000);
			} else {
				this.ui.log(`Program finished successfully`, Level.SUCCESS, true);
				this.ui.logSeparator();
				this.ui.overlay('Program finished successfully', '', Level.SUCCESS, 5000);
			}
		});

		this.workerContext?.messageBus.send({ type: 'WorkerStartSync', programCode: programCode, cubeState: this.ui.getCube().getState() });
		this.workerContext?.messageBus.send({ type: 'WorkerContinueSync' });

		this.setState(ProgramManagerState.RUNNING);
		this.ui.log('Program started', Level.INFO, true);
		this.ui.overlay('Program started', '', Level.INFO, 5000);

	}

	abort(): void {

		if (this.state !== ProgramManagerState.RUNNING) throw new Error(`Invalid worker state: ${this.state}`);

		this.workerContext?.terminate();

		this.setState(ProgramManagerState.IDLE);
		this.ui.log(`Program aborted`, Level.WARNING, true);
		this.ui.logSeparator();
		this.ui.overlay('Program aborted', '', Level.WARNING, 8000);

	}

}