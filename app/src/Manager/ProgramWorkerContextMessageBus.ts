import { CubeStateSync, CubeStateSyncType } from "../../../common/src/Message Bus/CubeStateSync";
import { UiSync, UiSyncType } from "../../../common/src/Message Bus/UiSync";
import { WorkerFinishedSync, WorkerFinishedSyncType } from "../../../common/src/Message Bus/WorkerFinishedSync";
import { MessageInbox } from "../../../common/src/Messages/MessageInbox";
import { WorkerCallbackSync } from "../../../common/src/Message Bus/WorkerCallbackSync";
import { WorkerStartSync } from "../../../common/src/Message Bus/WorkerStartSync";
import { MessageIdGenerator } from "../../../common/src/Messages/MessageIdGenerator";

export class ProgramWorkerContextMessageBus {

	readonly workerFinishedSync: MessageInbox<WorkerFinishedSync>

	readonly cubeStateSync: MessageInbox<CubeStateSync>

	readonly uiSync: MessageInbox<UiSync>

	private readonly worker: Worker

	constructor(worker: Worker) {

		this.workerFinishedSync = new MessageInbox(WorkerFinishedSyncType);
		this.cubeStateSync = new MessageInbox(CubeStateSyncType);
		this.uiSync = new MessageInbox(UiSyncType);
		
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
				id: MessageIdGenerator.generate(),
				crash: crash
			});
		};

	}

	send(messageData: WorkerStartSync | WorkerCallbackSync): void {
		this.worker.postMessage(messageData);
	}

}