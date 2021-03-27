import { MessageData } from "../Messages/MessageData";

export const WorkerCallbackSyncType: 'WorkerCallbackSync' = 'WorkerCallbackSync'
export interface WorkerCallbackSync extends MessageData<typeof WorkerCallbackSyncType> {
	readonly originalId: string
}