import { Cube, CubeMoveAngle, CubeSolutionCondition, CubeSolutionConditionType, CubeSpecification, CubeState } from "@cube-codes/cube-codes-model";
import { CubeVisualizer } from "@cube-codes/cube-codes-visualizer";
import { Level } from "../../common/src/Level";
import { Toast } from "bootstrap"
import { ProgramManager } from ".//Manager/ProgramManager";
import { ProgramManagerState } from "./Manager/ProgramManagerState";
import $ from "jquery";
import * as A from 'ace-builds';
import { Mode as JavascriptMode } from "ace-builds/src-noconflict/mode-javascript"
import { Search } from "ace-builds/src-noconflict/ext-searchbox"
import { CubeHistory } from "./Cube History/CubeHistory";

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

	// @ts-ignore
	private readonly visualizer: CubeVisualizer

	private editor?: A.Ace.Editor

	constructor() {

		const spec = new CubeSpecification(3);
		const solutionCondition = new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
		this.cube = new Cube(spec, solutionCondition);
		this.cubeHistory = new CubeHistory(this.cube);
		this.programManager = new ProgramManager(this);
		this.visualizer = new CubeVisualizer(this.cube, document.getElementById('cube-display') as HTMLCanvasElement, 500);

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
		this.editor = A.edit('editor');
		this.editor.setOptions({
			mode: new JavascriptMode(),
			newLineMode: 'unix',
			useSoftTabs: false,
			tabSize: 4,
			dragEnabled: false,
			showPrintMargin: false,
			theme: 'ace/theme/textmate',
			fixedWidthGutter: true
		});
		this.editor.getSession().setUseWorker(false);
		this.editor.setFontSize('12px');
		let fontSize = 12;
		this.editor.renderer.setScrollMargin(6, 0, 0, 0);
		this.editor.on('input', () => {
			$('#button-editor-undo').prop('disabled', !this.editor?.session.getUndoManager().canUndo());
			$('#button-editor-redo').prop('disabled', !this.editor?.session.getUndoManager().canRedo());
		});

		this.programManager.stateChanged.on(e => {
			const running = e.newState !== ProgramManagerState.IDLE;
			$('#button-editor-abort'   ).prop('disabled', !running);
			$('#button-editor-run'     ).prop('disabled', running);
			$('#button-editor-run-fast').prop('disabled', running);
		})
		
		$('#button-editor-abort'          ).on('click', e => this.programManager.abort());
		$('#button-editor-run'            ).on('click', e => this.programManager.start(this.editor?.getValue() as string, true));
		$('#button-editor-run-fast'       ).on('click', e => this.programManager.start(this.editor?.getValue() as string, false));
		$('#button-editor-undo'           ).on('click', e => this.editor?.undo());
		$('#button-editor-redo'           ).on('click', e => this.editor?.redo());
		$('#button-editor-search'         ).on('click', e => new Search(this.editor, false));
		$('#button-editor-show-invisibles').on('click', e => this.editor?.setOption('showInvisibles', !this.editor.getOption('showInvisibles')));
		$('#button-editor-font-increase'  ).on('click', e => { fontSize = Math.floor(fontSize * 1.2); this.editor?.setFontSize(`${fontSize}px`); $('#editor, #logger').attr('style', `font-size: ${fontSize}px !important`); });
		$('#button-editor-font-decrease'  ).on('click', e => { fontSize = Math.floor(fontSize / 1.2); this.editor?.setFontSize(`${fontSize}px`); $('#editor, #logger').attr('style', `font-size: ${fontSize}px !important`); });
		$('#button-editor-clean'          ).on('click', e => $('#logger').empty());
	
	}

	initHistory(): void {
		
		// Display Cube History Moves
	
		this.cubeHistory.moved.on(e => { $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (this.cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); });
		this.cubeHistory.recorded.on(e => { $('#section-history-changes').append('<span class="badge badge-light">' + (e.change.move ? this.cube.getCubeMoveExporter().stringify([e.change.move]) : 'New State') + '</span>'); if($('#button-history-lock-scroll').hasClass('active')) { $('#section-history-changes').scrollTop($('#section-history-changes').prop("scrollHeight")); } });
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
		$('#button-history-play-back'   ).on('click', e => this.cubeHistory.playBack());
		$('#button-history-play-ahead'  ).on('click', e => this.cubeHistory.playAhead());
		$('#button-history-clean-past'  ).on('click', e => this.cubeHistory.cleanPastBefore(this.cubeHistory.getCurrentPosition()));
		$('#button-history-clean-future').on('click', e => this.cubeHistory.cleanFutureAfter(this.cubeHistory.getCurrentPosition()));
	
	}

	initControls(): void {
		
		$('#button-cube-left').on('click', e => this.cube.mLeft());
		$('#dropdown-item-cube-left-two').on('click', e => this.cube.mLeft(CubeMoveAngle.C180));
		$('#dropdown-item-cube-left-invert').on('click', e => this.cube.mLeft(CubeMoveAngle.CC90));
		
		$('#button-cube-left-middle').on('click', e => this.cube.mLeftBlock());
		$('#dropdown-item-cube-left-middle-two').on('click', e => this.cube.mLeftBlock(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-left-middle-invert').on('click', e => this.cube.mLeftBlock(2, CubeMoveAngle.CC90));
		
		$('#button-cube-middle').on('click', e => this.cube.mMiddle());
		$('#dropdown-item-cube-middle-two').on('click', e => this.cube.mMiddle(CubeMoveAngle.C180));
		$('#dropdown-item-cube-middle-invert').on('click', e => this.cube.mMiddle(CubeMoveAngle.CC90));
		
		$('#button-cube-right-middle').on('click', e => this.cube.mRightBlock());
		$('#dropdown-item-cube-right-middle-two').on('click', e => this.cube.mRightBlock(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-right-middle-invert').on('click', e => this.cube.mRightBlock(2, CubeMoveAngle.CC90));
		
		$('#button-cube-right').on('click', e => this.cube.mRight());
		$('#dropdown-item-cube-right-two').on('click', e => this.cube.mRight(CubeMoveAngle.C180));
		$('#dropdown-item-cube-right-invert').on('click', e => this.cube.mRight(CubeMoveAngle.CC90));
		
		$('#button-cube-x').on('click', e => this.cube.mX());
		$('#dropdown-item-cube-x-two').on('click', e => this.cube.mX(CubeMoveAngle.C180));
		$('#dropdown-item-cube-x-invert').on('click', e => this.cube.mX(CubeMoveAngle.CC90));
		
		$('#button-cube-up').on('click', e => this.cube.mUp());
		$('#dropdown-item-cube-up-two').on('click', e => this.cube.mUp(CubeMoveAngle.C180));
		$('#dropdown-item-cube-up-invert').on('click', e => this.cube.mUp(CubeMoveAngle.CC90));
		
		$('#button-cube-up-equator').on('click', e => this.cube.mUpBlock());
		$('#dropdown-item-cube-up-equator-two').on('click', e => this.cube.mUpBlock(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-up-equator-invert').on('click', e => this.cube.mUpBlock(2, CubeMoveAngle.CC90));
		
		$('#button-cube-equator').on('click', e => this.cube.mEquator());
		$('#dropdown-item-cube-equator-two').on('click', e => this.cube.mEquator(CubeMoveAngle.C180));
		$('#dropdown-item-cube-equator-invert').on('click', e => this.cube.mEquator(CubeMoveAngle.CC90));
		
		$('#button-cube-down-equator').on('click', e => this.cube.mDownBlock());
		$('#dropdown-item-cube-down-equator-two').on('click', e => this.cube.mDownBlock(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-down-equator-invert').on('click', e => this.cube.mDownBlock(2, CubeMoveAngle.CC90));
		
		$('#button-cube-down').on('click', e => this.cube.mDown());
		$('#dropdown-item-cube-down-two').on('click', e => this.cube.mDown(CubeMoveAngle.C180));
		$('#dropdown-item-cube-down-invert').on('click', e => this.cube.mDown(CubeMoveAngle.CC90));
		
		$('#button-cube-y').on('click', e => this.cube.mY());
		$('#dropdown-item-cube-y-two').on('click', e => this.cube.mY(CubeMoveAngle.C180));
		$('#dropdown-item-cube-y-invert').on('click', e => this.cube.mY(CubeMoveAngle.CC90));

		$('#button-cube-front').on('click', e => this.cube.mFront());
		$('#dropdown-item-cube-front-two').on('click', e => this.cube.mFront(CubeMoveAngle.C180));
		$('#dropdown-item-cube-front-invert').on('click', e => this.cube.mFront(CubeMoveAngle.CC90));
		
		$('#button-cube-front-stand').on('click', e => this.cube.mFrontBlock());
		$('#dropdown-item-cube-front-stand-two').on('click', e => this.cube.mFrontBlock(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-front-stand-invert').on('click', e => this.cube.mFrontBlock(2, CubeMoveAngle.CC90));
		
		$('#button-cube-stand').on('click', e => this.cube.mStand());
		$('#dropdown-item-cube-stand-two').on('click', e => this.cube.mStand(CubeMoveAngle.C180));
		$('#dropdown-item-cube-stand-invert').on('click', e => this.cube.mStand(CubeMoveAngle.CC90));
		
		$('#button-cube-back-stand').on('click', e => this.cube.mBackBlock());
		$('#dropdown-item-cube-back-stand-two').on('click', e => this.cube.mBackBlock(2, CubeMoveAngle.C180));
		$('#dropdown-item-cube-back-stand-invert').on('click', e => this.cube.mBackBlock(2, CubeMoveAngle.CC90));
		
		$('#button-cube-back').on('click', e => this.cube.mBack());
		$('#dropdown-item-cube-back-two').on('click', e => this.cube.mBack(CubeMoveAngle.C180));
		$('#dropdown-item-cube-back-invert').on('click', e => this.cube.mBack(CubeMoveAngle.CC90));
		
		$('#button-cube-z').on('click', e => this.cube.mZ());
		$('#dropdown-item-cube-z-two').on('click', e => this.cube.mZ(CubeMoveAngle.C180));
		$('#dropdown-item-cube-z-invert').on('click', e => this.cube.mZ(CubeMoveAngle.CC90));
	
		$('#dropdown-cube-shuffle-move-set').on('click', async e => { const cubeClone = this.cube.clone(); await cubeClone.shuffleByMove(50); this.cube.setState(cubeClone.getState()); });
		$('#dropdown-cube-shuffle-move-play').on('click', e => this.cube.shuffleByMove(50));
		$('#button-cube-reset').on('click', e => this.cube.setState(CubeState.fromSolved(this.cube.spec, this.cube.solutionCondition)));

		const updateAnimationDuration = (d: number) => ((e: JQuery.ClickEvent<HTMLElement, undefined, HTMLElement, HTMLElement>) => { $(e.target).siblings().removeClass('checked'); $(e.target).addClass('checked'); this.visualizer.animationDuration = d; })
		$('#dropdown-cube-speed-none').on('click', updateAnimationDuration(0));
		$('#dropdown-cube-speed-quick').on('click', updateAnimationDuration(200));
		$('#dropdown-cube-speed-normal').on('click', updateAnimationDuration(500));
		$('#dropdown-cube-speed-slow').on('click', updateAnimationDuration(1000));

		$('#button-view-reset').on('click', e => this.visualizer.resetCamera());

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
			date = '[' + new Date().toLocaleTimeString('en-GB') + '] ';
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