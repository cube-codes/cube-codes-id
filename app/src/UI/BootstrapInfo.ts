import { Level } from "../../../common/src/Level";

export class BootstrapInfo {
	
	static readonly COLOR_CLASSES_BY_LEVEL: ReadonlyMap<Level, string> = new Map([
		[Level.INFO, 'info'],
		[Level.SUCCESS, 'success'],
		[Level.WARNING, 'warning'],
		[Level.ERROR, 'danger']
	]);

	static readonly ICONS_BY_LEVEL: ReadonlyMap<Level, string> = new Map([
		[Level.INFO, 'info-circle-fill.svg'],
		[Level.SUCCESS, 'check-circle-fill.svg'],
		[Level.WARNING, 'exclamation-circle-fill.svg'],
		[Level.ERROR, 'x-circle-fill.svg']
	]);

}