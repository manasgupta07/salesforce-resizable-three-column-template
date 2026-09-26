({
    STORAGE_KEY: 'sf_resizable_3col_state_v2',

    MIN_SIDE: 10,
    MAX_SIDE: 50,
    MIN_CENTER: 20,
    DIVIDER_PX: 24,
    KEY_STEP: 2,
    DRAG_THRESHOLD_PX: 4,

    DEFAULTS: { left: 25, center: 50, right: 25 },
    RESTORE_DEFAULTS: { left: 25, right: 25 },

    loadState: function () {
        try {
            const raw = window.localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (this.isValid(parsed)) {
                    return {
                        widths: this.copy(parsed.widths),
                        collapsed: {
                            left: parsed.collapsed.left === true,
                            right: parsed.collapsed.right === true
                        },
                        restore: { left: parsed.restore.left, right: parsed.restore.right }
                    };
                }
            }
        } catch (e) {}
        return this.freshState();
    },

    freshState: function () {
        return {
            widths: this.copy(this.DEFAULTS),
            collapsed: { left: false, right: false },
            restore: { left: this.RESTORE_DEFAULTS.left, right: this.RESTORE_DEFAULTS.right }
        };
    },

    persist: function (cmp) {
        const state = {
            widths: cmp.get('v.widths'),
            collapsed: {
                left: cmp.get('v.leftCollapsed') === true,
                right: cmp.get('v.rightCollapsed') === true
            },
            restore: cmp.get('v.restore')
        };
        try {
            window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
        } catch (e) {}
    },

    persistDeferred: function (cmp) {
        if (cmp._persistTimer) { clearTimeout(cmp._persistTimer); }
        cmp._persistTimer = setTimeout($A.getCallback(function () {
            cmp._persistTimer = null;
            if (cmp.isValid()) { this.persist(cmp); }
        }.bind(this)), 300);
    },

    isValid: function (state) {
        if (!state || !state.widths || !state.collapsed || !state.restore) { return false; }
        const w = state.widths;
        const vals = [w.left, w.center, w.right];
        for (let i = 0; i < vals.length; i++) {
            if (typeof vals[i] !== 'number' || !isFinite(vals[i]) || vals[i] < 0) { return false; }
        }
        if (!this.checkSide(w.left, state.collapsed.left)) { return false; }
        if (!this.checkSide(w.right, state.collapsed.right)) { return false; }
        if (w.center < this.MIN_CENTER) { return false; }
        if (!this.isRestorable(state.restore.left) || !this.isRestorable(state.restore.right)) {
            return false;
        }
        return Math.abs(w.left + w.center + w.right - 100) < 0.5;
    },

    checkSide: function (pct, collapsed) {
        return collapsed === true ? pct === 0 : pct >= this.MIN_SIDE && pct <= this.MAX_SIDE;
    },

    isRestorable: function (pct) {
        return typeof pct === 'number' && isFinite(pct) && pct >= this.MIN_SIDE && pct <= this.MAX_SIDE;
    },

    getEl: function (cmp, auraId) {
        const ref = cmp.find(auraId);
        return ref ? ref.getElement() : null;
    },

    applyWidths: function (cmp, widths) {
        const w = widths || cmp.get('v.widths');
        const leftOut = cmp.get('v.leftCollapsed') === true;
        const rightOut = cmp.get('v.rightCollapsed') === true;
        const visible = 3 - (leftOut ? 1 : 0) - (rightOut ? 1 : 0);
        const deduct = (this.DIVIDER_PX * 2) / visible;

        this.setBasis(cmp, 'leftCol', leftOut ? null : w.left, deduct);
        this.setBasis(cmp, 'centerCol', w.center, deduct);
        this.setBasis(cmp, 'rightCol', rightOut ? null : w.right, deduct);
    },

    setBasis: function (cmp, auraId, pct, deduction) {
        const el = this.getEl(cmp, auraId);
        if (!el) { return; }
        el.style.flexBasis = pct === null
            ? '0px'
            : 'calc(' + pct + '% - ' + this.round(deduction) + 'px)';
    },

    applyAriaAttrs: function (cmp) {
        const w = cmp.get('v.widths');
        this._setDividerAria(this.getEl(cmp, 'leftDivider'), cmp.get('v.leftCollapsed'), w.left, 'left');
        this._setDividerAria(this.getEl(cmp, 'rightDivider'), cmp.get('v.rightCollapsed'), w.right, 'right');
    },

    _setDividerAria: function (el, collapsed, widthPct, side) {
        if (!el) { return; }
        const label = side === 'left' ? 'Left' : 'Right';
        if (collapsed) {
            el.setAttribute('role', 'button');
            el.setAttribute('aria-expanded', 'false');
            el.setAttribute('aria-label', 'Show ' + label + ' column. Press Enter.');
            el.removeAttribute('aria-orientation');
            el.removeAttribute('aria-valuenow');
            el.removeAttribute('aria-valuemin');
            el.removeAttribute('aria-valuemax');
        } else {
            el.setAttribute('role', 'separator');
            el.setAttribute('aria-orientation', 'vertical');
            el.setAttribute('aria-valuenow', String(Math.round(widthPct)));
            el.setAttribute('aria-valuemin', String(this.MIN_SIDE));
            el.setAttribute('aria-valuemax', String(this.MAX_SIDE));
            el.setAttribute('aria-label', label + ' column divider. Arrow keys resize, Enter hides the column.');
            el.removeAttribute('aria-expanded');
        }
    },

    toggleShield: function (cmp, on) {
        const el = this.getEl(cmp, 'shield');
        if (el) { el.classList.toggle('is-active', on); }
    },

    resolve: function (current, edge, pointerPct) {
        const next = this.copy(current);
        if (edge === 'left') {
            next.left = this.clamp(pointerPct, this.MIN_SIDE, this.MAX_SIDE);
            next.center = this.round(100 - next.left - current.right);
        } else {
            next.right = this.clamp(100 - pointerPct, this.MIN_SIDE, this.MAX_SIDE);
            next.center = this.round(100 - next.right - current.left);
        }
        return next.center < this.MIN_CENTER ? null : next;
    },

    toggle: function (cmp, edge) {
        const attr = edge === 'left' ? 'v.leftCollapsed' : 'v.rightCollapsed';
        let next;

        if (cmp.get(attr) === true) {
            next = this.expand(cmp, edge);
            if (!next) { return; }
            cmp.set(attr, false);
            cmp.set('v.widths', next.widths);
        } else {
            this.cleanup(cmp);
            this.toggleShield(cmp, false);
            next = this.collapse(cmp, edge);
            cmp.set(attr, true);
            cmp.set('v.widths', next.widths);
            cmp.set('v.restore', next.restore);
        }

        this.applyWidths(cmp, next.widths);
        this.applyAriaAttrs(cmp);
        this.persist(cmp);
    },

    collapse: function (cmp, edge) {
        const widths = this.copy(cmp.get('v.widths'));
        const restore = this.copyRestore(cmp.get('v.restore'));
        restore[edge] = widths[edge];
        widths.center = this.round(widths.center + widths[edge]);
        widths[edge] = 0;
        return { widths, restore };
    },

    expand: function (cmp, edge) {
        const widths = this.copy(cmp.get('v.widths'));
        const restore = this.copyRestore(cmp.get('v.restore'));
        const want = this.isRestorable(restore[edge]) ? restore[edge] : this.RESTORE_DEFAULTS[edge];
        const spare = this.round(widths.center - this.MIN_CENTER);
        const give = this.round(Math.min(want, spare));
        if (give < this.MIN_SIDE) { return null; }
        widths[edge] = give;
        widths.center = this.round(widths.center - give);
        return { widths, restore };
    },

    beginPress: function (cmp, edge, event) {
        const self = this;
        const containerEl = this.getEl(cmp, 'container');
        if (!containerEl) { return; }
        this.cleanup(cmp);

        const collapsed = this.isCollapsed(cmp, edge);
        const startX = event.clientX;
        const committed = cmp.get('v.widths');
        let dragging = false;
        let live = null;
        let rafId = null;

        const onMove = $A.getCallback(function (moveEvent) {
            if (collapsed || !cmp.isValid()) { return; }
            if (!dragging) {
                if (Math.abs(moveEvent.clientX - startX) < self.DRAG_THRESHOLD_PX) { return; }
                dragging = true;
                self.toggleShield(cmp, true);
            }
            if (rafId !== null) { return; }
            const capturedX = moveEvent.clientX;

            rafId = window.requestAnimationFrame($A.getCallback(function () {
                rafId = null;
                if (!cmp.isValid()) { return; }

                const rect = containerEl.getBoundingClientRect();
                if (!rect.width) { return; }

                const pointerPct = ((capturedX - rect.left) / rect.width) * 100;
                const candidate = self.resolve(committed, edge, pointerPct);
                if (candidate) {
                    live = candidate;
                    self.applyWidths(cmp, candidate);
                }
            }));
        });

        const onUp = $A.getCallback(function () {
            if (rafId !== null) {
                window.cancelAnimationFrame(rafId);
                rafId = null;
            }
            self.cleanup(cmp);
            if (!cmp.isValid()) { return; }
            self.toggleShield(cmp, false);

            if (dragging) {
                if (live) {
                    cmp.set('v.widths', live);
                    self.applyAriaAttrs(cmp);
                    self.persist(cmp);
                }
                return;
            }
            self.toggle(cmp, edge);
        });

        cmp._dragListeners = { move: onMove, up: onUp };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        window.addEventListener('blur', onUp);
    },

    nudge: function (cmp, edge, event) {
        const key = event.key;

        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            event.preventDefault();
            this.toggle(cmp, edge);
            return;
        }

        if (key === 'Home') {
            event.preventDefault();
            cmp.set('v.leftCollapsed', false);
            cmp.set('v.rightCollapsed', false);
            cmp.set('v.widths', this.copy(this.DEFAULTS));
            cmp.set('v.restore', this.copyRestore(this.RESTORE_DEFAULTS));
            this.applyWidths(cmp);
            this.applyAriaAttrs(cmp);
            this.persistDeferred(cmp);
            return;
        }

        let direction;
        if (key === 'ArrowLeft') { direction = -1; }
        else if (key === 'ArrowRight') { direction = 1; }
        else { return; }
        event.preventDefault();

        if (this.isCollapsed(cmp, edge)) { return; }

        const current = cmp.get('v.widths');
        const target = edge === 'left' ? current.left : current.right;
        const step = edge === 'left' ? direction : -direction;
        const pointerPct = edge === 'left'
            ? target + (step * this.KEY_STEP)
            : 100 - (target + (step * this.KEY_STEP));

        const next = this.resolve(current, edge, pointerPct);
        if (next) {
            cmp.set('v.widths', next);
            this.applyWidths(cmp, next);
            this.applyAriaAttrs(cmp);
            this.persistDeferred(cmp);
        }
    },

    cleanup: function (cmp) {
        if (cmp._dragListeners) {
            window.removeEventListener('pointermove', cmp._dragListeners.move);
            window.removeEventListener('pointerup', cmp._dragListeners.up);
            window.removeEventListener('pointercancel', cmp._dragListeners.up);
            window.removeEventListener('blur', cmp._dragListeners.up);
            cmp._dragListeners = null;
        }
        if (cmp._persistTimer) {
            clearTimeout(cmp._persistTimer);
            cmp._persistTimer = null;
        }
    },

    isCollapsed: function (cmp, edge) {
        return cmp.get(edge === 'left' ? 'v.leftCollapsed' : 'v.rightCollapsed') === true;
    },

    clamp: function (n, min, max) {
        return this.round(Math.min(Math.max(n, min), max));
    },

    round: function (n) {
        return Math.round(n * 100) / 100;
    },

    copy: function (w) {
        return { left: w.left, center: w.center, right: w.right };
    },

    copyRestore: function (r) {
        const src = r || this.RESTORE_DEFAULTS;
        return { left: src.left, right: src.right };
    }
})