import { MessageData } from "../../Messages/MessageData";
import { Level } from "../../Ui/Level";

export const UiSyncType: 'UiSync' = 'UiSync'
export interface UiSync extends MessageData<typeof UiSyncType> {
	readonly logs: Array<LogSync>
	readonly overlays: Array<OverlaySync>
}

export interface LogSync {
	readonly message: string
	readonly level: Level
}

export interface OverlaySync {
	readonly title: string
	readonly message: string
	readonly level: Level
	readonly duration: number
}