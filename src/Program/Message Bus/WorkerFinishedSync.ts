import { MessageData } from "../../Messages/MessageData";

export const WorkerFinishedSyncType: 'WorkerFinishedSync' = 'WorkerFinishedSync'
export interface WorkerFinishedSync extends MessageData<typeof WorkerFinishedSyncType> {
	readonly failure?: Error
	readonly crash?: ErrorEvent
}