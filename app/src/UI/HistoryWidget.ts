import { html } from "./Html";
import $ from "jquery";
import { Ui } from "./Ui";
import { CubeMoveStringifier } from "@cube-codes/cube-codes-model";
import { CubeHistoryChange } from "../Cube History/CubeHistoryChange";

export class HistoryWidget {

	constructor(private readonly ui: Ui) {

		this.markup();
		this.setupModelListeners();
		this.setupActions();
		this.setupBlocking();
		
	}

	private markup() {

		$(html`
<main id="history">
	<aside class="btn-toolbar">
		<div class="btn-group btn-group-sm">
			<button type="button" id="history-jump-start" class="btn btn-primary"
				title="Jump to start"><img src="images/bootstrap-icons/skip-backward-fill.svg" /></button>
			<button type="button" id="history-play-back" class="btn btn-primary"
				title="Play back"><img class="flip" src="images/bootstrap-icons/play-fill.svg" /></button>
			<button type="button" id="history-step-back" class="btn btn-primary"
				title="Play step back"><img src="images/bootstrap-icons/skip-start-fill.svg" /></button>
			<button type="button" id="history-abort" class="btn btn-danger" title="Abort playing"
				disabled="true"><img src="images/bootstrap-icons/stop-fill.svg" /></button>
			<button type="button" id="history-step-ahead" class="btn btn-primary"
				title="Play step ahead"><img src="images/bootstrap-icons/skip-end-fill.svg" /></button>
			<button type="button" id="history-play-ahead" class="btn btn-primary"
				title="Play ahead"><img src="images/bootstrap-icons/play-fill.svg" /></button>
			<button type="button" id="history-jump-end" class="btn btn-primary"
				title="Jump to end"><img src="images/bootstrap-icons/skip-forward-fill.svg" /></button>
		</div>
		<div class="btn-group btn-group-sm ml-2">
			<button type="button" id="history-clean-past" class="btn btn-secondary"
				title="Clean past"><img src="images/bootstrap-icons/backspace-fill.svg" /></button>
			<button type="button" id="history-clean-future" class="btn btn-secondary"
				title="Clean future"><img
					src="images/bootstrap-icons/backspace-reverse-fill.svg" /></button>
		</div>
		<div class="btn-group btn-group-sm ml-auto">
			<button type="button" id="history-lock-scroll" class="btn btn-secondary active"
				data-toggle="button" aria-pressed="true" title="Lock scrolling"><img
					src="images/bootstrap-icons/chevron-bar-down.svg" /></button>
		</div>
	</aside>
	<main id="history-changes"></main>
</main>`).appendTo('#section-2');

	}

	private setupModelListeners() {

		const cubeMoveStringifier = new CubeMoveStringifier(this.ui.initialAppState.cubeSpec);

		const addChange = (c: CubeHistoryChange) => {
			$('#history-changes').append(`<span class="badge badge-light">${c.move ? cubeMoveStringifier.stringify([c.move]) : 'Beamed'}</span>`);
		}

		const syncCurrent = () => {
			$('#history-changes > span.current').removeClass('current');
			$(`#history-changes > span:nth-child(${this.ui.cubeHistory.getCurrentPosition() + 2})`).addClass('current');
			if($('#history-lock-scroll').hasClass('active')) {
				$('#history-changes').first().scrollTop($('#history-changes').first().scrollTop()! + $('#history-changes > span.current').position().top);
			}
		};

		$('#history-changes').append('<span class="badge badge-light current">Initial</span>');
		this.ui.cubeHistory.changes.forEach(addChange);
		syncCurrent();

		this.ui.cubeHistory.moved.on(e => {
			syncCurrent();
		});
		this.ui.cubeHistory.recorded.on(e => {
			addChange(e.change);
		});
		this.ui.cubeHistory.pastCleaned.on(e => {
			$('#history-changes').children().slice(0, e.before + 1).remove();
			$('#history-changes > span:first-child').html('Initial');
			syncCurrent();
		});
		this.ui.cubeHistory.futureCleaned.on(e => {
			$('#history-changes').children().slice(e.after + 2).remove();
			syncCurrent();
		});

	}

	private setupActions() {

		$('#history-changes'     ).on('click', 'span', e => this.ui.cubeHistory.jumpToPosition($(e.target).index() - 1));
		$('#history-jump-start'  ).on('click', e => this.ui.cubeHistory.jumpToStart());
		$('#history-jump-end'    ).on('click', e => this.ui.cubeHistory.jumpToEnd());
		$('#history-step-back'   ).on('click', e => this.ui.cubeHistory.stepBack());
		$('#history-step-ahead'  ).on('click', e => this.ui.cubeHistory.stepAhead());
		$('#history-play-back'   ).on('click', e => this.ui.cubeHistory.playBack());
		$('#history-play-ahead'  ).on('click', e => this.ui.cubeHistory.playAhead());
		$('#history-clean-past'  ).on('click', e => this.ui.cubeHistory.cleanPastBefore(this.ui.cubeHistory.getCurrentPosition()));
		$('#history-clean-future').on('click', e => this.ui.cubeHistory.cleanFutureAfter(this.ui.cubeHistory.getCurrentPosition()));

	}

	private setupBlocking() {
	
		//TODO: Also stop button and listen for editor run

		const updateHistoryButtons = () => {
			$('#history-jump-start'  ).prop('disabled', this.ui.cubeHistory.isAtStart());
			$('#history-play-back'   ).prop('disabled', this.ui.cubeHistory.isAtStart());
			$('#history-step-back'   ).prop('disabled', this.ui.cubeHistory.isAtStart());
			$('#history-step-ahead'  ).prop('disabled', this.ui.cubeHistory.isAtEnd());
			$('#history-play-ahead'  ).prop('disabled', this.ui.cubeHistory.isAtEnd());
			$('#history-jump-end'    ).prop('disabled', this.ui.cubeHistory.isAtEnd());
		};
		this.ui.cubeHistory.moved.on(updateHistoryButtons);
		this.ui.cubeHistory.pastCleaned.on(updateHistoryButtons);
		this.ui.cubeHistory.futureCleaned.on(updateHistoryButtons);
		updateHistoryButtons();

	}

}