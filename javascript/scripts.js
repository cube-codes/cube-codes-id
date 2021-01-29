'use strict';

window.addEventListener('beforeunload', e => event.returnValue = 'Are you sure you want to leave?');

$(function() {

	startApplication();

});

const hideLoader = () => {

	$('#loader').empty();
	$('#loader').fadeOut(300);

};

const startApplication = () => {

	// Cube

	const cubeSpec = new CCI.CubeSpecification(3);
	const cube = new CCI.Cube(new CCI.CubeState(cubeSpec, 0));
	cube.stateChanged.on(e => console.log('Event: cube.change', e));

	// Editor

	const editor = ace.edit('editor', {
		mode: 'ace/mode/javascript',
		newLineMode: 'unix',
		useSoftTabs: false,
		tabSize: 4,
		dragEnabled: false,
		showPrintMargin: false,
		theme: 'ace/theme/textmate',
		fixedWidthGutter: true
	});
	editor.fontsize = 12;
	editor.renderer.setScrollMargin(6, 0, 0, 0);
	editor.on('input', e => {
		$('#button-editor-undo').prop('disabled', !editor.session.getUndoManager().hasUndo());
		$('#button-editor-redo').prop('disabled', !editor.session.getUndoManager().hasRedo());
	});

	const ui = new CCI.Ui(cube);
	const programManager = new CCI.ProgramManager(ui);
	programManager.stateChanged.on(e => {
		const running = e.newState !== CCI.ProgramManagerState.IDLE;
		$('#button-editor-abort'   ).prop('disabled', !running);
		$('#button-editor-run'     ).prop('disabled', running);
		$('#button-editor-run-fast').prop('disabled', running);
	})
	
	$('#button-editor-abort'          ).on('click', e => programManager.abort());
	$('#button-editor-run'            ).on('click', e => programManager.start(editor.getValue(), 300));
	$('#button-editor-run-fast'       ).on('click', e => programManager.start(editor.getValue(), 0));
	$('#button-editor-undo'           ).on('click', e => editor.undo());
	$('#button-editor-redo'           ).on('click', e => editor.redo());
	$('#button-editor-search'         ).on('click', e => editor.execCommand('find'));
	$('#button-editor-show-invisibles').on('click', e => editor.setOption('showInvisibles', !editor.getOption('showInvisibles')));
	$('#button-editor-font-increase'  ).on('click', e => { editor.fontsize = Math.floor(editor.fontsize * 1.2); $('#editor, #logger').attr('style', `font-size: ${editor.fontsize}px !important`); });
	$('#button-editor-font-decrease'  ).on('click', e => { editor.fontsize = Math.floor(editor.fontsize / 1.2); $('#editor, #logger').attr('style', `font-size: ${editor.fontsize}px !important`); });
	$('#button-editor-clean'          ).on('click', e => $('#logger').empty());
	
	// Display Cube State

	cube.stateChanged.on(e => $('#section-cube-display').html(e.newState.value));
	$('#section-cube-display').html(cube.getState().value);
	
	// Cube History

	const cubeHistory = new CCI.CubeHistory(cube);
	cubeHistory.moved.on(e => console.log('Event: cubeHistory.moved', e));
	cubeHistory.recorded.on(e => console.log('Event: cubeHistory.recorded', e));
	cubeHistory.pastCleaned.on(e => console.log('Event: cubeHistory.pastCleaned', e));
	cubeHistory.futureCleaned.on(e => console.log('Event: cubeHistory.futureCleaned', e));
	
	// Display Cube History Moves

	cubeHistory.moved.on(e => { $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); });
	cubeHistory.recorded.on(e => { $('#section-history-changes').append('<span class="badge badge-light">' + (e.change.move ? cube.getMoveLanguage().stringify([e.change.move]) : 'Manual') + '</span>'); if($('#button-history-lock-scroll').hasClass('active')) { $('#section-history-changes').scrollTop($('#section-history-changes').prop("scrollHeight")); } });
	cubeHistory.pastCleaned.on(e => { $('#section-history-changes').children().slice(0, e.before + 1).remove(); $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); $('#section-history-changes > span:first-child').html('Initial'); });
	cubeHistory.futureCleaned.on(e => { $('#section-history-changes').children().slice(e.after + 2).remove(); $('#section-history-changes > span.current').removeClass('current'); $('#section-history-changes > span:nth-child(' + (cubeHistory.getCurrentPosition() + 2) + ')').addClass('current'); });
	$('#section-history-changes').append('<span class="badge badge-light current">Initial</span>');
	
	// Update Cube History Controls

	const updateHistoryButtons = () => {
		$('#button-history-jump-start'  ).prop('disabled', cubeHistory.isAtStart());
		$('#button-history-play-back'   ).prop('disabled', cubeHistory.isAtStart());
		$('#button-history-step-back'   ).prop('disabled', cubeHistory.isAtStart());
		$('#button-history-step-ahead'  ).prop('disabled', cubeHistory.isAtEnd());
		$('#button-history-play-ahead'  ).prop('disabled', cubeHistory.isAtEnd());
		$('#button-history-jump-end'    ).prop('disabled', cubeHistory.isAtEnd());
	};
	cubeHistory.moved.on(updateHistoryButtons);
	cubeHistory.pastCleaned.on(updateHistoryButtons);
	cubeHistory.futureCleaned.on(updateHistoryButtons);
	updateHistoryButtons();
	
	// Cube History Click

	$('#section-history-changes').on('click', 'span', e => cubeHistory.jumpToIndex($(e.target).index() - 1));

	// Cube History Controls

	$('#button-history-jump-start'  ).on('click', e => cubeHistory.jumpToStart());
	$('#button-history-jump-end'    ).on('click', e => cubeHistory.jumpToEnd());
	$('#button-history-step-back'   ).on('click', e => cubeHistory.stepBack());
	$('#button-history-step-ahead'  ).on('click', e => cubeHistory.stepAhead());
	$('#button-history-clean-past'  ).on('click', e => cubeHistory.cleanPastBefore(cubeHistory.getCurrentPosition()));
	$('#button-history-clean-future').on('click', e => cubeHistory.cleanFutureAfter(cubeHistory.getCurrentPosition()));
	
	// Cube Controls

	$('#button-cube-front').on('click', e => cube.mFront());
	$('#dropdown-item-cube-front-two').on('click', e => cube.mFront(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-front-invert').on('click', e => cube.mFront(CCM.CubeAngle.CC90));
	
	$('#button-cube-front-stand').on('click', e => cube.mwFront(2));
	$('#dropdown-item-cube-front-stand-two').on('click', e => cube.mwFront(2, CCM.CubeAngle.C180));
	$('#dropdown-item-cube-front-stand-invert').on('click', e => cube.mwFront(2, CCM.CubeAngle.CC90));
	
	$('#button-cube-stand').on('click', e => null); //TODO: Implement
	$('#dropdown-item-cube-stand-two').on('click', e => null); //TODO: Implement
	$('#dropdown-item-cube-stand-invert').on('click', e => null); //TODO: Implement
	
	$('#button-cube-back-stand').on('click', e => cube.mwBack(2));
	$('#dropdown-item-cube-back-stand-two').on('click', e => cube.mwBack(2, CCM.CubeAngle.C180));
	$('#dropdown-item-cube-back-stand-invert').on('click', e => cube.mwBack(2, CCM.CubeAngle.CC90));
	
	$('#button-cube-back').on('click', e => cube.mBack());
	$('#dropdown-item-cube-back-two').on('click', e => cube.mBack(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-back-invert').on('click', e => cube.mBack(CCM.CubeAngle.CC90));
	
	$('#button-cube-z').on('click', e => cube.rZ());
	$('#dropdown-item-cube-z-two').on('click', e => cube.rZ(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-z-invert').on('click', e => cube.rZ(CCM.CubeAngle.CC90));
	
	$('#button-cube-left').on('click', e => cube.mLeft());
	$('#dropdown-item-cube-left-two').on('click', e => cube.mLeft(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-left-invert').on('click', e => cube.mLeft(CCM.CubeAngle.CC90));
	
	$('#button-cube-left-middle').on('click', e => cube.mwLeft(2));
	$('#dropdown-item-cube-left-middle-two').on('click', e => cube.mwLeft(2, CCM.CubeAngle.C180));
	$('#dropdown-item-cube-left-middle-invert').on('click', e => cube.mwLeft(2, CCM.CubeAngle.CC90));
	
	$('#button-cube-middle').on('click', e => null); //TODO: Implement
	$('#dropdown-item-cube-middle-two').on('click', e => null); //TODO: Implement
	$('#dropdown-item-cube-middle-invert').on('click', e => null); //TODO: Implement
	
	$('#button-cube-right-middle').on('click', e => cube.mwRight(2));
	$('#dropdown-item-cube-right-middle-two').on('click', e => cube.mwRight(2, CCM.CubeAngle.C180));
	$('#dropdown-item-cube-right-middle-invert').on('click', e => cube.mwRight(2, CCM.CubeAngle.CC90));
	
	$('#button-cube-right').on('click', e => cube.mRight());
	$('#dropdown-item-cube-right-two').on('click', e => cube.mRight(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-right-invert').on('click', e => cube.mRight(CCM.CubeAngle.CC90));
	
	$('#button-cube-x').on('click', e => cube.rX());
	$('#dropdown-item-cube-x-two').on('click', e => cube.rX(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-x-invert').on('click', e => cube.rX(CCM.CubeAngle.CC90));
	
	$('#button-cube-up').on('click', e => cube.mUp());
	$('#dropdown-item-cube-up-two').on('click', e => cube.mUp(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-up-invert').on('click', e => cube.mUp(CCM.CubeAngle.CC90));
	
	$('#button-cube-up-equator').on('click', e => cube.mwUp(2));
	$('#dropdown-item-cube-up-equator-two').on('click', e => cube.mwUp(2, CCM.CubeAngle.C180));
	$('#dropdown-item-cube-up-equator-invert').on('click', e => cube.mwUp(2, CCM.CubeAngle.CC90));
	
	$('#button-cube-equator').on('click', e => null); //TODO: Implement
	$('#dropdown-item-cube-equator-two').on('click', e => null); //TODO: Implement
	$('#dropdown-item-cube-equator-invert').on('click', e => null); //TODO: Implement
	
	$('#button-cube-down-equator').on('click', e => cube.mwDown(2));
	$('#dropdown-item-cube-down-equator-two').on('click', e => cube.mwDown(2, CCM.CubeAngle.C180));
	$('#dropdown-item-cube-down-equator-invert').on('click', e => cube.mwDown(2, CCM.CubeAngle.CC90));
	
	$('#button-cube-down').on('click', e => cube.mDown());
	$('#dropdown-item-cube-down-two').on('click', e => cube.mDown(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-down-invert').on('click', e => cube.mDown(CCM.CubeAngle.CC90));
	
	$('#button-cube-y').on('click', e => cube.rY());
	$('#dropdown-item-cube-y-two').on('click', e => cube.rY(CCM.CubeAngle.C180));
	$('#dropdown-item-cube-y-invert').on('click', e => cube.rY(CCM.CubeAngle.CC90));

	$('#button-cube-shuffle').on('click', e => null); //TODO: Implement

	hideLoader();

};