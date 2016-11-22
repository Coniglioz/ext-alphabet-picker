/**
 * Multi selection component composed by tag field and data view selection.
 *
 * Requieres the AlphabetPicker.sass file for the styling.
 *
 * @author Federico Baron <federico.baron@ibuildings.it>
 * @www https://www.ibuildings.it
 */
Ext.define('Ext.ux.AlphabetPicker', {
    extend: 'Ext.container.Container',
    xtype: 'alphabetpicker',
    requires: [
        'Ext.button.Segmented',
        'Ext.view.View',
        'Ext.form.field.Tag'
    ],

    cls: 'alphabetpicker',

    selectionPublishEvent: 'selectionchange',

    config: {
        /**
         * @cfg {Ext.data.Store/String/Array/Object} store (required)
         * The data source to which the picker is bound.
         */
        store: null,

        /**
         * @cfg {String} displayField (required)
         * The model's field to display in the picker.
         */
        displayField: null,

        /**
         * @cfg {String} [valueField]
         * The model's field to use as value. Uses display field by default.
         */
        valueField: null,

        /**
         * @cfg {Ext.data.Model[]} [selection]
         * The selected models. Typically used with binding.
         */
        selection: null,

        /**
         * @cfg {String} [alphabet]
         * The alphabet to use for chars menu.
         */
        alphabet: 'abcdefghijklmnopqrstuvwxyz',

        /**
         * @cfg {Number} [groupSize]
         * Number of chars for each group.
         */
        groupSize: 3,

        /**
         * @cfg {Number} [defaultUI]
         * Default ui to use for buttons in the menu.
         */
        defaultUI: 'default',

        /**
         * @cfg {Number} [defaultScale]
         * Default scale to use for buttons in the menu.
         */
        defaultScale: 'small',

        /**
         * @cfg {String/String[]/Ext.XTemplate} [groupTpl]
         * The template to be used to display the chars group button text. An array containing the chars
         * will be passed to the template.
         */
        groupTpl: '<tpl for=".">' +
        '<tpl if="xindex === 1">{[values.toUpperCase()]} - ' +
        '<tpl elseif="xindex === xcount">{[values.toUpperCase()]}' +
        '</tpl>' +
        '</tpl>',

        /**
         * @cfg {Number} [columns]
         * The number of columns in which the items are shown.
         */
        columns: 3,

        /**
         * @cfg {String} [iconCls]
         * Icon CSS class.
         */
        iconCls: 'fa fa-check-circle-o',

        /**
         * @cfg {String} [itemTagsLabel]
         * Field label of the tag component.
         */
        itemTagsLabel: "Selected",

        /**
         * @cfg {Boolean} [enableListView]
         * 'true' to enable list view switch.
         */
        enableListView: false,

        /**
         * @cfg {String} [alphabetViewIconCls]
         * Alphabet view icon CSS class. Visible only if enableListView is 'true'.
         */
        alphabetViewIconCls: 'fa fa-sort-alpha-asc',

        /**
         * @cfg {String} [listViewIconCls]
         * List view icon CSS class. Visible only if enableListView is 'true'.
         */
        listViewIconCls: 'fa fa-list',

        /**
         * @cfg {Number} [defaultUI]
         * Default ui to use for switch view buttons.
         */
        viewBtnDefaultUI: 'default',

        /**
         * @cfg {Number} [defaultScale]
         * Default scale to use for switch view buttons.
         */
        viewBtnDefaultScale: 'small'
    },

    /**
     * @event beforeselect
     * Fires before the selected item is added to the collection
     * @param {EliteConference.view.components.AlphabetPicker} picker This picker
     * @param {Ext.data.Model} record The selected record
     * @param {Ext.data.Model[]} selection The current selection
     */

    /**
     * @event beforedeselect
     * Fires before the deselected item is removed from the collection
     * @param {EliteConference.view.components.AlphabetPicker} picker This picker
     * @param {Ext.data.Model} record The deselected record
     * @param {Ext.data.Model[]} selection The current selection
     */

    /**
     * @event selectionchange
     * Fires after selection change.
     * @param {EliteConference.view.components.AlphabetPicker} picker This picker
     * @param {Ext.data.Model[]} selection The current selection
     */

    initComponent: function () {
        var me = this,
            chars = me.alphabet.split(''),
            buttons = [], mainStore;

        mainStore = me.store = Ext.data.StoreManager.lookup(me.store || me.getBind().store.getValue() || 'ext-empty-store');

        // Default configs
        if (!me.valueField) {
            me.valueField = me.displayField;
        }

        // Vast majority of cases won't be an array
        if (Ext.isString(me.selectionPublishEvent)) {
            me.on(me.selectionPublishEvent, me.publishSelection, me);
        } else {
            for (i = 0, len = me.selectionPublishEvent.length; i < len; ++i) {
                me.on(me.selectionPublishEvent[i], me.publishSelection, me);
            }
        }

        // Create menu items
        for (var i = 0; i < chars.length; i += me.groupSize) {
            var groupEnd = (i + me.groupSize < chars.length) ? i + me.groupSize : chars.length,
                group = chars.slice(i, groupEnd);
            buttons.push({
                text: new Ext.XTemplate(me.groupTpl).applyTemplate(group),
                ui: me.defaultUI,
                value: group.join(),
                scale: me.defaultScale
            });
        }

        // Create dataView store
        me.dataViewStore = Ext.create('Ext.data.Store', {
            fields: [me.valueField, me.displayField],
            data: mainStore.getRange().map(function (rec) {
                return rec.getData();
            }),
            sorters: [{
                property: me.displayField,
                direction: 'ASC'
            }]
        });
        mainStore.on('datachanged', function (store) {
            me.dataViewStore.loadData(store.getRange().map(function (rec) {
                return rec.getData();
            }));
        });

        Ext.apply(me, {
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [{
                xtype: 'container',
                margin: '0 10 10 10',
                layout: {
                    type: 'hbox',
                    align: 'begin'
                },
                items: [{
                    xtype: 'tagfield',
                    cls: 'alphabetpicker-tags',
                    flex: 1,
                    fieldLabel: me.itemTagsLabel,
                    labelAlign: 'top',
                    hideTrigger: true,
                    store: mainStore,
                    displayField: me.displayField,
                    valueField: me.valueField,
                    queryMode: 'local',
                    listeners: {
                        change: me.onItemTagsChange,
                        beforeselect: me.onTagsBeforeSelect,
                        beforedeselect: me.onTagsBeforeDeselect,
                        scope: me
                    }
                }, {
                    xtype: 'fieldcontainer',
                    fieldLabel: '&nbsp;',
                    labelAlign: 'top',
                    labelSeparator: '',
                    fieldBodyCls: 'alphabetpicker-tags-view-buttons',
                    hidden: !me.enableListView,
                    items: [{
                        xtype: 'segmentedbutton',
                        forceSelection: true,
                        items: [{
                            iconCls: me.alphabetViewIconCls,
                            scale: me.viewBtnDefaultScale,
                            ui: me.viewBtnDefaultUI,
                            value: 'alphabet'
                        }, {
                            iconCls: me.listViewIconCls,
                            scale: me.viewBtnDefaultScale,
                            ui: me.viewBtnDefaultUI,
                            value: 'list'
                        }],
                        listeners: {
                            change: me.onViewChange,
                            scope: me
                        }
                    }]
                }]
            }, {
                xtype: 'segmentedbutton',
                itemId: 'alphabetMenu',
                cls: 'alphabetpicker-menu',
                forceSelection: true,
                items: buttons,
                defaultUI: me.defaultUI,
                listeners: {
                    change: me.onMenuChange,
                    scope: me
                }
            }, {
                xtype: 'dataview',
                cls: 'alphabetpicker-data',
                itemId: 'dataView',
                margin: 10,
                flex: 1,
                preserveScrollOnRefresh: true,
                scrollable: 'vertical',
                selectionModel: {
                    mode: 'SIMPLE',
                    allowDeselect: true
                },
                store: me.dataViewStore,
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                    '<div class="alphabetpicker-item" id="{' + me.valueField + '}-alphabetpicker" style="width: {[this.calculateWidth()]}; padding: 8px; float: left; cursor: pointer;">',
                    '<i class="alphabetpicker-item-icon ' + me.iconCls + '" style="margin: 0 5px;"></i>',
                    '<span class="alphabetpicker-item-label">{' + me.displayField + '}</span>',
                    '</div>',
                    '</tpl>',
                    {
                        calculateWidth: function () {
                            return (100 / me.columns) + '%';
                        }
                    }
                ),
                itemSelector: 'div.alphabetpicker-item',
                listeners: {
                    selectionchange: me.onDataViewSelectionChange,
                    beforeselect: me.onDataViewBeforeSelect,
                    beforedeselect: me.onDataViewBeforeDeselect,
                    beforecontainerclick: me.onBeforeContainerClick,
                    scope: me
                }
            }]
        });

        me.callParent();

        me.menu = me.down('#alphabetMenu');
        me.itemTags = me.down('tagfield');
        me.dataView = me.down('#dataView');

        if (me.selection) {
            me.setSelection(me.selection);
        }
    },

    setSelection: function (selection) {
        selection = selection || [];
        this.callParent(arguments);

        if (this.dataView) {
            this.itemTags.setSelection(selection);
        }
    },

    getSelection: function () {
        return this.itemTags.getValueRecords();
    },

    publishSelection: function () {
        var me = this;

        if (me.rendered) {
            me.publishState('selection', me.getSelection());
        }
    },

    /**
     * @private
     */
    onViewChange: function (segmented, newValue) {
        var me = this;

        switch (newValue[0]) {
            case 'alphabet':
                me.menu.setVisible(true);
                if (me.currentAlphabetFilters) {
                    me.dataViewStore.addFilter(me.currentAlphabetFilters, true);
                    me.columns = me.currentColumns;
                    me.dataView.refresh();
                    delete me.currentAlphabetFilters;
                    delete me.currentColumns;
                }
                break;
            case 'list':
                me.menu.setVisible(false);
                me.currentAlphabetFilters = me.dataViewStore.getFilters().getRange();
                me.currentColumns = me.columns;
                me.dataViewStore.clearFilter(true);
                me.columns = 1;
                me.dataView.refresh();
                break;
        }
    },

    /**
     * @private
     */
    onMenuChange: function (segmented, newValue) {
        var me = this;
        me.dataViewStore.clearFilter(true);
        me.dataViewStore.filterBy(function (record) {
            var displayString = record.get(me.displayField);
            return displayString.length && newValue[0].indexOf(displayString.charAt(0).toLowerCase()) !== -1;
        });
    },

    /**
     * @private
     */
    onDataViewBeforeSelect: function (view, record) {
        record = this.store.findRecord(this.valueField, record.get(this.valueField));
        return this.fireEvent('beforeselect', this, record, this.getSelection());
    },

    /**
     * @private
     */
    onDataViewBeforeDeselect: function (view, record) {
        record = this.store.findRecord(this.valueField, record.get(this.valueField));
        return this.fireEvent('beforedeselect', this, record, this.getSelection());
    },

    /**
     * @private
     */
    onTagsBeforeSelect: function (combo, record) {
        return this.fireEvent('beforeselect', this, record, this.getSelection());
    },

    /**
     * @private
     */
    onTagsBeforeDeselect: function (combo, record) {
        return this.fireEvent('beforedeselect', this, record, this.getSelection());
    },

    /**
     * @private
     */
    onDataViewSelectionChange: function (selModel, records) {
        var me = this;

        me.selection = records;
        me.itemTags.suspendEvent('change');
        me.itemTags.suspendEvent('beforeselect');
        me.itemTags.suspendEvent('beforedeselect');
        me.itemTags.setSelection(null);
        me.itemTags.setSelection(records.map(function (record) {
            return me.store.findRecord(me.valueField, record.get(me.valueField));
        }, me));
        me.itemTags.resumeEvent('change');
        me.itemTags.resumeEvent('beforeselect');
        me.itemTags.resumeEvent('beforedeselect');

        me.fireEvent('selectionchange', me, me.getSelection());
    },

    /**
     * @private
     */
    onItemTagsChange: function (combo, values) {
        var me = this,
            filters = me.dataViewStore.getFilters().getRange();

        me.dataViewStore.clearFilter(true);
        var records = values.map(function (value) {
            return me.dataViewStore.findRecord(me.valueField, value);
        }, me);
        me.dataViewStore.addFilter(filters, true);

        me.selection = records;
        me.dataView.suspendEvent('selectionchange');
        me.dataView.suspendEvent('beforeselect');
        me.dataView.suspendEvent('beforedeselect');
        me.dataView.setSelection(null);
        me.dataView.setSelection(records);
        me.dataView.resumeEvent('selectionchange');
        me.dataView.resumeEvent('beforeselect');
        me.dataView.resumeEvent('beforedeselect');

        me.fireEvent('selectionchange', me, me.getSelection());
    },

    /**
     * @private
     */
    onBeforeContainerClick: function () {
        return false;
    }

});