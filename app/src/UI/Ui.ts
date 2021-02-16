import { HeaderWidget } from "./HeaderWidget";
import { Cube } from "@cube-codes/cube-codes-model";
import { CubeHistory } from "../Cube History/CubeHistory";
import { EditorWidget } from "./EditorWidget";
import { ProgramManager } from "../Manager/ProgramManager";
import { HistoryWidget } from "./HistoryWidget";
import { AppState, AutomaticActionType } from "../AppState/AppState";
import { CubeWidget } from "./CubeWidget";
import { Toast } from "bootstrap";
import { html } from "./Html";
import { BootstrapInfo } from "./BootstrapInfo";
import { Level } from "../../../common/src/Level";
import $ from "jquery";
import "flex-splitter-directive";

export class Ui {

	readonly cube: Cube

	readonly cubeHistory: CubeHistory

	readonly programManager: ProgramManager

	#editorWidget?: EditorWidget

	constructor(readonly initialAppState: AppState, afterSetupActions: Array<(ui: Ui) => void>) {
		
		// Cube Model
		this.cube = new Cube(this.initialAppState.cubeSpec, this.initialAppState.cubeSolutionCondition, this.initialAppState.cubeHistoryInitialState);
		
		// Services
		this.cubeHistory = new CubeHistory(this.cube);
		this.programManager = new ProgramManager(this);

		this.cubeHistory.restoreChanges(this.initialAppState.cubeHistoryEntries, this.initialAppState.cubeHistoryCurrentPosition).then(async () => {

			// Widgets
			new HeaderWidget(this);
			new CubeWidget(this);
			this.#editorWidget = new EditorWidget(this);
			new HistoryWidget(this);

			await new Promise(r => setTimeout(r, 1000));
			$('#loader').empty();
			$('#loader').fadeOut(300);

			await new Promise(r => setTimeout(r, 400));
			afterSetupActions.forEach(a => a.call(null, this));
			
			await new Promise(r => setTimeout(r, 400));
			this.runAutomaticAction()

		});

	}

	get editorWidget(): EditorWidget {
		if(this.#editorWidget === undefined) throw new Error('Editor Widget not ready yet');
		return this.#editorWidget;
	}

	runAutomaticAction() {
		const automaticActionsByType = new Map<AutomaticActionType, (ui: Ui) => void>([
			['none', u => {}],
			['editorRun', u => this.editorWidget.run()],
			['editorRunFast', u => this.editorWidget.runFast()],
			['historyStepAhead', u => this.cubeHistory.stepAhead()],
			['historyStepBack', u => this.cubeHistory.stepBack()],
			['historyPlayAhead', u => this.cubeHistory.playAhead()],
			['historyPlayBack', u => this.cubeHistory.playBack()]
		]);
		const automaticAction = automaticActionsByType.get(this.initialAppState.automaticActionType);
		if(automaticAction === undefined) throw new Error(`Invalid automatic action type: ${this.initialAppState.automaticActionType}`);
		automaticAction.call(this, this);
	}

	overlay(title: string, message: string = '', level: Level = Level.INFO, duration: number = 3000): void {
		
		const color = BootstrapInfo.COLOR_CLASSES_BY_LEVEL.get(level)!;
		const icon = BootstrapInfo.ICONS_BY_LEVEL.get(level)!;

		const toastElement = $(html`<div class="toast bg-${color} text-light" data-delay="${duration.toString()}"><div class="toast-header"><img src="images/bootstrap-icons/${icon}" /><strong>${title}</strong><button type="button" class="ml-auto close" data-dismiss="toast" title="Close message">×</button></div><div class="toast-body">${message}</div></div>`).appendTo('#toast-zone');
		toastElement.on('hidden.bs.toast', () => {
			toastElement.remove();
		});

		const toast = new Toast(toastElement.get(0));
		toast.show();

	}

}