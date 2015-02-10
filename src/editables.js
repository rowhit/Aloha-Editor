/**
 * editables.js is part of Aloha Editor project http://www.alohaeditor.org
 *
 * Aloha Editor ● JavaScript Content Editing Library
 * Copyright (c) 2010-2015 Gentics Software GmbH, Vienna, Austria.
 * Contributors http://www.alohaeditor.org/docs/contributing.html
 * @namespace editables
 */
define([
	'dom',
	'maps',
	'undo',
	'content',
	'boundaries'
], function (
	Dom,
	Maps,
	Undo,
	Content,
	Boundaries
) {
	'use strict';

	/**
	 * Returns an editable object for the given editable DOM element.
	 *
	 * @param  {Editor}  editor
	 * @param  {Element} elem
	 * @return {?Editable}
	 * @memberOf editables
	 */
	function fromElem(editor, elem) {
		return editor.editables[Dom.ensureExpandoId(elem)];
	}

	/**
	 * Returns an editable object for the given boundary.
	 *
	 * @param    {Editor}   editor
	 * @param    {Boundary} boundary
	 * @return   {?Editable}
	 * @memberOf editables
	 */
	function fromBoundary(editor, boundary) {
		var container = Boundaries.container(boundary);
		var elem = Dom.upWhile(container, function (node) {
			return !editor.editables[Dom.ensureExpandoId(node)];
		});
		return elem && fromElem(editor, elem);
	}

	/**
	 * Prepares the given element to be an editing host.
	 *
	 * @param    {!Element} elem
	 * @return   {Editable}
	 * @memberOf editables
	 */
	function Editable(elem) {
		if (!Dom.getStyle(elem, 'min-height')) {
			Dom.setStyle(elem, 'min-height', '1em');
		}
		Dom.setStyle(elem, 'cursor', 'text');
		Dom.addClass(elem, 'aloha-editable');
		var undoContext = Undo.Context(elem);
		var id = Dom.ensureExpandoId(elem);
		var editable = {
			id: id,
			elem: elem,
			undoContext: undoContext
		};
		return editable;
	}

	function dissocFromEditor(editor, editable) {
		delete editor.editables[editable.id];
	}

	function assocIntoEditor(editor, editable) {
		editor.editables[editable.id] = editable;
		editable.editor = editor;
	}

	function close(editable) {
		Undo.close(editable['undoContext']);
	}

	var DEFAULTS = {
		defaultBlock      : 'p',
		allowedStyles     : Content.allowedStyles(),
		allowedAttributes : Content.allowedAttributes(),
		disallowedNodes   : Content.disallowedNodes(),
		nodeTranslations  : Content.nodeTranslations()
	};

	/**
	 * Initializes an editable.
	 *
	 * @param  {function(AlohaEvent)} editor
	 * @param  {Element}              element
	 * @param  {Object}               options
	 * @return {Editable}
	 * @memberOf editables
	 */
	function create(editor, element, options) {
		var editable = Editable(element);
		editable.settings = Maps.merge({}, DEFAULTS, options);
		assocIntoEditor(editor, editable);
		Undo.enter(editable.undoContext, {
			meta             : {type: 'external'},
			partitionRecords : true
		});
		return editable;
	}

	/**
	 * Undos the scaffolding that was placed around the given element if the
	 * given element is an editable.
	 *
	 * @param    {!Editor}  editor
	 * @param    {!Element} element
	 * @return   {?Editable}
	 * @memberOf editables
	 */
	function destroy(editor, element)  {
		var editable = fromElem(editor, element);
		if (!editable) {
			return null;
		}
		close(editable);
		dissocFromEditor(editor, editable);
		if ('1em' === Dom.getStyle(element, 'min-height')) {
			Dom.setStyle(element, 'min-height', '');
		}
		Dom.setStyle(element, 'cursor', '');
		Dom.removeClass(element, 'aloha-editable');
		return editable;
	}

	/**
	 * Returns true if the given value is an editable.
	 *
	 * @param  {*} obj
	 * @return {boolean}
	 * @memberOf editables
	 */
	function is(obj) {
		return obj
		    && obj['elem']
		    && obj['elem'].hasOwnProperty
		    && obj['elem'].hasOwnProperty('!aloha-expando-node-id');
	}

	return {
		fromElem         : fromElem,
		fromBoundary     : fromBoundary,
		assocIntoEditor  : assocIntoEditor,
		dissocFromEditor : dissocFromEditor,
		is               : is,
		close            : close,
		create           : create,
		destroy          : destroy
	};
});
