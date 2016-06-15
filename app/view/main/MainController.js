/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('MyApp.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onSelectClick: function (btn) {
        Ext.create('Ext.window.Window', {
            title: 'Select people',
            height: '70%',
            width: '50%',
            layout: 'fit',
            animateTarget: btn,
            items: {
                xtype: 'alphabetpicker',
                store: {
                    type: 'personnel'
                },
                bind: {
                    selection: '{selected}'
                },
                displayField: 'name'
            }
        }).show();
    }

});
