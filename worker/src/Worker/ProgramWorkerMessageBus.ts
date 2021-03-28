import { CubeStateSync } from "../../../common/src/Message Bus/CubeStateSync";
import { UiSync } from "../../../common/src/Message Bus/UiSync";
import { WorkerFinishedSync } from "../../../common/src/Message Bus/WorkerFinishedSync";
import { MessageInbox } from "../../../common/src/Messages/MessageInbox";
import { WorkerCallbackSync, WorkerCallbackSyncType } from "../../../common/src/Message Bus/WorkerCallbackSync";
import { WorkerStartSync, WorkerStartSyncType } from "../../../common/src/Message Bus/WorkerStartSync";

export type ProgramWorkerOutboundMessage = CubeStateSync | UiSync | WorkerFinishedSync
export class ProgramWorkerMessageBus {

	readonly workerStartSync: MessageInbox<WorkerStartSync>

	private readonly workerContinueSync: MessageInbox<WorkerCallbackSync>

	private readonly promiseResolvesByMessageId: Map<string, (value: void | PromiseLike<void>) => void>

	constructor() {

		this.workerStartSync = new MessageInbox(WorkerStartSyncType);
		this.workerContinueSync = new MessageInbox(WorkerCallbackSyncType);
		this.promiseResolvesByMessageId = new Map();

		self.onmessage = m => {
			for (const propertyName in this) {
				const inbox: any = this[propertyName];
				(inbox as MessageInbox<any>)?.tryRelay?.call(inbox, m.data);
			}
		};

		this.workerContinueSync.on(m => {
			if(this.promiseResolvesByMessageId.has(m.originalId)) {
				this.promiseResolvesByMessageId.get(m.originalId)!.call(this);
				this.promiseResolvesByMessageId.delete(m.originalId);
			}
		});

	}

	async sendMessage(messageData: ProgramWorkerOutboundMessage): Promise<void> {
		const promise = new Promise<void>(r => this.promiseResolvesByMessageId.set(messageData.id, r));
		self.postMessage(messageData);
		return promise;
	}

}