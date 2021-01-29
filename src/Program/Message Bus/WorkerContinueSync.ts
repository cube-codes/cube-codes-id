import { MessageData } from "../../Messages/MessageData";

export const WorkerContinueSyncType: 'WorkerContinueSync' = 'WorkerContinueSync'
export interface WorkerContinueSync extends MessageData<typeof WorkerContinueSyncType> {}