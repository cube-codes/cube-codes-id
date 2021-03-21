import { Level } from "../../../common/src/Level";
import { ProgramWorkerMessageBus } from "../Worker/ProgramWorkerMessageBus";

export class UiApi {

	constructor(private readonly messageBus: ProgramWorkerMessageBus) {}

	log(message: string, level: Level = Level.INFO): void {
		this.messageBus.queueMessage({
			type: 'UiSync',
			logs: [{
				message: message,
				level: level
			}],
			overlays: []
		});
	}

	logInfo(message: string): void {
		this.log(message, Level.INFO);
	}

	logSuccess(message: string): void {
		this.log(message, Level.SUCCESS);
	}

	logWarning(message: string): void {
		this.log(message, Level.WARNING);
	}

	logError(message: string): void {
		this.log(message, Level.ERROR);
	}

	overlay(title: string, message: string = '', level: Level = Level.INFO, duration: number = 3000): void {
		this.messageBus.queueMessage({
			type: 'UiSync',
			logs: [],
			overlays: [{
				title: title,
				message: message,
				level: level,
				duration: duration
			}]
		});
	}

	overlayInfo(title: string, message: string = '', duration: number = 3000): void {
		this.overlay(title, message, Level.INFO, duration);
	}

	overlaySuccess(title: string, message: string = '', duration: number = 3000): void {
		this.overlay(title, message, Level.SUCCESS, duration);
	}

	overlayWarning(title: string, message: string = '', duration: number = 3000): void {
		this.overlay(title, message, Level.WARNING, duration);
	}

	overlayError(title: string, message: string = '', duration: number = 3000): void {
		this.overlay(title, message, Level.ERROR, duration);
	}

	async sleep(seconds: number): Promise<void> {
		return new Promise(r => setTimeout(r, seconds * 1000));
	}

}