({
    doInit: function (cmp, event, helper) {
        const state = helper.loadState();
        cmp.set('v.widths', state.widths);
        cmp.set('v.leftCollapsed', state.collapsed.left);
        cmp.set('v.rightCollapsed', state.collapsed.right);
        cmp.set('v.restore', state.restore);
    },

    doDestroy: function (cmp, event, helper) {
        helper.cleanup(cmp);
    },

    startResizeLeft: function (cmp, event, helper) {
        event.preventDefault();
        helper.beginPress(cmp, 'left', event);
    },

    startResizeRight: function (cmp, event, helper) {
        event.preventDefault();
        helper.beginPress(cmp, 'right', event);
    },

    handleLeftKey: function (cmp, event, helper) {
        helper.nudge(cmp, 'left', event);
    },

    handleRightKey: function (cmp, event, helper) {
        helper.nudge(cmp, 'right', event);
    }
})