import { Level } from "../../../common/src/Level";
import { UiSyncType } from "../../../common/src/Message Bus/UiSync";
import { MessageIdGenerator } from "../../../common/src/Messages/MessageIdGenerator";
import { ProgramWorkerMessageBus } from "../Worker/ProgramWorkerMessageBus";

export class UiApi {

	constructor(private readonly messageBus: ProgramWorkerMessageBus) {}

	async log(message: string, level: Level = Level.INFO, withDate: boolean = false): Promise<void> {
		await this.messageBus.sendMessage({
			type: UiSyncType,
			id: MessageIdGenerator.generate(),
			logs: [{
				message: message,
				level: level,
				withDate: withDate
			}],
			overlays: []
		});
	}

	async logInfo(message: string, withDate: boolean = false): Promise<void> {
		await this.log(message, Level.INFO, withDate);
	}

	async logSuccess(message: string, withDate: boolean = false): Promise<void> {
		await this.log(message, Level.SUCCESS, withDate);
	}

	async logWarning(message: string, withDate: boolean = false): Promise<void> {
		await this.log(message, Level.WARNING, withDate);
	}

	async logError(message: string, withDate: boolean = false): Promise<void> {
		await this.log(message, Level.ERROR, withDate);
	}

	async overlay(title: string, message: string = '', level: Level = Level.INFO, duration: number = 3000): Promise<void> {
		await this.messageBus.sendMessage({
			type: UiSyncType,
			id: MessageIdGenerator.generate(),
			logs: [],
			overlays: [{
				title: title,
				message: message,
				level: level,
				duration: duration
			}]
		});
	}

	async overlayInfo(title: string, message: string = '', duration: number = 3000): Promise<void> {
		await this.overlay(title, message, Level.INFO, duration);
	}

	async overlaySuccess(title: string, message: string = '', duration: number = 3000): Promise<void> {
		await this.overlay(title, message, Level.SUCCESS, duration);
	}

	async overlayWarning(title: string, message: string = '', duration: number = 3000): Promise<void> {
		await this.overlay(title, message, Level.WARNING, duration);
	}

	async overlayError(title: string, message: string = '', duration: number = 3000): Promise<void> {
		await this.overlay(title, message, Level.ERROR, duration);
	}

	async sleep(seconds: number): Promise<void> {
		return new Promise(r => setTimeout(r, seconds * 1000));
	}

}