import { Cube, CubeHistory, CubeMoveAngle, CubeSpecification } from "@cube-codes/cube-codes-model";
import { Level } from "./Level";
import { Toast } from "bootstrap"
import { ProgramManager } from "../Program/Manager/ProgramManager";
import { ProgramManagerState } from "../Program/Manager/ProgramManagerState";

export class Ui {

	private static readonly BOOTSTRAP_COLOR_CLASSES_BY_LEVEL = new Map([
		[Level.INFO, 'info'],
		[Level.SUCCESS, 'success'],
		[Level.WARNING, 'warning'],
		[Level.ERROR, 'danger']
	]);

	private readonly cube: Cube

	private readonly cubeHistory: CubeHistory

	private readonly programManager: ProgramManager

	private editor?: AceAjax.Editor

	constructor() {

		const cubeSpec = new CubeSpecification(3, true);
		this.cube = new Cube(cubeSpec, undefined, undefined);
		this.cubeHistory = new CubeHistory(this.cube);
		this.programManager = new ProgramManager(this);

		window.addEventListener('beforeunload', e => e.returnValue = 'Are you sure you want to leave?');

		$(doc => { this.lazyInit(); });

	}

	private lazyInit(): void {
		this.initEditor();
		this.initHistory();
		this.initControls();
		this.hideLoader();
	}

	private initEditor(): void {
		this.editor = ace.edit('editor');
		this.editor.setOptions({
			mode: 'ace/mode/javascript',
			newLineMode: 'unix',
			useSoftTabs: false,
			tabSize: 4,
			dragEnabled: false,
			showPrintMargin: false,
			theme: 'ace/theme/textmate',
			fixedWidthGutter: true
		});
		this.editor.setFontSize('12px');
		let fontSize = 12;
		this.editor.renderer.setScrollMargin(6, 0, 0, 0);
		this.editor.on('input', e => {
			$('#button-editor-undo').prop('disabled', !this.editor?.session.getUndoManager().hasUndo());
			$('#button-editor-redo').prop('disabled', !this.editor?.session.getUndoManager().hasRedo());
		});

		this.programManager.stateChanged.on(e => {
			const running = e.newState !== ProgramManagerState.IDLE;
			$('#button-editor-abort'   ).prop('disabled', !running);
			$('#button-editor-run'     ).prop('disabled', running);
			$('#button-editor-run-fast').prop('disabled', running);
		})
		
		$('#button-editor-abort'          ).on('click', e => this.programManager.abort());
		$('#button-editor-run'            ).on('click', e => this.programManager.start(this.editor?.getValue() as string, 300));
		$('#button-editor-run-fast'       ).on('click', e => this.programManager.start(this.editor?.getValue() as string, 0));
		$('#button-editor-undo'           ).on('click', e => this.editor?.undo());
		$('#button-editor-redo'           ).on('click', e => this.editor?.redo());
		$('#button-editor-search'         ).on('click', e => this.editor?.execCommand('find'));
		$('#button-editor-show-invisibles').on('click', e => this.editor?.setOption('showInvisibles', !this.editor.getOption('showInvisibles')));
		$('#button-editor-font-increase'  ).on('click', e => { fontSize = Math.floor(fontSize * 1.2); this.editor?.setFontSize(`${fontSize}px`); $('#editor, #logger').attr('style', `font-size: ${fontSize}px !important`); });
		$('#button-editor-font-decrease'  ).on('click', e => { fontSize = Math.floor(fontSize / 1.2); this.editor?.setFontSize(`${fontSize}px`); $('#editor, #logger').attr('style', `font-size: ${fontSize}px !important`); });
		$('#button-editor-clean'          ).on('click', e => $('#logger').empty());
	
	}

	initHistory(): void {
		
		// Display Cube History Moves
	
		this.cubeHistory.moved.on(e => { $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (this.cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); });
		this.cubeHistory.recorded.on(e => { $('#section-history-changes').append('<span class="badge badge-light">' + (e.change.move ? this.cube.getMoveLanguage().stringify([e.change.move]) : 'Manual') + '</span>'); if($('#button-history-lock-scroll').hasClass('active')) { $('#section-history-changes').scrollTop($('#section-history-changes').prop("scrollHeight")); } });
		this.cubeHistory.pastCleaned.on(e => { $('#section-history-changes').children().slice(0, e.before + 1).remove(); $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (this.cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); $('#section-history-changes > span:first-child').html('Initial'); });
		this.cubeHistory.futureCleaned.on(e => { $('#section-history-changes').children().slice(e.after + 2).remove(); $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (this.cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); });
		$('#section-history-changes').append('<span class="badge badge-light current">Initial</span>');
		
		// Update Cube History Controls
	
		const updateHistoryButtons = () => {
			$('#button-history-jump-start'  ).prop('disabled', this.cubeHistory.isAtStart());
			$('#button-history-play-back'   ).prop('disabled', this.cubeHistory.isAtStart());
			$('#button-history-step-back'   ).prop('disabled', this.cubeHistory.isAtStart());
			$('#button-history-step-ahead'  ).prop('disabled', this.cubeHistory.isAtEnd());
			$('#button-history-play-ahead'  ).prop('disabled', this.cubeHistory.isAtEnd());
			$('#button-history-jump-end'    ).prop('disabled', this.cubeHistory.isAtEnd());
		};
		this.cubeHistory.moved.on(updateHistoryButtons);
		this.cubeHistory.pastCleaned.on(updateHistoryButtons);
		this.cubeHistory.futureCleaned.on(updateHistoryButtons);
		updateHistoryButtons();
		
		// Cube History Click
	
		$('#section-history-changes').on('click', 'span', e => this.cubeHistory.jumpToIndex($(e.target).index() - 1));
	
		// Cube History Controls
	
		$('#button-history-jump-start'  ).on('click', e => this.cubeHistory.jumpToStart());
		$('#button-history-jump-end'    ).on('click', e => this.cubeHistory.jumpToEnd());
		$('#button-history-step-back'   ).on('click', e => this.cubeHistory.stepBack());
		$('#button-history-step-ahead'  ).on('click', e => this.cubeHistory.stepAhead());
		$('#button-history-clean-past'  ).on('click', e => this.cubeHistory.cleanPastBefore(this.cubeHistory.getCurrentPosition()));
		$('#button-history-clean-future').on('click', e => this.cubeHistory.cleanFutureAfter(this.cubeHistory.getCurrentPosition()));
	
	}

	initControls(): void {

		$('#button-cube-front').on('click', e => this.cube.mFront());
		$('#dropdown-item-cube-front-two').on('click', e => this.cube.mFront(CubeMoveAngle.C180));
		$('#dropdown-item-cube-front-invert').on('click', e => this.cube.mFront(CubeMoveAngle.CC90));
		
		$('#button-cube-front-stand').on('click', e => this.cube.mwFront(2));
		$('#dropdown-item-cube-front-stand-two').on('click', e => this.cube.mwFront(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-front-stand-invert').on('click', e => this.cube.mwFront(2, CubeMoveAngle.CC90));
		
		$('#button-cube-stand').on('click', e => null); //TODO: Implement
		$('#dropdown-item-cube-stand-two').on('click', e => null); //TODO: Implement
		$('#dropdown-item-cube-stand-invert').on('click', e => null); //TODO: Implement
		
		$('#button-cube-back-stand').on('click', e => this.cube.mwBack(2));
		$('#dropdown-item-cube-back-stand-two').on('click', e => this.cube.mwBack(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-back-stand-invert').on('click', e => this.cube.mwBack(2, CubeMoveAngle.CC90));
		
		$('#button-cube-back').on('click', e => this.cube.mBack());
		$('#dropdown-item-cube-back-two').on('click', e => this.cube.mBack(CubeMoveAngle.C180));
		$('#dropdown-item-cube-back-invert').on('click', e => this.cube.mBack(CubeMoveAngle.CC90));
		
		$('#button-cube-z').on('click', e => this.cube.rZ());
		$('#dropdown-item-cube-z-two').on('click', e => this.cube.rZ(CubeMoveAngle.C180));
		$('#dropdown-item-cube-z-invert').on('click', e => this.cube.rZ(CubeMoveAngle.CC90));
		
		$('#button-cube-left').on('click', e => this.cube.mLeft());
		$('#dropdown-item-cube-left-two').on('click', e => this.cube.mLeft(CubeMoveAngle.C180));
		$('#dropdown-item-cube-left-invert').on('click', e => this.cube.mLeft(CubeMoveAngle.CC90));
		
		$('#button-cube-left-middle').on('click', e => this.cube.mwLeft(2));
		$('#dropdown-item-cube-left-middle-two').on('click', e => this.cube.mwLeft(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-left-middle-invert').on('click', e => this.cube.mwLeft(2, CubeMoveAngle.CC90));
		
		$('#button-cube-middle').on('click', e => null); //TODO: Implement
		$('#dropdown-item-cube-middle-two').on('click', e => null); //TODO: Implement
		$('#dropdown-item-cube-middle-invert').on('click', e => null); //TODO: Implement
		
		$('#button-cube-right-middle').on('click', e => this.cube.mwRight(2));
		$('#dropdown-item-cube-right-middle-two').on('click', e => this.cube.mwRight(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-right-middle-invert').on('click', e => this.cube.mwRight(2, CubeMoveAngle.CC90));
		
		$('#button-cube-right').on('click', e => this.cube.mRight());
		$('#dropdown-item-cube-right-two').on('click', e => this.cube.mRight(CubeMoveAngle.C180));
		$('#dropdown-item-cube-right-invert').on('click', e => this.cube.mRight(CubeMoveAngle.CC90));
		
		$('#button-cube-x').on('click', e => this.cube.rX());
		$('#dropdown-item-cube-x-two').on('click', e => this.cube.rX(CubeMoveAngle.C180));
		$('#dropdown-item-cube-x-invert').on('click', e => this.cube.rX(CubeMoveAngle.CC90));
		
		$('#button-cube-up').on('click', e => this.cube.mUp());
		$('#dropdown-item-cube-up-two').on('click', e => this.cube.mUp(CubeMoveAngle.C180));
		$('#dropdown-item-cube-up-invert').on('click', e => this.cube.mUp(CubeMoveAngle.CC90));
		
		$('#button-cube-up-equator').on('click', e => this.cube.mwUp(2));
		$('#dropdown-item-cube-up-equator-two').on('click', e => this.cube.mwUp(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-up-equator-invert').on('click', e => this.cube.mwUp(2, CubeMoveAngle.CC90));
		
		$('#button-cube-equator').on('click', e => null); //TODO: Implement
		$('#dropdown-item-cube-equator-two').on('click', e => null); //TODO: Implement
		$('#dropdown-item-cube-equator-invert').on('click', e => null); //TODO: Implement
		
		$('#button-cube-down-equator').on('click', e => this.cube.mwDown(2));
		$('#dropdown-item-cube-down-equator-two').on('click', e => this.cube.mwDown(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-down-equator-invert').on('click', e => this.cube.mwDown(2, CubeMoveAngle.CC90));
		
		$('#button-cube-down').on('click', e => this.cube.mDown());
		$('#dropdown-item-cube-down-two').on('click', e => this.cube.mDown(CubeMoveAngle.C180));
		$('#dropdown-item-cube-down-invert').on('click', e => this.cube.mDown(CubeMoveAngle.CC90));
		
		$('#button-cube-y').on('click', e => this.cube.rY());
		$('#dropdown-item-cube-y-two').on('click', e => this.cube.rY(CubeMoveAngle.C180));
		$('#dropdown-item-cube-y-invert').on('click', e => this.cube.rY(CubeMoveAngle.CC90));
	
		$('#button-cube-shuffle').on('click', e => null); //TODO: Implement
	}

	hideLoader(): void {
		$('#loader').empty();
		$('#loader').fadeOut(300);
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