import { CubeStateSync, CubeStateSyncType } from "../Message Bus/CubeStateSync";
import { UiSync, UiSyncType } from "../Message Bus/UiSync";
import { WorkerFinishedSync, WorkerFinishedSyncType } from "../Message Bus/WorkerFinishedSync";
import { MessageInbox } from "../../Messages/MessageInbox";
import { WorkerContinueSync } from "../Message Bus/WorkerContinueSync";
import { WorkerStartSync } from "../Message Bus/WorkerStartSync";

export class ProgramWorkerContextMessageBus {

	readonly workerFinishedSync: MessageInbox<WorkerFinishedSync>

	readonly cubeStateSync: MessageInbox<CubeStateSync>

	readonly uiSync: MessageInbox<UiSync>

	private readonly worker: Worker

	constructor(worker: Worker) {

		this.workerFinishedSync = new MessageInbox<WorkerFinishedSync>(WorkerFinishedSyncType);
		this.cubeStateSync = new MessageInbox<CubeStateSync>(CubeStateSyncType);
		this.uiSync = new MessageInbox<UiSync>(UiSyncType);
		
		this.worker = worker;
		this.worker.onmessage = m => {
			for (const propertyName in this) {
				const inbox: any = this[propertyName];
				(inbox as MessageInbox<any>)?.tryRelay?.call(inbox, m.data);
			}
		};
		this.worker.onerror = crash => {
			this.workerFinishedSync.tryRelay({
				type: WorkerFinishedSyncType,
				crash: crash
			});
		};

	}

	send(messageData: WorkerStartSync | WorkerContinueSync): void {
		this.worker.postMessage(messageData);
	}

}