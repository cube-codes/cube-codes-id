import { CubeStateSync, CubeStateSyncType } from "../../../common/src/Message Bus/CubeStateSync";
import { UiSync, UiSyncType } from "../../../common/src/Message Bus/UiSync";
import { WorkerFinishedSync, WorkerFinishedSyncType } from "../../../common/src/Message Bus/WorkerFinishedSync";
import { MessageInbox } from "../../../common/src/Messages/MessageInbox";
import { WorkerContinueSync } from "../../../common/src/Message Bus/WorkerContinueSync";
import { WorkerStartSync } from "../../../common/src/Message Bus/WorkerStartSync";

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