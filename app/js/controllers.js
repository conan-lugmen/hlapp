// Creation Date: 13 Jul 2013
// Author: Fernando Canizo (aka conan) - http://conan.muriandre.com/


'use strict';

var hlApp = angular.module('hlApp.controllers', []);

hlApp.factory('hlData', function() {
	return {
		config: {
			defaultUser: 'guest',
			defaultColor: 'blue'
		},
		user: 'guest',
		color: 'blue',
		text: '',
		ranges: []
	};
});


hlApp.controller('chooseTextCtrl', function($scope, $http, $location, hlData) {
	// hardcoded to be inline with mockapi
	$scope.texts = [
		{id: 1, title: 'Text with two previous selections'},
		{id: 2, title: 'Pristine text'},
		{id: 3, title: 'Text with overlapping selections'}
		];

	$scope.setChoosen = function() {
		$http.get('/~conan/mockapi/guest/' + $scope.choosenText.id + '/').success(function(data, status, headers, config) {
			if(200 == status) {
				hlData.text = data.text;
				hlData.ranges = data.ranges;
				$location.path('/hlapp');

			} else {
				console.debug('No data receive from mockapi :(');
			}
		});
	}
});


hlApp.controller('hlAppCtrl', function($scope, hlData) {
	// wont work without Range
	if(! document.implementation.hasFeature("Range", "2.0")) {
		$scope.text = "Browser doesn't support ranges, get a better browser to try this please.";
		return;
	}

	$scope.text = hlData.text;
	$scope.ranges = hlData.ranges;

	if(0 === $scope.ranges.length) {
		// pristine text

	} else {
		// set previous selections
		var previousEnd = 0;

		$scope.ranges.forEach(function(humanRange) { // my ranges are simpler than Range object, hence "human"
			var span = document.createElement("span");
			if(previousEnd > humanRange.start) // there's overlapping
				span.className = 'overlapped';
			else
				span.className = 'selected';

			previousEnd = humanRange.end;

			var selectionArea = document.getElementById('selectionArea');
			console.debug('children ', selectionArea.firstChild.length);
			var startNode = selectionArea.firstChild; // we want the text node or we'll get:
				// Exception "Index or size is negative or greater than the allowed amount"

			var ranger = document.createRange();
//			ranger.setStart(startNode, 0);
//			ranger.setEnd(startNode, 2);
console.debug(startNode);
console.debug(ranger);
//			ranger.surroundContents(span);

		});
	}


			var selectionArea = document.getElementById('selectionArea');
			console.debug('again ', selectionArea.firstChild.length);
	$scope.hlSection = function() {
		var selection = util.snapSelectionToWord(); // expand selection to select full words only
		if(0 === selection.rangeCount) return; // context object's range is null

		var selectedRange = selection.getRangeAt(0);

		// if offsets are equal, then there's no selection done
		// either this is a first click on a double click word-selection sequence (we want the second, not this)
		// or user clicked a character
		if(selectedRange.startOffset === selectedRange.endOffset) return;

		var span = document.createElement("span");
		span.className = 'selected';

		if(selectedRange.startContainer === selectedRange.endContainer) { // contents' inside one element
			selectedRange.surroundContents(span);

		} else { // if selection across block-elements, surroundContents() will fail
			console.debug('Selection across elements'); // when they are block level elements, like <p>, this wont work
			// TODO solve it!

			// this didn't work
//			var startRange = selectedRange.cloneRange();
//			startRange.setStart(selectedRange.startContainer, selectedRange.startOffset);
//			startRange.setEnd(selectedRange.startContainer, selectedRange.startContainer.data.length - 1);
//			startRange.surroundContents(span);

//			var endRange = selectedRange.cloneRange();
//			endRange.setStart(selectedRange.endContainer, 0);
//			endRange.setEnd(selectedRange.endContainer, selectedRange.endOffset);
//			endRange.surroundContents(span);

			// enterit solution: (works because he used <br>'s)
			span.appendChild(selectedRange.extractContents());
			selectedRange.insertNode(span);

			// then he cycles through <span>'s and change colors. But that
			// doesn't really tell you when there's an overlap (though it will
			// colorize an overlapping section perfectly, because there's a
			// festival of colors). Question is: with this method, how would
			// one distinguish overlapped strings from two touching strings?

		}
	}
});


hlApp.controller('configCtrl', function($scope, hlData) {
	hlData.user = $scope.user;
});


////////////////////////////////////////////////////////////////////////////////
// utility functions, TODO: move out to their own file
////////////////////////////////////////////////////////////////////////////////

var util = {};

util.snapSelectionToWord = function() {
	// courtesy of Tim Down (http://www.timdown.co.uk/)
	// http://stackoverflow.com/questions/7380190/select-whole-word-with-getselection

	var sel;

	// Check for existence of window.getSelection() and that it has a
	// modify() method. IE 9 has both selection APIs but no modify() method.
	if (window.getSelection && (sel = window.getSelection()).modify) {
		sel = window.getSelection();
		if (!sel.isCollapsed) {

			// Detect if selection is backwards
			var range = document.createRange();
			range.setStart(sel.anchorNode, sel.anchorOffset);
			range.setEnd(sel.focusNode, sel.focusOffset);
			var backwards = range.collapsed;
			range.detach();

			// modify() works on the focus of the selection
			var endNode = sel.focusNode, endOffset = sel.focusOffset;
			sel.collapse(sel.anchorNode, sel.anchorOffset);

			var direction = [];
			if (backwards) {
				direction = ['backward', 'forward'];
			} else {
				direction = ['forward', 'backward'];
			}

			sel.modify("move", direction[0], "character");
			sel.modify("move", direction[1], "word");
			sel.extend(endNode, endOffset);
			sel.modify("extend", direction[1], "character");
			sel.modify("extend", direction[0], "word");
		}

	} else if ( (sel = document.selection) && sel.type != "Control") {
		// coverage for older IE browsers :(
		var textRange = sel.createRange();
		if (textRange.text) {
			textRange.expand("word");
			// Move the end back to not include the word's trailing space(s),
			// if necessary
			while (/\s$/.test(textRange.text)) {
				textRange.moveEnd("character", -1);
			}
			textRange.select();
		}
	}

	return sel;
}
