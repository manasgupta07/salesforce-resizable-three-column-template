({
    afterRender: function (cmp, helper) {
        this.superAfterRender();
        helper.applyWidths(cmp);
        helper.applyAriaAttrs(cmp);
    },

    rerender: function (cmp, helper) {
        this.superRerender();
        helper.applyWidths(cmp);
        helper.applyAriaAttrs(cmp);
    }
})