import { MessageData } from "../Messages/MessageData";

export const WorkerFinishedSyncType: 'WorkerFinishedSync' = 'WorkerFinishedSync'
export interface WorkerFinishedSync extends MessageData<typeof WorkerFinishedSyncType> {
	readonly failure?: WorkerFinishedSyncFailure
	readonly crash?: ErrorEvent
}

export interface WorkerFinishedSyncFailure {
	readonly message: string
	readonly stack?: string
}