/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

 /**
 * @fileOverview Rich code snippets for CKEditor.
 */

'use strict';

( function() {
	var isBrowserSupported = !CKEDITOR.env.ie || CKEDITOR.env.version > 8;

	CKEDITOR.plugins.add( 'codesnippet', {
		requires: 'widget,dialog',
		lang: 'ar,az,bg,ca,cs,da,de,de-ch,el,en,en-au,en-gb,eo,es,es-mx,et,eu,fa,fi,fr,fr-ca,gl,he,hr,hu,id,it,ja,km,ko,ku,lt,lv,nb,nl,no,oc,pl,pt,pt-br,ro,ru,sk,sl,sq,sr,sr-latn,sv,th,tr,tt,ug,uk,vi,zh,zh-cn', // %REMOVE_LINE_CORE%
		icons: 'codesnippet', // %REMOVE_LINE_CORE%
		hidpi: true, // %REMOVE_LINE_CORE%

		beforeInit: function( editor ) {
			editor._.codesnippet = {};
		},

		onLoad: function() {
			CKEDITOR.dialog.add( 'codeSnippet', this.path + 'dialogs/codesnippet.js' );
		},

		init: function( editor ) {
			editor.ui.addButton && editor.ui.addButton( 'CodeSnippet', {
				label: editor.lang.codesnippet.button,
				command: 'codeSnippet',
				toolbar: 'insert,10'
			} );
		},

		afterInit: function( editor ) {
			var path = this.path;

			registerWidget( editor );
		}
	} );

	// Encapsulates snippet widget registration code.
	// @param {CKEDITOR.editor} editor
	function registerWidget( editor ) {
		var textarea = new CKEDITOR.dom.element( 'textarea' ),
			lang = editor.lang.codesnippet;

		editor.widgets.add( 'codeSnippet', {
			allowedContent: 'pre; code(language-*)',
			// Actually we need both - pre and code, but ACF does not make it possible
			// to defire required content with "and" operator.
			requiredContent: 'pre',
			styleableElements: 'pre',
			template: '<pre><code></code></pre>',
			dialog: 'codeSnippet',
			pathName: lang.pathName,
			mask: true,

			parts: {
				pre: 'pre',
				code: 'code'
			},

			data: function() {
				var newData = this.data,
					oldData = this.oldData;

				if ( newData.code )
					this.parts.code.setHtml( CKEDITOR.tools.htmlEncode( newData.code ) );

				// Remove old .language-* class.
				if ( oldData && newData.lang != oldData.lang )
					this.parts.code.removeClass( 'language-' + oldData.lang );

				// Lang needs to be specified in order to apply formatting.
				if ( newData.lang ) {
					// Apply new .language-* class.
					this.parts.code.addClass( 'language-' + newData.lang );
				}

				// Save oldData.
				this.oldData = CKEDITOR.tools.copy( newData );
			},

			// Upcasts <pre><code [class="language-*"]>...</code></pre>
			upcast: function( el, data ) {
				if ( el.name != 'pre' )
					return;

				var childrenArray = getNonEmptyChildren( el ),
					code;

				if ( childrenArray.length != 1 || ( code = childrenArray[ 0 ] ).name != 'code' )
					return;

				// Upcast <code> with text only: https://dev.ckeditor.com/ticket/11926#comment:4
				if ( code.children.length != 1 || code.children[ 0 ].type != CKEDITOR.NODE_TEXT )
					return;

				// Read language-* from <code> class attribute.
				var matchResult = editor._.codesnippet.langsRegex.exec( code.attributes[ 'class' ] );

				if ( matchResult )
					data.lang = matchResult[ 1 ];

				// Use textarea to decode HTML entities (https://dev.ckeditor.com/ticket/11926).
				textarea.setHtml( code.getHtml() );
				data.code = textarea.getValue();

				return el;
			},

			// Downcasts to <pre><code [class="language-*"]>...</code></pre>
			downcast: function( el ) {
				var code = el.getFirst( 'code' );

				// Remove pretty formatting from <code>...</code>.
				code.children.length = 0;

				// Set raw text inside <code>...</code>.
				code.add( new CKEDITOR.htmlParser.text( CKEDITOR.tools.htmlEncode( this.data.code ) ) );

				return el;
			}
		} );

		// Returns an **array** of child elements, with whitespace-only text nodes
		// filtered out.
		// @param {CKEDITOR.htmlParser.element} parentElement
		// @return Array - array of CKEDITOR.htmlParser.node
		var whitespaceOnlyRegex = /^[\s\n\r]*$/;

		function getNonEmptyChildren( parentElement ) {
			var ret = [],
				preChildrenList = parentElement.children,
				curNode;

			// Filter out empty text nodes.
			for ( var i = preChildrenList.length - 1; i >= 0; i-- ) {
				curNode = preChildrenList[ i ];

				if ( curNode.type != CKEDITOR.NODE_TEXT || !curNode.value.match( whitespaceOnlyRegex ) )
					ret.push( curNode );
			}

			return ret;
		}
	}
} )();
