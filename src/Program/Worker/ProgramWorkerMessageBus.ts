import { CubeStateSync } from "../Message Bus/CubeStateSync";
import { UiSync } from "../Message Bus/UiSync";
import { WorkerFinishedSync } from "../Message Bus/WorkerFinishedSync";
import { MessageInbox } from "../../Messages/MessageInbox";
import { WorkerContinueSync, WorkerContinueSyncType } from "../Message Bus/WorkerContinueSync";
import { WorkerStartSync, WorkerStartSyncType } from "../Message Bus/WorkerStartSync";
import { ProgramWorkerGlobal } from "./ProgramWorkerGlobal";
import { MessageBufferChangeDetector as MessageQueueChangeDetector } from "./MessageQueueChangeDetector";

export type ProgramWorkerOutboundMessage = CubeStateSync | UiSync | WorkerFinishedSync
export class ProgramWorkerMessageBus {

	readonly workerStartSync: MessageInbox<WorkerStartSync>

	readonly workerContinueSync: MessageInbox<WorkerContinueSync>

	private readonly messageQueue: Array<ProgramWorkerOutboundMessage>

	private messageQueueChangeDetector?: MessageQueueChangeDetector

	private messageQueueClosed: boolean

	constructor() {

		this.workerStartSync = new MessageInbox<WorkerStartSync>(WorkerStartSyncType);
		this.workerContinueSync = new MessageInbox<WorkerContinueSync>(WorkerContinueSyncType);

		(globalThis as unknown as ProgramWorkerGlobal).onmessage = m => {
			for (const propertyName in this) {
				const inbox: any = this[propertyName];
				(inbox as MessageInbox<any>)?.tryRelay?.call(inbox, m.data);
			}
		};

		this.messageQueue = new Array<ProgramWorkerOutboundMessage>();
		this.messageQueueChangeDetector = undefined;
		this.messageQueueClosed = false;

	}

	queueMessage(messageData: ProgramWorkerOutboundMessage): void {
		this.messageQueue.push(messageData);
		this.messageQueueChangeDetector?.trigger();
	}

	async flushQueue(): Promise<void> {

		// When this function is executed it must ensure to send one message from the queue.
		// If there is none yet we wait for a new one or until the queue is closed.

		if (this.messageQueueClosed) {
			return;
		}

		// A) Install mechanism to detect new queued messages
		this.messageQueueChangeDetector = new MessageQueueChangeDetector();

		// B) If there is already a queued message, we send it and exit (we have done our job)
		const oldestMessage = this.messageQueue.shift();
		if (oldestMessage !== undefined) {
			this.send(oldestMessage);
			return;
		}

		// C) There was no already queued message, so we wait until a new message arrive since B and then stop the detection mechanism
		await this.messageQueueChangeDetector;
		this.messageQueueChangeDetector = undefined;

		// D) We waited for a new message. If it is still in the queue we send it and exit (we have done our job)
		const newMessage = this.messageQueue.shift();
		if (newMessage !== undefined) {
			this.send(newMessage);
			return;
		}

		// E) The message we have waited for was not anymore in the queue, that means that it was stolen by another run of this function.
		//    That run has ended (beacuse it did its job), so we need to start all over again and try to be more lucky the next time to be able to send a message.
		this.flushQueue();

	}

	private send(messageData: ProgramWorkerOutboundMessage) {
		if (messageData.type === 'WorkerFinishedSync') {
			this.messageQueueClosed = true;
		}
		(globalThis as unknown as ProgramWorkerGlobal).postMessage(messageData);
		if (messageData.type === 'WorkerFinishedSync') {
			(globalThis as unknown as ProgramWorkerGlobal).close();
		}
	};

}