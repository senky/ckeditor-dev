CKEDITOR.plugins.add( 'attachment', {
	requires: 'widget',
	init: function ( editor ) {
		editor.widgets.add('attachment', {
			upcast: function( element ) {
				return element.name == 'div' && typeof element.attributes.attachid !== 'undefined';
			}
		});
	}
} );
