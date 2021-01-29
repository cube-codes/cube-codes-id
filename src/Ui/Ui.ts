import { Cube } from "@cube-codes/cube-codes-model";
import { Level } from "./Level";
import { Toast } from "bootstrap"

export class Ui {

	private static readonly BOOTSTRAP_COLOR_CLASSES_BY_LEVEL = new Map([
		[Level.INFO, 'info'],
		[Level.SUCCESS, 'success'],
		[Level.WARNING, 'warning'],
		[Level.ERROR, 'danger']
	]);

	private readonly cube: Cube

	constructor(cube: Cube) {
		this.cube = cube;
	}

	getCube(): Cube {
		return this.cube;
	}

	log(message: string, level: Level = Level.INFO, withDate: boolean = false): void {
		const color = Ui.BOOTSTRAP_COLOR_CLASSES_BY_LEVEL.get(level);
		let date = '';
		if (withDate) {
			date = '[' + new Date().toLocaleTimeString('en-US') + '] ';
		}
		$(`<div class="log text-${color}">${date}${message}</div>`).appendTo('#logger');
		if ($('#button-editor-lock-scroll').hasClass('active')) {
			$('#logger').scrollTop($('#logger').prop("scrollHeight"));
		}
	}

	logSeparator(level: Level = Level.INFO, withDate: boolean = false): void {
		this.log(`&nbsp;\n${'-'.repeat(80)}\n&nbsp;`, level, withDate);
	}

	overlay(title: string, message: string = '', level: Level = Level.INFO, duration: number = 3000): void {
		const color = Ui.BOOTSTRAP_COLOR_CLASSES_BY_LEVEL.get(level);
		const icons = new Map([
			['info', 'info-circle-fill.svg'],
			['success', 'check-circle-fill.svg'],
			['warning', 'exclamation-circle-fill.svg'],
			['danger', 'x-circle-fill.svg']
		]);
		const toast = $(`<div class="toast bg-${color} text-light" data-delay="${duration}"><div class="toast-header"><img src="images/bootstrap-icons/${icons.get(color as string)}" /><strong>${title}</strong><button type="button" class="ml-auto close" data-dismiss="toast">×</button></div><div class="toast-body">${message}</div></div>`).appendTo('#toast-zone');
		toast.on('hidden.bs.toast', () => {
			toast.remove();
		});
		const toastE = new Toast(toast.get(0));
		toastE.show();
	}

}