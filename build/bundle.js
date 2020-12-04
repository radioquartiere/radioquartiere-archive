
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.7' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/svelte-copy-to-clipboard/src/CopyToClipboard.svelte generated by Svelte v3.29.7 */
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ copy: /*copy*/ ctx[0] });

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CopyToClipboard", slots, ['default']);
    	let { text } = $$props;
    	const dispatch = createEventDispatcher();

    	const copy = () => {
    		navigator.clipboard.writeText(text).then(() => dispatch("copy", text), e => dispatch("fail"));
    	};

    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CopyToClipboard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		text,
    		dispatch,
    		copy
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(1, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [copy, text, $$scope, slots];
    }

    class CopyToClipboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { text: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CopyToClipboard",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[1] === undefined && !("text" in props)) {
    			console.warn("<CopyToClipboard> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<CopyToClipboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<CopyToClipboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/PauseFill/PauseFill.svelte generated by Svelte v3.29.7 */

    const file = "node_modules/svelte-bootstrap-icons/lib/PauseFill/PauseFill.svelte";

    function create_fragment$1(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z");
    			add_location(path, file, 1, 2, 237);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-pause-fill", true);
    			add_location(svg, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-pause-fill", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PauseFill", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class PauseFill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PauseFill",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/PlayFill/PlayFill.svelte generated by Svelte v3.29.7 */

    const file$1 = "node_modules/svelte-bootstrap-icons/lib/PlayFill/PlayFill.svelte";

    function create_fragment$2(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path = svg_element("path");
    			attr_dev(path, "d", "M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
    			add_location(path, file$1, 1, 2, 236);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-play-fill", true);
    			add_location(svg, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-play-fill", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PlayFill", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class PlayFill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PlayFill",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/RssFill/RssFill.svelte generated by Svelte v3.29.7 */

    const file$2 = "node_modules/svelte-bootstrap-icons/lib/RssFill/RssFill.svelte";

    function create_fragment$3(ctx) {
    	let svg;
    	let path;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm1.5 2.5a1 1 0 0 0 0 2 8 8 0 0 1 8 8 1 1 0 1 0 2 0c0-5.523-4.477-10-10-10zm0 4a1 1 0 0 0 0 2 4 4 0 0 1 4 4 1 1 0 1 0 2 0 6 6 0 0 0-6-6zm.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z");
    			add_location(path, file$2, 1, 2, 235);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-rss-fill", true);
    			add_location(svg, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-rss-fill", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RssFill", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class RssFill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RssFill",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/Shuffle/Shuffle.svelte generated by Svelte v3.29.7 */

    const file$3 = "node_modules/svelte-bootstrap-icons/lib/Shuffle/Shuffle.svelte";

    function create_fragment$4(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "d", "M0 3.5A.5.5 0 0 1 .5 3H1c2.202 0 3.827 1.24 4.874 2.418.49.552.865 1.102 1.126 1.532.26-.43.636-.98 1.126-1.532C9.173 4.24 10.798 3 13 3v1c-1.798 0-3.173 1.01-4.126 2.082A9.624 9.624 0 0 0 7.556 8a9.624 9.624 0 0 0 1.317 1.918C9.828 10.99 11.204 12 13 12v1c-2.202 0-3.827-1.24-4.874-2.418A10.595 10.595 0 0 1 7 9.05c-.26.43-.636.98-1.126 1.532C4.827 11.76 3.202 13 1 13H.5a.5.5 0 0 1 0-1H1c1.798 0 3.173-1.01 4.126-2.082A9.624 9.624 0 0 0 6.444 8a9.624 9.624 0 0 0-1.317-1.918C4.172 5.01 2.796 4 1 4H.5a.5.5 0 0 1-.5-.5z");
    			add_location(path0, file$3, 1, 2, 234);
    			attr_dev(path1, "d", "M13 5.466V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192zm0 9v-3.932a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192z");
    			add_location(path1, file$3, 2, 2, 789);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-shuffle", true);
    			add_location(svg, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-shuffle", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Shuffle", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class Shuffle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Shuffle",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/SkipEndFill/SkipEndFill.svelte generated by Svelte v3.29.7 */

    const file$4 = "node_modules/svelte-bootstrap-icons/lib/SkipEndFill/SkipEndFill.svelte";

    function create_fragment$5(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "d", "M12 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V4a.5.5 0 0 1 .5-.5z");
    			add_location(path0, file$4, 1, 2, 240);
    			attr_dev(path1, "d", "M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z");
    			add_location(path1, file$4, 2, 2, 335);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-skip-end-fill", true);
    			add_location(svg, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-skip-end-fill", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SkipEndFill", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class SkipEndFill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SkipEndFill",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/VolumeMuteFill/VolumeMuteFill.svelte generated by Svelte v3.29.7 */

    const file$5 = "node_modules/svelte-bootstrap-icons/lib/VolumeMuteFill/VolumeMuteFill.svelte";

    function create_fragment$6(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(path0, "fill-rule", "evenodd");
    			attr_dev(path0, "d", "M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06zm7.137 2.096a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708l4-4a.5.5 0 0 1 .708 0z");
    			add_location(path0, file$5, 1, 2, 243);
    			attr_dev(path1, "fill-rule", "evenodd");
    			attr_dev(path1, "d", "M9.146 5.646a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0z");
    			add_location(path1, file$5, 2, 2, 492);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-volume-mute-fill", true);
    			add_location(svg, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-volume-mute-fill", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VolumeMuteFill", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class VolumeMuteFill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VolumeMuteFill",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* node_modules/svelte-bootstrap-icons/lib/VolumeUpFill/VolumeUpFill.svelte generated by Svelte v3.29.7 */

    const file$6 = "node_modules/svelte-bootstrap-icons/lib/VolumeUpFill/VolumeUpFill.svelte";

    function create_fragment$7(ctx) {
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "1em" },
    		{ viewBox: "0 0 16 16" },
    		{ fill: "currentColor" },
    		{ height: "1em" },
    		/*$$restProps*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M11.536 14.01A8.473 8.473 0 0 0 14.026 8a8.473 8.473 0 0 0-2.49-6.01l-.708.707A7.476 7.476 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z");
    			add_location(path0, file$6, 1, 2, 241);
    			attr_dev(path1, "d", "M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.483 5.483 0 0 1 11.025 8a5.483 5.483 0 0 1-1.61 3.89l.706.706z");
    			add_location(path1, file$6, 2, 2, 401);
    			attr_dev(path2, "d", "M8.707 11.182A4.486 4.486 0 0 0 10.025 8a4.486 4.486 0 0 0-1.318-3.182L8 5.525A3.489 3.489 0 0 1 9.025 8 3.49 3.49 0 0 1 8 10.475l.707.707z");
    			add_location(path2, file$6, 3, 2, 558);
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "d", "M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z");
    			add_location(path3, file$6, 4, 2, 712);
    			set_svg_attributes(svg, svg_data);
    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-volume-up-fill", true);
    			add_location(svg, file$6, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(svg, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(svg, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(svg, "mouseenter", /*mouseenter_handler*/ ctx[5], false, false, false),
    					listen_dev(svg, "mouseleave", /*mouseleave_handler*/ ctx[6], false, false, false),
    					listen_dev(svg, "keydown", /*keydown_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "1em" },
    				{ viewBox: "0 0 16 16" },
    				{ fill: "currentColor" },
    				{ height: "1em" },
    				dirty & /*$$restProps*/ 1 && /*$$restProps*/ ctx[0]
    			]));

    			toggle_class(svg, "bi", true);
    			toggle_class(svg, "bi-volume-up-fill", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	const omit_props_names = [];
    	let $$restProps = compute_rest_props($$props, omit_props_names);
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VolumeUpFill", slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseover_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseenter_handler(event) {
    		bubble($$self, event);
    	}

    	function mouseleave_handler(event) {
    		bubble($$self, event);
    	}

    	function keydown_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
    		$$invalidate(0, $$restProps = compute_rest_props($$props, omit_props_names));
    		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
    	};

    	return [
    		$$restProps,
    		$$scope,
    		slots,
    		click_handler,
    		mouseover_handler,
    		mouseenter_handler,
    		mouseleave_handler,
    		keydown_handler
    	];
    }

    class VolumeUpFill extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VolumeUpFill",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/RssButton.svelte generated by Svelte v3.29.7 */

    const { console: console_1 } = globals;
    const file$7 = "src/components/RssButton.svelte";

    // (74:2) <CopyToClipboard     text={rssFeed}     on:copy={handleSuccessfullyCopied}     on:fail={handleFailedCopy}     let:copy>
    function create_default_slot(ctx) {
    	let button;
    	let span;
    	let t1;
    	let rssfill;
    	let current;
    	let mounted;
    	let dispose;
    	rssfill = new RssFill({ $$inline: true });

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			span.textContent = "Copia RSS Feed";
    			t1 = space();
    			create_component(rssfill.$$.fragment);
    			attr_dev(span, "class", "mr-2");
    			add_location(span, file$7, 81, 6, 1519);
    			attr_dev(button, "class", "btn btn-outline-primary d-flex align-items-center p-md-auto");
    			add_location(button, file$7, 78, 4, 1408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(button, t1);
    			mount_component(rssfill, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*copy*/ ctx[5])) /*copy*/ ctx[5].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rssfill.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rssfill.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			destroy_component(rssfill);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(74:2) <CopyToClipboard     text={rssFeed}     on:copy={handleSuccessfullyCopied}     on:fail={handleFailedCopy}     let:copy>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let copytoclipboard;
    	let t0;
    	let span;
    	let current;

    	copytoclipboard = new CopyToClipboard({
    			props: {
    				text: /*rssFeed*/ ctx[1],
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ copy }) => ({ 5: copy }),
    						({ copy }) => copy ? 32 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	copytoclipboard.$on("copy", /*handleSuccessfullyCopied*/ ctx[2]);
    	copytoclipboard.$on("fail", handleFailedCopy);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(copytoclipboard.$$.fragment);
    			t0 = space();
    			span = element("span");
    			span.textContent = "Copiato!";
    			attr_dev(span, "class", "confirm pt-1 svelte-lxkqbv");
    			toggle_class(span, "pulse", /*pulse*/ ctx[0]);
    			add_location(span, file$7, 85, 2, 1615);
    			attr_dev(div, "class", "d-flex align-items-center mb-auto flex-column w-100");
    			add_location(div, file$7, 72, 0, 1216);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(copytoclipboard, div, null);
    			append_dev(div, t0);
    			append_dev(div, span);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const copytoclipboard_changes = {};
    			if (dirty & /*rssFeed*/ 2) copytoclipboard_changes.text = /*rssFeed*/ ctx[1];

    			if (dirty & /*$$scope, copy*/ 96) {
    				copytoclipboard_changes.$$scope = { dirty, ctx };
    			}

    			copytoclipboard.$set(copytoclipboard_changes);

    			if (dirty & /*pulse*/ 1) {
    				toggle_class(span, "pulse", /*pulse*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(copytoclipboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(copytoclipboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(copytoclipboard);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handleFailedCopy() {
    	console.log("failed to copy :(");
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RssButton", slots, []);
    	let pulse = false;
    	let interval;

    	function handleSuccessfullyCopied() {
    		$$invalidate(0, pulse = true);

    		if (interval) {
    			clearInterval(interval);
    		}

    		interval = setInterval(
    			function () {
    				return $$invalidate(0, pulse = false);
    			},
    			2000
    		);
    	}

    	let { identifier } = $$props;

    	onDestroy(() => {
    		if (interval) {
    			clearInterval(interval);
    		}
    	});

    	const writable_props = ["identifier"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<RssButton> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("identifier" in $$props) $$invalidate(3, identifier = $$props.identifier);
    	};

    	$$self.$capture_state = () => ({
    		CopyToClipboard,
    		RssFill,
    		onDestroy,
    		pulse,
    		interval,
    		handleSuccessfullyCopied,
    		handleFailedCopy,
    		identifier,
    		rssFeed
    	});

    	$$self.$inject_state = $$props => {
    		if ("pulse" in $$props) $$invalidate(0, pulse = $$props.pulse);
    		if ("interval" in $$props) interval = $$props.interval;
    		if ("identifier" in $$props) $$invalidate(3, identifier = $$props.identifier);
    		if ("rssFeed" in $$props) $$invalidate(1, rssFeed = $$props.rssFeed);
    	};

    	let rssFeed;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*identifier*/ 8) {
    			 $$invalidate(1, rssFeed = `https://openpod.abbiamoundominio.org/podcast/${identifier}`);
    		}
    	};

    	return [pulse, rssFeed, handleSuccessfullyCopied, identifier];
    }

    class RssButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { identifier: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RssButton",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*identifier*/ ctx[3] === undefined && !("identifier" in props)) {
    			console_1.warn("<RssButton> was created without expected prop 'identifier'");
    		}
    	}

    	get identifier() {
    		throw new Error("<RssButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set identifier(value) {
    		throw new Error("<RssButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function descending(a, b) {
      return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const baseUrl = 'https://archive.org/metadata/';

    async function fetchItem(item) {
    	const res = await fetch(`${baseUrl}${item}`);
    	const json = await res.json();

    	if (res.ok) {
    		return json;
    	} else {
    		throw new Error(json);
    	}
    }

    async function fetchConfig() {
    	const res = await fetch(`config.json`);
    	const json = await res.json();

    	if (res.ok) {
    		return json;
    	} else {
    		throw new Error(json);
    	}
    }

    async function fetchFeeds(){
        const config = await fetchConfig();
        const items = config.feeds?config.feeds:[];
        return Promise.all(items.map((item) => {
                return fetchItem(item)
            })
        );
    }

    const sorting = {
        descending,
        ascending
    };

    const feeds = readable([], (set)=>{
        const fetchedFeeds = fetchFeeds();
        set(fetchedFeeds);
    });

    const config = readable({}, async (set)=>{
        const fetchedConfig = await fetchConfig();
        set(fetchedConfig);
    });

    const account = derived(config,async($config, set)=>{
        if($config.account){
            const account = await fetchItem($config.account);
            set(account);
        }
    });

    const sort = writable('mtime|ascending'); 
    const filter = writable();

    const tracks = derived([feeds, sort, filter],([$feeds, $sort, $filter], set)=>{
        return (async()=>{
            const feeds = await $feeds;
            const allTracks = feeds
                .filter(d=>$filter?d.metadata.identifier === $filter :true)
                .map(d=>{
                    const mp3s = d.files
                        .filter(d=>d.format === 'VBR MP3')
                        .map(f=>{
                            const thumbName = f.name.replace('.mp3','_thumb');
                            const thumbImage = d.files.filter(i=>i.name.replace(/\.jpg|\.jpeg|\.png|\.gif/i,'') === thumbName)[0];
                            const itemThumb = d.files.filter(i=>i.source === 'original' && i.format.match(/JPG|JPEG|PNG|GIF|Item Image/gm))[0];
                            f.cover = thumbImage?thumbImage:itemThumb;
                            f.identifier = d.metadata.identifier;
                            f.identifierTitle = d.metadata.title;
                            return f
                        });
                    return mp3s
                })
                .flat()
                .sort((a,b)=>sorting[$sort.split("|")[1]](a[$sort.split("|")[0]].toLowerCase(), b[$sort.split("|")[0]].toLowerCase()));

            set(allTracks);
        })()

    },[]);

    const playingTrack = writable();

    /* src/components/Sort.svelte generated by Svelte v3.29.7 */
    const file$8 = "src/components/Sort.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (26:4) {#each sortValues as sortValue}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*sortValue*/ ctx[3].label + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*sortValue*/ ctx[3].value;
    			option.value = option.__value;
    			add_location(option, file$8, 26, 6, 566);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(26:4) {#each sortValues as sortValue}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div;
    	let p;
    	let t1;
    	let select;
    	let mounted;
    	let dispose;
    	let each_value = /*sortValues*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "ordina per";
    			t1 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p, "class", "m-0 flex-shrink-0 mr-2 ");
    			add_location(p, file$8, 23, 2, 423);
    			attr_dev(select, "class", "form-control");
    			if (/*$sort*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$8, 24, 2, 475);
    			attr_dev(div, "class", "d-flex align-items-center");
    			add_location(div, file$8, 22, 0, 381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$sort*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sortValues*/ 2) {
    				each_value = /*sortValues*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$sort, sortValues*/ 3) {
    				select_option(select, /*$sort*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $sort;
    	validate_store(sort, "sort");
    	component_subscribe($$self, sort, $$value => $$invalidate(0, $sort = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Sort", slots, []);

    	const sortValues = [
    		{
    			label: "data [a-z]",
    			value: "mtime|ascending"
    		},
    		{
    			label: "data [z-a]",
    			value: "mtime|descending"
    		},
    		{
    			label: "titolo [a-z]",
    			value: "title|ascending"
    		},
    		{
    			label: "titolo [z-a]",
    			value: "title|descending"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Sort> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$sort = select_value(this);
    		sort.set($sort);
    		$$invalidate(1, sortValues);
    	}

    	$$self.$capture_state = () => ({ sort, sortValues, $sort });
    	return [$sort, sortValues, select_change_handler];
    }

    class Sort extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sort",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/SingleHeader.svelte generated by Svelte v3.29.7 */
    const file$9 = "src/components/SingleHeader.svelte";

    function create_fragment$a(ctx) {
    	let div4;
    	let div1;
    	let div0;
    	let h6;
    	let raw_value = /*podcast*/ ctx[0].description + "";
    	let t;
    	let div3;
    	let div2;
    	let rssbutton;
    	let current;

    	rssbutton = new RssButton({
    			props: {
    				identifier: /*podcast*/ ctx[0].identifier
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			t = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(rssbutton.$$.fragment);
    			attr_dev(h6, "class", "description");
    			add_location(h6, file$9, 66, 6, 1184);
    			attr_dev(div0, "class", "d-flex justify-content-start");
    			add_location(div0, file$9, 65, 4, 1135);
    			attr_dev(div1, "class", "col-12 col-md-10 d-flex align-items-start");
    			add_location(div1, file$9, 64, 2, 1075);
    			attr_dev(div2, "class", "d-flex justify-content-between");
    			add_location(div2, file$9, 73, 4, 1374);
    			attr_dev(div3, "class", "col-12 col-md-2 d-flex flex-column align-items-end justify-content-end pt-4");
    			add_location(div3, file$9, 72, 2, 1280);
    			attr_dev(div4, "class", "row align-items-center h-100 sub-menu svelte-9iaj4n");
    			add_location(div4, file$9, 62, 0, 1020);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			h6.innerHTML = raw_value;
    			append_dev(div4, t);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(rssbutton, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*podcast*/ 1) && raw_value !== (raw_value = /*podcast*/ ctx[0].description + "")) h6.innerHTML = raw_value;			const rssbutton_changes = {};
    			if (dirty & /*podcast*/ 1) rssbutton_changes.identifier = /*podcast*/ ctx[0].identifier;
    			rssbutton.$set(rssbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(rssbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(rssbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(rssbutton);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SingleHeader", slots, []);
    	let { podcast } = $$props;
    	let { cover } = $$props;
    	let { compact } = $$props;
    	const writable_props = ["podcast", "cover", "compact"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SingleHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("podcast" in $$props) $$invalidate(0, podcast = $$props.podcast);
    		if ("cover" in $$props) $$invalidate(1, cover = $$props.cover);
    		if ("compact" in $$props) $$invalidate(2, compact = $$props.compact);
    	};

    	$$self.$capture_state = () => ({ RssButton, Sort, podcast, cover, compact });

    	$$self.$inject_state = $$props => {
    		if ("podcast" in $$props) $$invalidate(0, podcast = $$props.podcast);
    		if ("cover" in $$props) $$invalidate(1, cover = $$props.cover);
    		if ("compact" in $$props) $$invalidate(2, compact = $$props.compact);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [podcast, cover, compact];
    }

    class SingleHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { podcast: 0, cover: 1, compact: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SingleHeader",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*podcast*/ ctx[0] === undefined && !("podcast" in props)) {
    			console.warn("<SingleHeader> was created without expected prop 'podcast'");
    		}

    		if (/*cover*/ ctx[1] === undefined && !("cover" in props)) {
    			console.warn("<SingleHeader> was created without expected prop 'cover'");
    		}

    		if (/*compact*/ ctx[2] === undefined && !("compact" in props)) {
    			console.warn("<SingleHeader> was created without expected prop 'compact'");
    		}
    	}

    	get podcast() {
    		throw new Error("<SingleHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set podcast(value) {
    		throw new Error("<SingleHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cover() {
    		throw new Error("<SingleHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cover(value) {
    		throw new Error("<SingleHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get compact() {
    		throw new Error("<SingleHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set compact(value) {
    		throw new Error("<SingleHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Filter.svelte generated by Svelte v3.29.7 */
    const file$a = "src/components/Filter.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>   import { filter, feeds }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>   import { filter, feeds }",
    		ctx
    	});

    	return block;
    }

    // (50:26)    <select class="form-control text-primary selectText text-center" bind:value={$filter}
    function create_then_block(ctx) {
    	let select;
    	let option;
    	let mounted;
    	let dispose;
    	let each_value = /*feeds*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");
    			option = element("option");
    			option.textContent = "Tutti i contenuti";

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			option.__value = "";
    			option.value = option.__value;
    			add_location(option, file$a, 51, 4, 1004);
    			attr_dev(select, "class", "form-control text-primary selectText text-center svelte-zq026o");
    			if (/*$filter*/ ctx[1] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$a, 50, 2, 913);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);
    			append_dev(select, option);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select, null);
    			}

    			select_option(select, /*$filter*/ ctx[1]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$feeds*/ 1) {
    				each_value = /*feeds*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$filter, $feeds*/ 3) {
    				select_option(select, /*$filter*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(50:26)    <select class=\\\"form-control text-primary selectText text-center\\\" bind:value={$filter}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {#each feeds as feed}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*feed*/ ctx[4].metadata.title + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*feed*/ ctx[4].metadata.identifier;
    			option.value = option.__value;
    			add_location(option, file$a, 53, 6, 1080);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$feeds*/ 1 && t_value !== (t_value = /*feed*/ ctx[4].metadata.title + "")) set_data_dev(t, t_value);

    			if (dirty & /*$feeds*/ 1 && option_value_value !== (option_value_value = /*feed*/ ctx[4].metadata.identifier)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(53:4) {#each feeds as feed}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script>   import { filter, feeds }
    function create_pending_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script>   import { filter, feeds }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 3
    	};

    	handle_promise(promise = /*$feeds*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$feeds*/ 1 && promise !== (promise = /*$feeds*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[3] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $feeds;
    	let $filter;
    	validate_store(feeds, "feeds");
    	component_subscribe($$self, feeds, $$value => $$invalidate(0, $feeds = $$value));
    	validate_store(filter, "filter");
    	component_subscribe($$self, filter, $$value => $$invalidate(1, $filter = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Filter", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Filter> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		$filter = select_value(this);
    		filter.set($filter);
    	}

    	$$self.$capture_state = () => ({ filter, feeds, $feeds, $filter });
    	return [$feeds, $filter, select_change_handler];
    }

    class Filter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filter",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* node_modules/sv-bootstrap-modal/src/Modal.svelte generated by Svelte v3.29.7 */
    const file$b = "node_modules/sv-bootstrap-modal/src/Modal.svelte";

    // (82:0) {#if open}
    function create_if_block(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let div1_class_value;
    	let div1_intro;
    	let div1_outro;
    	let div2_transition;
    	let t;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
    	let if_block = /*open*/ ctx[0] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "modal-content");
    			add_location(div0, file$b, 98, 6, 2138);
    			attr_dev(div1, "class", div1_class_value = "modal-dialog " + /*dialogClasses*/ ctx[1] + " svelte-kboyzj");
    			attr_dev(div1, "role", "document");
    			add_location(div1, file$b, 93, 4, 1960);
    			attr_dev(div2, "class", "modal show svelte-kboyzj");
    			attr_dev(div2, "tabindex", "-1");
    			attr_dev(div2, "role", "dialog");
    			attr_dev(div2, "aria-labelledby", /*labelledby*/ ctx[3]);
    			attr_dev(div2, "aria-describedby", /*describedby*/ ctx[2]);
    			attr_dev(div2, "aria-modal", "true");
    			add_location(div2, file$b, 82, 2, 1682);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div2, "click", self(/*handleBackdrop*/ ctx[4]), false, false, false),
    					listen_dev(div2, "introend", /*onModalOpened*/ ctx[5], false, false, false),
    					listen_dev(div2, "outroend", /*onModalClosed*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4096) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*dialogClasses*/ 2 && div1_class_value !== (div1_class_value = "modal-dialog " + /*dialogClasses*/ ctx[1] + " svelte-kboyzj")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*labelledby*/ 8) {
    				attr_dev(div2, "aria-labelledby", /*labelledby*/ ctx[3]);
    			}

    			if (!current || dirty & /*describedby*/ 4) {
    				attr_dev(div2, "aria-describedby", /*describedby*/ ctx[2]);
    			}

    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				if (!div1_intro) div1_intro = create_in_transition(div1, fly, { y: -50, duration: 300 });
    				div1_intro.start();
    			});

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fly, { y: -50, duration: 300, easing: quintOut });
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div1_outro) div1_outro.end();
    			if (detaching && div2_transition) div2_transition.end();
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:0) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (104:2) {#if open}
    function create_if_block_1(ctx) {
    	let div;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "modal-backdrop show");
    			add_location(div, file$b, 104, 4, 2233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: 150 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(104:2) {#if open}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function attachEvent(target, ...args) {
    	target.addEventListener(...args);

    	return {
    		remove: () => target.removeEventListener(...args)
    	};
    }

    function checkClass(className) {
    	return document.body.classList.contains(className);
    }

    function modalOpen() {
    	if (!checkClass("modal-open")) {
    		document.body.classList.add("modal-open");
    	}
    }

    function modalClose() {
    	if (checkClass("modal-open")) {
    		document.body.classList.remove("modal-open");
    	}
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);

    	const noop = () => {
    		
    	};

    	let { open = false } = $$props;
    	let { dialogClasses = "" } = $$props;
    	let { backdrop = true } = $$props;
    	let { ignoreBackdrop = false } = $$props;
    	let { keyboard = true } = $$props;
    	let { describedby = "" } = $$props;
    	let { labelledby = "" } = $$props;
    	let { onOpened = noop } = $$props;
    	let { onClosed = noop } = $$props;
    	let _keyboardEvent;

    	function handleBackdrop(event) {
    		if (backdrop && !ignoreBackdrop) {
    			event.stopPropagation();
    			$$invalidate(0, open = false);
    		}
    	}

    	function onModalOpened() {
    		if (keyboard) {
    			_keyboardEvent = attachEvent(document, "keydown", e => {
    				if (event.key === "Escape") {
    					$$invalidate(0, open = false);
    				}
    			});
    		}

    		onOpened();
    	}

    	function onModalClosed() {
    		if (_keyboardEvent) {
    			_keyboardEvent.remove();
    		}

    		onClosed();
    	}

    	const writable_props = [
    		"open",
    		"dialogClasses",
    		"backdrop",
    		"ignoreBackdrop",
    		"keyboard",
    		"describedby",
    		"labelledby",
    		"onOpened",
    		"onClosed"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("dialogClasses" in $$props) $$invalidate(1, dialogClasses = $$props.dialogClasses);
    		if ("backdrop" in $$props) $$invalidate(7, backdrop = $$props.backdrop);
    		if ("ignoreBackdrop" in $$props) $$invalidate(8, ignoreBackdrop = $$props.ignoreBackdrop);
    		if ("keyboard" in $$props) $$invalidate(9, keyboard = $$props.keyboard);
    		if ("describedby" in $$props) $$invalidate(2, describedby = $$props.describedby);
    		if ("labelledby" in $$props) $$invalidate(3, labelledby = $$props.labelledby);
    		if ("onOpened" in $$props) $$invalidate(10, onOpened = $$props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(11, onClosed = $$props.onClosed);
    		if ("$$scope" in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		quintOut,
    		noop,
    		open,
    		dialogClasses,
    		backdrop,
    		ignoreBackdrop,
    		keyboard,
    		describedby,
    		labelledby,
    		onOpened,
    		onClosed,
    		_keyboardEvent,
    		attachEvent,
    		checkClass,
    		modalOpen,
    		modalClose,
    		handleBackdrop,
    		onModalOpened,
    		onModalClosed
    	});

    	$$self.$inject_state = $$props => {
    		if ("open" in $$props) $$invalidate(0, open = $$props.open);
    		if ("dialogClasses" in $$props) $$invalidate(1, dialogClasses = $$props.dialogClasses);
    		if ("backdrop" in $$props) $$invalidate(7, backdrop = $$props.backdrop);
    		if ("ignoreBackdrop" in $$props) $$invalidate(8, ignoreBackdrop = $$props.ignoreBackdrop);
    		if ("keyboard" in $$props) $$invalidate(9, keyboard = $$props.keyboard);
    		if ("describedby" in $$props) $$invalidate(2, describedby = $$props.describedby);
    		if ("labelledby" in $$props) $$invalidate(3, labelledby = $$props.labelledby);
    		if ("onOpened" in $$props) $$invalidate(10, onOpened = $$props.onOpened);
    		if ("onClosed" in $$props) $$invalidate(11, onClosed = $$props.onClosed);
    		if ("_keyboardEvent" in $$props) _keyboardEvent = $$props._keyboardEvent;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*open*/ 1) {
    			// Watching changes for Open vairable
    			 {
    				if (open) {
    					modalOpen();
    				} else {
    					modalClose();
    				}
    			}
    		}
    	};

    	return [
    		open,
    		dialogClasses,
    		describedby,
    		labelledby,
    		handleBackdrop,
    		onModalOpened,
    		onModalClosed,
    		backdrop,
    		ignoreBackdrop,
    		keyboard,
    		onOpened,
    		onClosed,
    		$$scope,
    		slots
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {
    			open: 0,
    			dialogClasses: 1,
    			backdrop: 7,
    			ignoreBackdrop: 8,
    			keyboard: 9,
    			describedby: 2,
    			labelledby: 3,
    			onOpened: 10,
    			onClosed: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get open() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set open(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dialogClasses() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dialogClasses(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get backdrop() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set backdrop(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ignoreBackdrop() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ignoreBackdrop(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyboard() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyboard(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get describedby() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set describedby(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get labelledby() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set labelledby(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onOpened() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onOpened(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClosed() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClosed(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/MultiHeader.svelte generated by Svelte v3.29.7 */
    const file$c = "src/components/MultiHeader.svelte";

    // (66:2) <Modal bind:open={isOpen}>
    function create_default_slot$1(ctx) {
    	let div0;
    	let button;
    	let span;
    	let t1;
    	let div1;
    	let h30;
    	let t2;
    	let a0;
    	let t4;
    	let a1;
    	let t6;
    	let a2;
    	let t8;
    	let t9;
    	let h31;
    	let t11;
    	let h32;
    	let t13;
    	let h33;
    	let t15;
    	let h35;
    	let t16;
    	let a3;
    	let t18;
    	let br0;
    	let t19;
    	let a4;
    	let t21;
    	let br1;
    	let t22;
    	let h34;
    	let t23;
    	let a5;
    	let t25;
    	let a6;
    	let t27;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			button = element("button");
    			span = element("span");
    			span.textContent = "×";
    			t1 = space();
    			div1 = element("div");
    			h30 = element("h3");
    			t2 = text("RADIO QUARTIERE è una forma di socialità nata nella Milano in Quarantena della Primavera 2020. Una radio autoprodotta e senza palinsesto nata da un gruppo di amici che vivono nella zona Nord-Ovest della città che poi si è diffusa nel resto della città e poi nel globo con radio gemelle sparse in ");
    			a0 = element("a");
    			a0.textContent = "Libano";
    			t4 = text(", ");
    			a1 = element("a");
    			a1.textContent = "Palestina";
    			t6 = text(", ");
    			a2 = element("a");
    			a2.textContent = "Tunisia";
    			t8 = text("...");
    			t9 = space();
    			h31 = element("h3");
    			h31.textContent = "C’è stata la musica da condividere e ascoltare insieme, chi ha raccontato la città che rallentava, chi leggeva dei libri, chi trasmetteva spezzoni di film, chi mandava registrazioni e chi faceva dj set. Ci sono stati i saluti agli amici che ascoltavano dall’Italia e dal resto del mondo, i messaggi vocali, le dirette, i quiz, i consigli per cucinare e le informazioni per la sopravvivenza.";
    			t11 = space();
    			h32 = element("h3");
    			h32.textContent = "Mancavano solo gli abbracci, ma chi l’ha ascoltata dice di aver sentito anche quelli.";
    			t13 = space();
    			h33 = element("h3");
    			h33.textContent = "La radio ha interrotto le trasmissioni. Questo sito è un'archivio che raccoglie alcuni dei contributi che sono stati mandati in onda dal 10 Marzo al 12 Maggio 2020.";
    			t15 = space();
    			h35 = element("h3");
    			t16 = text("Per info ⟶ ");
    			a3 = element("a");
    			a3.textContent = "Email";
    			t18 = text(".");
    			br0 = element("br");
    			t19 = text("\n      Per aggiornamenti ⟶ ");
    			a4 = element("a");
    			a4.textContent = "Telegram";
    			t21 = text(".");
    			br1 = element("br");
    			t22 = space();
    			h34 = element("h3");
    			t23 = text("Powered by ");
    			a5 = element("a");
    			a5.textContent = "OpenPod";
    			t25 = text(" and ");
    			a6 = element("a");
    			a6.textContent = "Archive.org";
    			t27 = text(".");
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file$c, 68, 10, 1591);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "close mr-1 svelte-1rh4fed");
    			add_location(button, file$c, 67, 10, 1505);
    			attr_dev(div0, "class", "modal-header svelte-1rh4fed");
    			add_location(div0, file$c, 66, 4, 1468);
    			attr_dev(a0, "href", "https://yamakan.place/beirut/");
    			add_location(a0, file$c, 72, 306, 1995);
    			attr_dev(a1, "href", "https://yamakan.place/palestine/");
    			add_location(a1, file$c, 72, 358, 2047);
    			attr_dev(a2, "href", "https://yamakan.place/tunis/");
    			add_location(a2, file$c, 72, 416, 2105);
    			add_location(h30, file$c, 72, 6, 1695);
    			add_location(h31, file$c, 73, 6, 2170);
    			add_location(h32, file$c, 74, 6, 2576);
    			add_location(h33, file$c, 75, 6, 2677);
    			attr_dev(a3, "href", "mailto:radioquartiere@gmail.com");
    			add_location(a3, file$c, 76, 27, 2878);
    			add_location(br0, file$c, 76, 79, 2930);
    			attr_dev(a4, "href", "https://t.me/radioquartiere");
    			add_location(a4, file$c, 77, 33, 2968);
    			add_location(br1, file$c, 77, 84, 3019);
    			attr_dev(a5, "href", "https://openpod.abbiamoundominio.org/");
    			add_location(a5, file$c, 78, 21, 3045);
    			attr_dev(a6, "href", "https://openpod.abbiamoundominio.org/");
    			add_location(a6, file$c, 78, 85, 3109);
    			add_location(h34, file$c, 78, 6, 3030);
    			add_location(h35, file$c, 76, 6, 2857);
    			attr_dev(div1, "class", "modal-body svelte-1rh4fed");
    			add_location(div1, file$c, 71, 2, 1664);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button);
    			append_dev(button, span);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h30);
    			append_dev(h30, t2);
    			append_dev(h30, a0);
    			append_dev(h30, t4);
    			append_dev(h30, a1);
    			append_dev(h30, t6);
    			append_dev(h30, a2);
    			append_dev(h30, t8);
    			append_dev(div1, t9);
    			append_dev(div1, h31);
    			append_dev(div1, t11);
    			append_dev(div1, h32);
    			append_dev(div1, t13);
    			append_dev(div1, h33);
    			append_dev(div1, t15);
    			append_dev(div1, h35);
    			append_dev(h35, t16);
    			append_dev(h35, a3);
    			append_dev(h35, t18);
    			append_dev(h35, br0);
    			append_dev(h35, t19);
    			append_dev(h35, a4);
    			append_dev(h35, t21);
    			append_dev(h35, br1);
    			append_dev(h35, t22);
    			append_dev(h35, h34);
    			append_dev(h34, t23);
    			append_dev(h34, a5);
    			append_dev(h34, t25);
    			append_dev(h34, a6);
    			append_dev(h34, t27);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(66:2) <Modal bind:open={isOpen}>",
    		ctx
    	});

    	return block;
    }

    // (94:2) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$c, 94, 4, 3499);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(94:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (89:2) {#if $filter}
    function create_if_block$1(ctx) {
    	let singleheader;
    	let current;

    	singleheader = new SingleHeader({
    			props: {
    				compact: true,
    				podcast: /*feed*/ ctx[2].metadata,
    				cover: /*feed*/ ctx[2].files.filter(func)[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(singleheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(singleheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const singleheader_changes = {};
    			if (dirty & /*feed*/ 4) singleheader_changes.podcast = /*feed*/ ctx[2].metadata;
    			if (dirty & /*feed*/ 4) singleheader_changes.cover = /*feed*/ ctx[2].files.filter(func)[0];
    			singleheader.$set(singleheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(singleheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(singleheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(singleheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(89:2) {#if $filter}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div2;
    	let div1;
    	let filter_1;
    	let t1;
    	let div3;
    	let modal;
    	let updating_open;
    	let t2;
    	let h4;
    	let t4;
    	let div6;
    	let div5;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	filter_1 = new Filter({ $$inline: true });

    	function modal_open_binding(value) {
    		/*modal_open_binding*/ ctx[7].call(null, value);
    	}

    	let modal_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*isOpen*/ ctx[1] !== void 0) {
    		modal_props.open = /*isOpen*/ ctx[1];
    	}

    	modal = new Modal({ props: modal_props, $$inline: true });
    	binding_callbacks.push(() => bind(modal, "open", modal_open_binding));
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$filter*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			create_component(filter_1.$$.fragment);
    			t1 = space();
    			div3 = element("div");
    			create_component(modal.$$.fragment);
    			t2 = space();
    			h4 = element("h4");
    			h4.textContent = "Info";
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");
    			if_block.c();
    			attr_dev(img, "class", "mr-2 ml-0");
    			if (img.src !== (img_src_value = `https://archive.org/download/${/*account*/ ctx[0].metadata.identifier}/${/*imgFile*/ ctx[4].name}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "height", "100px");
    			attr_dev(img, "width", "auto");
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$c, 48, 8, 990);
    			attr_dev(div0, "class", "col-md-1 col-6 justify-content-start");
    			add_location(div0, file$c, 47, 2, 931);
    			attr_dev(div1, "class", "d-flex flex-column flex-md-row w-100 align-items-center my-3 my-md-0");
    			add_location(div1, file$c, 58, 2, 1255);
    			attr_dev(div2, "class", "col-md-6 offset-md-2 col-12 order-md-1 order-2");
    			add_location(div2, file$c, 56, 2, 1191);
    			attr_dev(h4, "class", "text-right svelte-1rh4fed");
    			add_location(h4, file$c, 82, 2, 3204);
    			attr_dev(div3, "class", "col-md-1 offset-md-2 col-6 float-right order-md-3");
    			add_location(div3, file$c, 64, 0, 1371);
    			attr_dev(div4, "class", "row pt-2 pb-2 pd-3 header-container align-items-center h-100");
    			add_location(div4, file$c, 45, 0, 853);
    			attr_dev(div5, "class", "col-12 col-md-12");
    			add_location(div5, file$c, 87, 0, 3304);
    			attr_dev(div6, "class", "row");
    			add_location(div6, file$c, 86, 0, 3286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			mount_component(filter_1, div1, null);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			mount_component(modal, div3, null);
    			append_dev(div3, t2);
    			append_dev(div3, h4);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			if_blocks[current_block_type_index].m(div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(h4, "click", /*click_handler_1*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*account*/ 1 && img.src !== (img_src_value = `https://archive.org/download/${/*account*/ ctx[0].metadata.identifier}/${/*imgFile*/ ctx[4].name}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			const modal_changes = {};

    			if (dirty & /*$$scope, isOpen*/ 514) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_open && dirty & /*isOpen*/ 2) {
    				updating_open = true;
    				modal_changes.open = /*isOpen*/ ctx[1];
    				add_flush_callback(() => updating_open = false);
    			}

    			modal.$set(modal_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div5, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(filter_1.$$.fragment, local);
    			transition_in(modal.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(filter_1.$$.fragment, local);
    			transition_out(modal.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(filter_1);
    			destroy_component(modal);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div6);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = d => d.format === "Item Image";

    function instance$d($$self, $$props, $$invalidate) {
    	let $filter;
    	validate_store(filter, "filter");
    	component_subscribe($$self, filter, $$value => $$invalidate(3, $filter = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MultiHeader", slots, []);
    	let isOpen = false;
    	let { account } = $$props;
    	let { feeds } = $$props;
    	let feed;
    	let imgFile = account.files.filter(d => d.format === "Item Image")[0];
    	const writable_props = ["account", "feeds"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiHeader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(1, isOpen = false);

    	function modal_open_binding(value) {
    		isOpen = value;
    		$$invalidate(1, isOpen);
    	}

    	const click_handler_1 = () => $$invalidate(1, isOpen = true);

    	$$self.$$set = $$props => {
    		if ("account" in $$props) $$invalidate(0, account = $$props.account);
    		if ("feeds" in $$props) $$invalidate(5, feeds = $$props.feeds);
    	};

    	$$self.$capture_state = () => ({
    		filter,
    		Filter,
    		SingleHeader,
    		Modal,
    		isOpen,
    		account,
    		feeds,
    		feed,
    		imgFile,
    		$filter
    	});

    	$$self.$inject_state = $$props => {
    		if ("isOpen" in $$props) $$invalidate(1, isOpen = $$props.isOpen);
    		if ("account" in $$props) $$invalidate(0, account = $$props.account);
    		if ("feeds" in $$props) $$invalidate(5, feeds = $$props.feeds);
    		if ("feed" in $$props) $$invalidate(2, feed = $$props.feed);
    		if ("imgFile" in $$props) $$invalidate(4, imgFile = $$props.imgFile);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$filter, feeds, account*/ 41) {
    			 if ($filter && filter !== "") {
    				$$invalidate(2, feed = feeds.filter(d => d.metadata.identifier === $filter)[0]);
    			} else {
    				$$invalidate(2, feed = account);
    			}
    		}
    	};

    	return [
    		account,
    		isOpen,
    		feed,
    		$filter,
    		imgFile,
    		feeds,
    		click_handler,
    		modal_open_binding,
    		click_handler_1
    	];
    }

    class MultiHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { account: 0, feeds: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MultiHeader",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*account*/ ctx[0] === undefined && !("account" in props)) {
    			console.warn("<MultiHeader> was created without expected prop 'account'");
    		}

    		if (/*feeds*/ ctx[5] === undefined && !("feeds" in props)) {
    			console.warn("<MultiHeader> was created without expected prop 'feeds'");
    		}
    	}

    	get account() {
    		throw new Error("<MultiHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set account(value) {
    		throw new Error("<MultiHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get feeds() {
    		throw new Error("<MultiHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set feeds(value) {
    		throw new Error("<MultiHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var logo = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA2MDguMyAxODAuOSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNjA4LjMgMTgwLjk7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDpub25lO30KCS5zdDF7ZmlsbDojNzk0REZGO30KCS5zdDJ7ZmlsbDojMjEyNTI5O30KCS5zdDN7ZmlsbDp1cmwoI1NWR0lEXzFfKTt9Cgkuc3Q0e2ZpbGw6dXJsKCNTVkdJRF8yXyk7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDk0LjcsNDcuNWMtMy41LTIuMS03LjYtMy4yLTEyLjItMy4ycy04LjcsMS4xLTEyLjIsMy4yYy0zLjUsMi4xLTYuMyw1LjEtOC4zLDguOGMtMiwzLjgtMyw4LjEtMywxMi45CgljMCw0LjksMSw5LjEsMywxMi44YzIsMy43LDQuOCw2LjYsOC4zLDguN3M3LjYsMy4yLDEyLjIsMy4yczguNi0xLjEsMTIuMi0zLjJjMy41LTIuMSw2LjMtNSw4LjMtOC43czMtOCwzLTEyLjhjMC00LjktMS05LjItMy0xMi45CglDNTAxLDUyLjYsNDk4LjMsNDkuNyw0OTQuNyw0Ny41eiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjI5LjQsNDUuOWMtMy4xLTItNi44LTMtMTEuMy0zYy01LDAtOS4zLDEuMS0xMi45LDMuM2MtMy42LDIuMi02LjMsNS4yLTguMSw5LjFjLTEuMSwyLjItMS44LDQuNi0yLjMsNy4xSDIzOQoJYy0wLjQtMi45LTEuMi01LjctMi40LTguMUMyMzQuOSw1MC43LDIzMi41LDQ3LjksMjI5LjQsNDUuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQ4LjcsNDYuNWMtMy41LTIuMS03LjYtMy4yLTEyLjItMy4ycy04LjcsMS4xLTEyLjIsMy4yYy0zLjUsMi4xLTYuMyw1LjEtOC4zLDguOGMtMiwzLjgtMyw4LjEtMywxMi45CgljMCw0LjksMSw5LjEsMywxMi44YzIsMy43LDQuOCw2LjYsOC4zLDguN0MyNy45LDkyLDMyLDkzLDM2LjUsOTNjNC42LDAsOC42LTEuMSwxMi4yLTMuMmMzLjUtMi4xLDYuMy01LDguMy04LjdzMy04LDMtMTIuOAoJYzAtNC45LTEtOS4yLTMtMTIuOUM1NSw1MS42LDUyLjMsNDguNyw0OC43LDQ2LjV6Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01ODQsNDUuNmMtMy41LTIuMi03LjUtMy4yLTEyLTMuMmMtNC40LDAtOC40LDEuMS0xMiwzLjJjLTMuNiwyLjItNi40LDUuMS04LjUsOC44cy0zLjEsNy45LTMuMSwxMi43CgljMCw0LjcsMSw4LjksMy4xLDEyLjdjMi4xLDMuOCw0LjksNi44LDguNSw4LjljMy42LDIuMiw3LjYsMy4yLDEyLDMuMmM0LjUsMCw4LjUtMS4xLDEyLTMuMmMzLjUtMi4yLDYuMy01LjEsOC4zLTguOXMzLTgsMy0xMi43CgljMC00LjgtMS05LTMtMTIuN0M1OTAuMyw1MC43LDU4Ny41LDQ3LjgsNTg0LDQ1LjZ6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik01NS4zLDM2LjJjLTUuNS0zLjEtMTEuNy00LjctMTguOC00LjdTMjMsMzMuMSwxNy42LDM2LjJjLTUuNSwzLjEtOS44LDcuNS0xMi45LDEzQzEuNiw1NC42LDAsNjEsMCw2OC4zCgljMCw3LjEsMS42LDEzLjUsNC43LDE5czcuNCw5LjgsMTIuOSwxM2M1LjUsMy4xLDExLjgsNC43LDE4LjksNC43czEzLjUtMS42LDE4LjktNC43YzUuNS0zLjEsOS44LTcuNSwxMi44LTEzCgljMy4xLTUuNSw0LjYtMTEuOCw0LjYtMTlzLTEuNi0xMy42LTQuNy0xOS4xQzY1LjEsNDMuNiw2MC44LDM5LjMsNTUuMywzNi4yeiBNNTcsODEuMWMtMiwzLjctNC43LDYuNi04LjMsOC43CglDNDUuMiw5Miw0MS4xLDkzLDM2LjUsOTNzLTguNy0xLjEtMTIuMi0zLjJzLTYuMy01LTguMy04LjdzLTMtOC0zLTEyLjhjMC00LjksMS05LjIsMy0xMi45YzItMy44LDQuOC02LjcsOC4zLTguOHM3LjYtMy4yLDEyLjItMy4yCglzOC42LDEuMSwxMi4yLDMuMmMzLjUsMi4xLDYuMyw1LjEsOC4zLDguOGMyLDMuOCwzLDguMSwzLDEyLjlDNjAsNzMuMSw1OSw3Ny40LDU3LDgxLjF6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xNDguMSw1OS4zYy01LjUtMy4yLTExLjctNC44LTE4LjctNC44Yy02LjksMC0xMy4xLDEuNi0xOC41LDQuOGMtNS41LDMuMi05LjgsNy42LTEzLDEzLjJTOTMuMSw4NC4zLDkzLDkxLjMKCXY2MC40YzAsMS45LDAuNiwzLjYsMS45LDQuOGMxLjMsMS4zLDIuOSwxLjksNC44LDEuOWMyLDAsMy43LTAuNiw0LjktMS45YzEuMi0xLjMsMS45LTIuOSwxLjktNC44VjExNmMzLjEsMy43LDYuOCw2LjYsMTEuMiw4LjgKCWM0LjQsMi4yLDkuMiwzLjIsMTQuNCwzLjJjNi40LDAsMTIuMi0xLjYsMTcuMy00LjhjNS4xLTMuMiw5LjItNy42LDEyLjEtMTMuMWMzLTUuNSw0LjQtMTEuOCw0LjQtMTguN2MwLTctMS42LTEzLjItNC44LTE4LjgKCUMxNTgsNjYuOSwxNTMuNiw2Mi41LDE0OC4xLDU5LjN6Ii8+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0yMzUuOSwzNmMtNC45LTMtMTAuOS00LjYtMTcuNy00LjZjLTcsMC0xMy4yLDEuNi0xOC41LDQuN2MtNS40LDMuMS05LjYsNy41LTEyLjYsMTNzLTQuNiwxMS45LTQuNiwxOS4xCgljMCw3LjEsMS42LDEzLjUsNC44LDE5czcuNyw5LjgsMTMuNCwxM2M1LjcsMy4xLDEyLjIsNC43LDE5LjUsNC43YzQuMSwwLDguMy0wLjcsMTIuOC0yLjJzOC4yLTMuNCwxMS4yLTUuOAoJYzEuNS0xLjEsMi4yLTIuNSwyLjEtNC4xYy0wLjEtMS42LTAuOS0zLTIuNC00LjRjLTEuMS0xLTIuNS0xLjQtNC0xLjRzLTMsMC42LTQuMywxLjVjLTEuOCwxLjMtNC4xLDIuNS03LDMuNXMtNS43LDEuNS04LjQsMS41CgljLTUsMC05LjUtMS4xLTEzLjQtMy4zYy0zLjktMi4yLTYuOS01LjItOS4xLTljLTEuNS0yLjUtMi40LTUuMy0yLjktOC4zaDUwLjNjMS44LDAsMy4yLTAuNiw0LjQtMS43YzEuMS0xLjEsMS43LTIuNSwxLjctNC4yCgljMC03LTEuMy0xMy4xLTMuOS0xOC41QzI0NC42LDQzLjMsMjQwLjksMzkuMSwyMzUuOSwzNnogTTE5NC45LDYyLjNjMC41LTIuNSwxLjItNC45LDIuMy03LjFjMS45LTMuOCw0LjYtNi45LDguMS05LjEKCWMzLjYtMi4yLDcuOS0zLjMsMTIuOS0zLjNjNC40LDAsOC4yLDEsMTEuMywzczUuNSw0LjgsNy4xLDguM2MxLjIsMi41LDIsNS4yLDIuNCw4LjFoLTQ0LjFWNjIuM3oiLz4KPHBhdGggY2xhc3M9InN0MSIgZD0iTTMyMC43LDM1LjJjLTQuOC0yLjYtMTAuMy0zLjktMTYuNC0zLjljLTUuOCwwLTExLjEsMS4zLTE1LjgsMy44Yy0yLjUsMS40LTQuOCwzLjEtNi44LDV2LTEuNAoJYzAtMi0wLjYtMy43LTEuOS00LjljLTEuMi0xLjItMi45LTEuOS00LjktMS45Yy0xLjksMC0zLjYsMC42LTQuOCwxLjljLTEuMywxLjItMS45LDIuOS0xLjksNC45djU5YzAsMS45LDAuNiwzLjYsMS45LDQuOAoJYzEuMywxLjMsMi45LDEuOSw0LjgsMS45YzIsMCwzLjctMC42LDQuOS0xLjljMS4yLTEuMywxLjktMi45LDEuOS00LjhWNjAuNGMwLTMuMywwLjktNi4yLDIuNi04LjdjMS44LTIuNSw0LjEtNC41LDcuMi02CgljMy0xLjUsNi40LTIuMywxMC4xLTIuM2M0LjEsMCw3LjcsMC44LDEwLjgsMi4zYzMuMSwxLjUsNS42LDMuOSw3LjUsNy4xYzEuOSwzLjIsMi44LDcuMywyLjgsMTIuM3YzMi42YzAsMS45LDAuNiwzLjYsMS45LDQuOAoJYzEuMywxLjMsMi45LDEuOSw0LjgsMS45czMuNi0wLjYsNC44LTEuOWMxLjMtMS4zLDEuOS0yLjksMS45LTQuOFY2NS4yYzAtNy4zLTEuNC0xMy41LTQuMi0xOC41QzMyOS4zLDQxLjYsMzI1LjUsMzcuOCwzMjAuNywzNS4yegoJIi8+CjxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik00MTEuNywzOS4zYy01LjUtMy4yLTExLjctNC44LTE4LjctNC44Yy02LjksMC0xMy4xLDEuNi0xOC41LDQuOGMtNS41LDMuMi05LjgsNy42LTEzLDEzLjJzLTQuOCwxMS44LTQuOSwxOC44Cgl2NjAuNGMwLDEuOSwwLjYsMy42LDEuOSw0LjhjMS4zLDEuMywyLjksMS45LDQuOCwxLjljMiwwLDMuNy0wLjYsNC45LTEuOWMxLjItMS4zLDEuOS0yLjksMS45LTQuOFY5NS45YzMuMSwzLjcsNi44LDYuNiwxMS4yLDguOAoJYzQuNCwyLjIsOS4yLDMuMiwxNC40LDMuMmM2LjQsMCwxMi4yLTEuNiwxNy4zLTQuOGM1LjEtMy4yLDkuMi03LjYsMTIuMS0xMy4xYzMtNS41LDQuNC0xMS44LDQuNC0xOC43YzAtNy0xLjYtMTMuMi00LjgtMTguOAoJUzQxNy4yLDQyLjUsNDExLjcsMzkuM3oiLz4KPHBhdGggY2xhc3M9InN0MiIgZD0iTTUwMS40LDM3LjJjLTUuNS0zLjEtMTEuNy00LjctMTguOC00LjdjLTcuMSwwLTEzLjUsMS42LTE4LjksNC43Yy01LjUsMy4xLTkuOCw3LjUtMTIuOSwxM3MtNC43LDExLjktNC43LDE5LjEKCWMwLDcuMSwxLjYsMTMuNSw0LjcsMTlzNy40LDkuOCwxMi45LDEzYzUuNSwzLjEsMTEuOCw0LjcsMTguOSw0LjdzMTMuNS0xLjYsMTguOS00LjdjNS41LTMuMSw5LjgtNy41LDEyLjgtMTMKCWMzLjEtNS41LDQuNi0xMS44LDQuNi0xOXMtMS42LTEzLjYtNC43LTE5LjFDNTExLjEsNDQuNiw1MDYuOCw0MC4zLDUwMS40LDM3LjJ6IE01MDMsODIuMWMtMiwzLjctNC43LDYuNi04LjMsOC43CgljLTMuNSwyLjEtNy42LDMuMi0xMi4yLDMuMnMtOC43LTEuMS0xMi4yLTMuMnMtNi4zLTUtOC4zLTguN3MtMy04LTMtMTIuOGMwLTQuOSwxLTkuMiwzLTEyLjljMi0zLjgsNC44LTYuNyw4LjMtOC44CglzNy42LTMuMiwxMi4yLTMuMnM4LjYsMS4xLDEyLjIsMy4yYzMuNSwyLjEsNi4zLDUuMSw4LjMsOC44YzIsMy44LDMsOC4xLDMsMTIuOVM1MDUsNzguNCw1MDMsODIuMXoiLz4KPHBhdGggY2xhc3M9InN0MiIgZD0iTTYwNi41LDEuOWMtMS4yLTEuMi0yLjktMS45LTQuOS0xLjljLTEuOSwwLTMuNiwwLjYtNC44LDEuOWMtMS4zLDEuMi0xLjksMi45LTEuOSw0Ljl2MzUuNwoJYy0zLTMuNy02LjctNi42LTExLjEtOC44Yy00LjQtMi4yLTkuMi0zLjItMTQuNC0zLjJjLTYuNCwwLTEyLjIsMS42LTE3LjMsNC44cy05LjIsNy42LTEyLjEsMTMuMWMtMyw1LjUtNC40LDExLjgtNC40LDE4LjcKCWMwLDcsMS42LDEzLjIsNC44LDE4LjhjMy4yLDUuNiw3LjYsMTAsMTMuMSwxMy4yczExLjcsNC44LDE4LjYsNC44czEzLjEtMS42LDE4LjUtNC44YzUuNS0zLjIsOS44LTcuNiwxMy0xMy4yczQuOC0xMS44LDQuOC0xOC44CglWNi44QzYwOC4zLDQuNyw2MDcuNywzLjEsNjA2LjUsMS45eiBNNTkyLjMsNzkuOGMtMiwzLjgtNC44LDYuOC04LjMsOC45Yy0zLjUsMi4yLTcuNSwzLjItMTIsMy4yYy00LjQsMC04LjQtMS4xLTEyLTMuMgoJYy0zLjYtMi4yLTYuNC01LjEtOC41LTguOXMtMy4xLTgtMy4xLTEyLjdjMC00LjgsMS05LDMuMS0xMi43czQuOS02LjYsOC41LTguOHM3LjYtMy4yLDEyLTMuMmM0LjUsMCw4LjUsMS4xLDEyLDMuMgoJYzMuNSwyLjIsNi4zLDUuMSw4LjMsOC44czMsNy45LDMsMTIuN0M1OTUuNCw3MS44LDU5NC4zLDc2LDU5Mi4zLDc5Ljh6Ii8+CjxsaW5lYXJHcmFkaWVudCBpZD0iU1ZHSURfMV8iIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiB4MT0iOTMuMyIgeTE9IjE2Ljk5NTQiIHgyPSIzNjkuMyIgeTI9IjE2Ljk5NTQiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCAxODEuODg5OCkiPgoJPHN0b3AgIG9mZnNldD0iMi42MzczOTNlLTAyIiBzdHlsZT0ic3RvcC1jb2xvcjojNzk0REZGIi8+Cgk8c3RvcCAgb2Zmc2V0PSIwLjk3NTUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyMTI1MjkiLz4KPC9saW5lYXJHcmFkaWVudD4KPHBhdGggY2xhc3M9InN0MyIgZD0iTTkzLjMsMTc0LjRMOTMuMywxNzQuNGMwLTMuNCwyLjctNi4yLDYuMi02LjVsMjYyLjYtMTljMy45LTAuMyw3LjIsMi43LDcuMiw2LjVsMCwwYzAsMy40LTIuNyw2LjItNi4yLDYuNQoJbC0yNjIuNiwxOUM5Ni42LDE4MS4xLDkzLjMsMTc4LjEsOTMuMywxNzQuNHoiLz4KPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8yXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI5OS41IiB5MT0iMzkuNzM5OCIgeDI9IjM2My40IiB5Mj0iMzkuNzM5OCIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDE4MS44ODk4KSI+Cgk8c3RvcCAgb2Zmc2V0PSIyLjY4OTA2M2UtMDIiIHN0eWxlPSJzdG9wLWNvbG9yOiM3OTRERkYiLz4KCTxzdG9wICBvZmZzZXQ9IjAuOTc1NSIgc3R5bGU9InN0b3AtY29sb3I6IzIxMjUyOSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8cG9seWdvbiBjbGFzcz0ic3Q0IiBwb2ludHM9Ijk5LjUsMTQ1LjkgMzYyLjEsMTI1LjkgMzYzLjQsMTM4LjQgOTkuOCwxNTguNCAiLz4KPC9zdmc+';

    /* src/components/Loader.svelte generated by Svelte v3.29.7 */
    const file$d = "src/components/Loader.svelte";

    function create_fragment$e(ctx) {
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let span;
    	let div2_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			span = element("span");
    			span.textContent = "Carico...";
    			if (img.src !== (img_src_value = logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "openpod logo");
    			add_location(img, file$d, 27, 29, 576);
    			attr_dev(div0, "class", "logoContainer svelte-xt3jkv");
    			add_location(div0, file$d, 27, 2, 549);
    			attr_dev(span, "class", "sr-only");
    			add_location(span, file$d, 32, 4, 734);
    			attr_dev(div1, "class", "spinner-border text-primary mt-3");
    			set_style(div1, "width", "3rem");
    			set_style(div1, "height", "3rem");
    			attr_dev(div1, "role", "status");
    			add_location(div1, file$d, 28, 2, 622);
    			attr_dev(div2, "class", "loader bg-secondary d-flex flex-column align-items-center justify-content-center svelte-xt3jkv");
    			add_location(div2, file$d, 24, 0, 414);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, span);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { delay: 1000 }, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, { delay: 1000 }, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && div2_transition) div2_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loader", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ logo, fade });
    	return [];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.29.7 */
    const file$e = "src/components/Header.svelte";

    // (39:0) {:catch}
    function create_catch_block$1(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Qualcosa è andato storto!";
    			add_location(p, file$e, 40, 4, 1154);
    			attr_dev(div, "class", "alert alert-danger mt-3");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$e, 39, 2, 1099);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(39:0) {:catch}",
    		ctx
    	});

    	return block;
    }

    // (10:0) {:then feeds}
    function create_then_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*feeds*/ ctx[2].length > 1 && /*$account*/ ctx[1]) return 0;
    		if (/*feeds*/ ctx[2].length === 1) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(10:0) {:then feeds}",
    		ctx
    	});

    	return block;
    }

    // (28:2) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let p;
    	let t0;
    	let code0;
    	let t2;
    	let code1;
    	let t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t0 = text("Non hai inserito\n        ");
    			code0 = element("code");
    			code0.textContent = "feeds";
    			t2 = text("\n        o\n        ");
    			code1 = element("code");
    			code1.textContent = "account";
    			t4 = text("\n        correttamente nel tuo file di configurazione!");
    			add_location(code0, file$e, 31, 8, 946);
    			add_location(code1, file$e, 33, 8, 983);
    			add_location(p, file$e, 29, 6, 909);
    			attr_dev(div, "class", "alert alert-warning mt-3");
    			attr_dev(div, "role", "alert");
    			add_location(div, file$e, 28, 4, 851);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t0);
    			append_dev(p, code0);
    			append_dev(p, t2);
    			append_dev(p, code1);
    			append_dev(p, t4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(28:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:31) 
    function create_if_block_1$1(ctx) {
    	let singleheader;
    	let current;

    	singleheader = new SingleHeader({
    			props: {
    				compact: false,
    				podcast: /*feeds*/ ctx[2][0].metadata,
    				cover: /*feeds*/ ctx[2][0].files.filter(func$1).sort(func_1)[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(singleheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(singleheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const singleheader_changes = {};
    			if (dirty & /*$feeds*/ 1) singleheader_changes.podcast = /*feeds*/ ctx[2][0].metadata;
    			if (dirty & /*$feeds*/ 1) singleheader_changes.cover = /*feeds*/ ctx[2][0].files.filter(func$1).sort(func_1)[0];
    			singleheader.$set(singleheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(singleheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(singleheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(singleheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(13:31) ",
    		ctx
    	});

    	return block;
    }

    // (11:2) {#if feeds.length > 1 && $account}
    function create_if_block$2(ctx) {
    	let multiheader;
    	let current;

    	multiheader = new MultiHeader({
    			props: {
    				account: /*$account*/ ctx[1],
    				feeds: /*feeds*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(multiheader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(multiheader, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const multiheader_changes = {};
    			if (dirty & /*$account*/ 2) multiheader_changes.account = /*$account*/ ctx[1];
    			if (dirty & /*$feeds*/ 1) multiheader_changes.feeds = /*feeds*/ ctx[2];
    			multiheader.$set(multiheader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(multiheader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(multiheader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(multiheader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:2) {#if feeds.length > 1 && $account}",
    		ctx
    	});

    	return block;
    }

    // (8:15)    <Loader /> {:then feeds}
    function create_pending_block$1(ctx) {
    	let loader;
    	let current;
    	loader = new Loader({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(loader.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(loader, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(loader, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(8:15)    <Loader /> {:then feeds}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 2,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*$feeds*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$feeds*/ 1 && promise !== (promise = /*$feeds*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				const child_ctx = ctx.slice();
    				child_ctx[2] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func$1 = d => d.format.match(/JPG|JPEG|PNG|GIF|Item Image/gm);

    const func_1 = (a, b) => {
    	if (a.format === "Item Image" && b.format !== "Item Image") {
    		return -1;
    	} else if (b.format === "Item Image" && a.format !== "Item Image") {
    		return 1;
    	} else {
    		return 0;
    	}
    };

    function instance$f($$self, $$props, $$invalidate) {
    	let $feeds;
    	let $account;
    	validate_store(feeds, "feeds");
    	component_subscribe($$self, feeds, $$value => $$invalidate(0, $feeds = $$value));
    	validate_store(account, "account");
    	component_subscribe($$self, account, $$value => $$invalidate(1, $account = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SingleHeader,
    		MultiHeader,
    		feeds,
    		account,
    		Loader,
    		$feeds,
    		$account
    	});

    	return [$feeds, $account];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* src/components/Tracks.svelte generated by Svelte v3.29.7 */
    const file$f = "src/components/Tracks.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (119:2) {#if $tracks.length}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*$tracks*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*setPlaying, $tracks, $playingTrack*/ 7) {
    				each_value = /*$tracks*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(119:2) {#if $tracks.length}",
    		ctx
    	});

    	return block;
    }

    // (138:20) {#if ($playingTrack && $playingTrack.md5) !== track.md5}
    function create_if_block_1$2(ctx) {
    	let div;
    	let button;
    	let playfill;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	playfill = new PlayFill({
    			props: { width: "50px", height: "50px" },
    			$$inline: true
    		});

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*track*/ ctx[4]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			create_component(playfill.$$.fragment);
    			attr_dev(button, "class", "btn btn-outline-light");
    			add_location(button, file$f, 143, 22, 3177);
    			attr_dev(div, "class", "control d-flex align-items-center justify-content-center text-center svelte-94sisf");
    			add_location(div, file$f, 139, 20, 3011);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			mount_component(playfill, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playfill.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playfill.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(playfill);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(138:20) {#if ($playingTrack && $playingTrack.md5) !== track.md5}",
    		ctx
    	});

    	return block;
    }

    // (120:4) {#each $tracks as track}
    function create_each_block$2(ctx) {
    	let div6;
    	let div5;
    	let div4;
    	let div3;
    	let div2;
    	let div1;
    	let div0;
    	let h6;
    	let t0_value = /*track*/ ctx[4].identifierTitle + "";
    	let t0;
    	let t1;
    	let h4;
    	let t2_value = /*track*/ ctx[4].title + "";
    	let t2;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let t5;
    	let current;
    	let if_block = (/*$playingTrack*/ ctx[1] && /*$playingTrack*/ ctx[1].md5) !== /*track*/ ctx[4].md5 && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			t0 = text(t0_value);
    			t1 = space();
    			h4 = element("h4");
    			t2 = text(t2_value);
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			if (if_block) if_block.c();
    			t5 = space();
    			attr_dev(h6, "class", "author text-center svelte-94sisf");
    			add_location(h6, file$f, 127, 18, 2532);
    			attr_dev(h4, "class", "title text-center svelte-94sisf");
    			add_location(h4, file$f, 128, 18, 2610);
    			attr_dev(div0, "class", "meatadata control justify-content-center text-center p-md-4 p-4 svelte-94sisf");
    			add_location(div0, file$f, 126, 16, 2436);
    			if (img.src !== (img_src_value = `https://archive.org/download/${/*track*/ ctx[4].identifier}/${/*track*/ ctx[4].cover.name}`)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "track cover");
    			attr_dev(img, "class", "lazy svelte-94sisf");
    			attr_dev(img, "loading", "lazy");
    			add_location(img, file$f, 131, 18, 2701);
    			attr_dev(div1, "class", "imgContent svelte-94sisf");
    			add_location(div1, file$f, 125, 16, 2395);
    			attr_dev(div2, "class", "position-relative imgContainer svelte-94sisf");
    			add_location(div2, file$f, 124, 14, 2334);
    			attr_dev(div3, "class", "col-12 col-md-12");
    			add_location(div3, file$f, 123, 12, 2289);
    			attr_dev(div4, "class", "row tracks svelte-94sisf");
    			add_location(div4, file$f, 122, 10, 2252);
    			attr_dev(div5, "class", "my-md-3 my-0 border-primary");
    			add_location(div5, file$f, 121, 8, 2200);
    			attr_dev(div6, "class", "col-12 col-md-6 col-lg-4 col-xl-3");
    			add_location(div6, file$f, 120, 6, 2144);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(h6, t0);
    			append_dev(div0, t1);
    			append_dev(div0, h4);
    			append_dev(h4, t2);
    			append_dev(div1, t3);
    			append_dev(div1, img);
    			append_dev(div1, t4);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div6, t5);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$tracks*/ 1) && t0_value !== (t0_value = /*track*/ ctx[4].identifierTitle + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*$tracks*/ 1) && t2_value !== (t2_value = /*track*/ ctx[4].title + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*$tracks*/ 1 && img.src !== (img_src_value = `https://archive.org/download/${/*track*/ ctx[4].identifier}/${/*track*/ ctx[4].cover.name}`)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((/*$playingTrack*/ ctx[1] && /*$playingTrack*/ ctx[1].md5) !== /*track*/ ctx[4].md5) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$playingTrack, $tracks*/ 3) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(120:4) {#each $tracks as track}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let current;
    	let if_block = /*$tracks*/ ctx[0].length && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "row p-0 pt-md-0");
    			add_location(div, file$f, 117, 0, 2056);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$tracks*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$tracks*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function formatTime(rawTime) {
    	const date = new Date(Math.round(rawTime) * 1000);
    	return date.toUTCString().split(" ")[4];
    }

    function formatDate(rawDate) {
    	const date = new Date(Math.round(rawDate) * 1000);
    	return date.toLocaleDateString();
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $tracks;
    	let $playingTrack;
    	validate_store(tracks, "tracks");
    	component_subscribe($$self, tracks, $$value => $$invalidate(0, $tracks = $$value));
    	validate_store(playingTrack, "playingTrack");
    	component_subscribe($$self, playingTrack, $$value => $$invalidate(1, $playingTrack = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Tracks", slots, []);

    	function setPlaying(track) {
    		playingTrack.set(track);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Tracks> was created with unknown prop '${key}'`);
    	});

    	const click_handler = track => setPlaying(track);

    	$$self.$capture_state = () => ({
    		PlayFill,
    		tracks,
    		playingTrack,
    		fade,
    		formatTime,
    		formatDate,
    		setPlaying,
    		$tracks,
    		$playingTrack
    	});

    	return [$tracks, $playingTrack, setPlaying, click_handler];
    }

    class Tracks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tracks",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.29.7 */
    const file$g = "src/components/Footer.svelte";

    function create_fragment$h(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h6;
    	let t1;
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h6 = element("h6");
    			h6.textContent = "Radio Quartiere fa parte dalla comunità di";
    			t1 = space();
    			a = element("a");
    			img = element("img");
    			attr_dev(h6, "class", "");
    			add_location(h6, file$g, 7, 6, 207);
    			attr_dev(img, "width", "160px");
    			attr_dev(img, "height", "auto");
    			if (img.src !== (img_src_value = logo)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "openpod logo");
    			add_location(img, file$g, 9, 8, 346);
    			attr_dev(a, "href", "https://openpod.abbiamoundominio.org");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$g, 8, 6, 274);
    			attr_dev(div0, "class", "p-3 text-center border-primary");
    			add_location(div0, file$g, 6, 4, 156);
    			attr_dev(div1, "class", "col-12 col-md-auto");
    			add_location(div1, file$g, 5, 2, 119);
    			attr_dev(div2, "class", "row mb-3 mt-3 mt-md-0 justify-content-center");
    			add_location(div2, file$g, 4, 0, 58);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h6);
    			append_dev(div0, t1);
    			append_dev(div0, a);
    			append_dev(a, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ logo });
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/Player.svelte generated by Svelte v3.29.7 */

    const { isNaN: isNaN_1 } = globals;
    const file$h = "src/components/Player.svelte";

    // (162:0) {#if $playingTrack}
    function create_if_block$4(ctx) {
    	let div13;
    	let div12;
    	let div11;
    	let div0;
    	let button0;
    	let current_block_type_index;
    	let if_block0;
    	let t0;
    	let div1;
    	let button1;
    	let skipendfill;
    	let t1;
    	let div8;
    	let audio;
    	let audio_src_value;
    	let audio_is_paused = true;
    	let audio_updating = false;
    	let audio_animationframe;
    	let t2;
    	let div7;
    	let div3;
    	let div2;
    	let div2_style_value;
    	let div2_aria_valuenow_value;
    	let t3;
    	let div6;
    	let div4;
    	let p0;
    	let span;
    	let t4_value = /*$playingTrack*/ ctx[6].identifierTitle + "";
    	let t4;
    	let t5;
    	let t6_value = /*$playingTrack*/ ctx[6].title + "";
    	let t6;
    	let t7;
    	let div5;
    	let p1;
    	let t8_value = formatSeconds(/*currentTime*/ ctx[1]) + "";
    	let t8;
    	let t9;
    	let t10_value = formatSeconds(/*duration*/ ctx[2]) + "";
    	let t10;
    	let t11;
    	let div9;
    	let button2;
    	let shuffle;
    	let t12;
    	let div10;
    	let button3;
    	let current_block_type_index_1;
    	let if_block1;
    	let div13_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_2, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*paused*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	skipendfill = new SkipEndFill({
    			props: { class: "playerButton" },
    			$$inline: true
    		});

    	function audio_timeupdate_handler() {
    		cancelAnimationFrame(audio_animationframe);

    		if (!audio.paused) {
    			audio_animationframe = raf(audio_timeupdate_handler);
    			audio_updating = true;
    		}

    		/*audio_timeupdate_handler*/ ctx[19].call(audio);
    	}

    	shuffle = new Shuffle({
    			props: {
    				fill: /*random*/ ctx[4] ? "black" : "gray",
    				class: "playerButton"
    			},
    			$$inline: true
    		});

    	const if_block_creators_1 = [create_if_block_1$3, create_else_block$2];
    	const if_blocks_1 = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*muted*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index_1 = select_block_type_1(ctx);
    	if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);

    	const block = {
    		c: function create() {
    			div13 = element("div");
    			div12 = element("div");
    			div11 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			button1 = element("button");
    			create_component(skipendfill.$$.fragment);
    			t1 = space();
    			div8 = element("div");
    			audio = element("audio");
    			t2 = space();
    			div7 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t3 = space();
    			div6 = element("div");
    			div4 = element("div");
    			p0 = element("p");
    			span = element("span");
    			t4 = text(t4_value);
    			t5 = text("\n                  •\n                  ");
    			t6 = text(t6_value);
    			t7 = space();
    			div5 = element("div");
    			p1 = element("p");
    			t8 = text(t8_value);
    			t9 = text("/");
    			t10 = text(t10_value);
    			t11 = space();
    			div9 = element("div");
    			button2 = element("button");
    			create_component(shuffle.$$.fragment);
    			t12 = space();
    			div10 = element("div");
    			button3 = element("button");
    			if_block1.c();
    			attr_dev(button0, "class", "btn btn-light");
    			add_location(button0, file$h, 169, 10, 3624);
    			attr_dev(div0, "class", "px-2 flex-grow-0 flex-shrink-0 order-1");
    			add_location(div0, file$h, 168, 8, 3561);
    			attr_dev(button1, "class", "btn btn-light");
    			add_location(button1, file$h, 178, 10, 3943);
    			attr_dev(div1, "class", "px-2 flex-grow-0 flex-shrink-0 order-1");
    			add_location(div1, file$h, 177, 8, 3880);
    			if (audio.src !== (audio_src_value = `https://archive.org/download/${/*$playingTrack*/ ctx[6].identifier}/${/*$playingTrack*/ ctx[6].name}`)) attr_dev(audio, "src", audio_src_value);
    			attr_dev(audio, "preload", "auto");
    			if (/*duration*/ ctx[2] === void 0) add_render_callback(() => /*audio_durationchange_handler*/ ctx[18].call(audio));
    			add_location(audio, file$h, 185, 10, 4225);
    			attr_dev(div2, "class", "progress-bar");
    			attr_dev(div2, "role", "progressbar");
    			attr_dev(div2, "style", div2_style_value = `transition: none;pointer-events:none; width:${/*currentTime*/ ctx[1] * 100 / /*duration*/ ctx[2]}%`);
    			attr_dev(div2, "aria-valuenow", div2_aria_valuenow_value = /*currentTime*/ ctx[1] || 0);
    			attr_dev(div2, "aria-valuemin", "0");
    			attr_dev(div2, "aria-valuemax", /*duration*/ ctx[2]);
    			add_location(div2, file$h, 206, 14, 5080);
    			attr_dev(div3, "class", "progress w-100 mt-0 mt-md-2 mb-3 mb-md-0 order-1");
    			set_style(div3, "height", "10px");
    			set_style(div3, "background-color", "#ced4da");
    			toggle_class(div3, "progress-bar-striped", /*waiting*/ ctx[5]);
    			toggle_class(div3, "progress-bar-animated", /*waiting*/ ctx[5]);
    			add_location(div3, file$h, 199, 12, 4734);
    			attr_dev(span, "class", "purple");
    			add_location(span, file$h, 218, 18, 5638);
    			attr_dev(p0, "class", "my-0 mr-2 text-truncate");
    			add_location(p0, file$h, 217, 16, 5584);
    			attr_dev(div4, "class", "overflow-hidden");
    			add_location(div4, file$h, 216, 14, 5538);
    			attr_dev(p1, "class", "m-0  text-monospace text-black-50 timer svelte-s0iob1");
    			add_location(p1, file$h, 224, 16, 5855);
    			attr_dev(div5, "class", "ml-md-auto");
    			add_location(div5, file$h, 223, 14, 5814);
    			attr_dev(div6, "class", "info d-flex flex-column flex-md-row my-2 order-0 order-md-1 overflow-hidden svelte-s0iob1");
    			add_location(div6, file$h, 214, 12, 5420);
    			attr_dev(div7, "class", "d-flex flex-column");
    			add_location(div7, file$h, 198, 10, 4689);
    			attr_dev(div8, "class", "px-2 flex-grow-1 order-0 order-md-1 overflow-hidden w-100");
    			add_location(div8, file$h, 183, 8, 4087);
    			attr_dev(button2, "class", "btn btn-light");
    			add_location(button2, file$h, 233, 10, 6145);
    			attr_dev(div9, "class", "px-2 flex-grow-0 flex-shrink-0 order-1");
    			add_location(div9, file$h, 232, 8, 6082);
    			attr_dev(button3, "class", "btn btn-light");
    			add_location(button3, file$h, 238, 10, 6384);
    			attr_dev(div10, "class", "px-2 flex-grow-0 flex-shrink-0 order-1");
    			add_location(div10, file$h, 237, 8, 6321);
    			attr_dev(div11, "class", "playerContainer align-items-center justify-content-between d-flex flex-wrap flex-md-nowrap");
    			add_location(div11, file$h, 166, 6, 3440);
    			attr_dev(div12, "class", "container-fluid");
    			add_location(div12, file$h, 165, 4, 3404);
    			attr_dev(div13, "class", "playerBg bg-secondary border-top border-primary d-flex align-items-center pb-2 pb-md-0 svelte-s0iob1");
    			add_location(div13, file$h, 162, 2, 3235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div13, anchor);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, div0);
    			append_dev(div0, button0);
    			if_blocks[current_block_type_index].m(button0, null);
    			append_dev(div11, t0);
    			append_dev(div11, div1);
    			append_dev(div1, button1);
    			mount_component(skipendfill, button1, null);
    			append_dev(div11, t1);
    			append_dev(div11, div8);
    			append_dev(div8, audio);
    			audio.muted = /*muted*/ ctx[3];
    			append_dev(div8, t2);
    			append_dev(div8, div7);
    			append_dev(div7, div3);
    			append_dev(div3, div2);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div4, p0);
    			append_dev(p0, span);
    			append_dev(span, t4);
    			append_dev(p0, t5);
    			append_dev(p0, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    			append_dev(p1, t8);
    			append_dev(p1, t9);
    			append_dev(p1, t10);
    			append_dev(div11, t11);
    			append_dev(div11, div9);
    			append_dev(div9, button2);
    			mount_component(shuffle, button2, null);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    			append_dev(div10, button3);
    			if_blocks_1[current_block_type_index_1].m(button3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*togglePlay*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*playNext*/ ctx[13], false, false, false),
    					listen_dev(audio, "play", /*audio_play_pause_handler*/ ctx[17]),
    					listen_dev(audio, "pause", /*audio_play_pause_handler*/ ctx[17]),
    					listen_dev(audio, "durationchange", /*audio_durationchange_handler*/ ctx[18]),
    					listen_dev(audio, "timeupdate", audio_timeupdate_handler),
    					listen_dev(audio, "volumechange", /*audio_volumechange_handler*/ ctx[20]),
    					listen_dev(audio, "ended", /*ended*/ ctx[12], false, false, false),
    					listen_dev(audio, "loadeddata", /*loadedData*/ ctx[7], false, false, false),
    					listen_dev(audio, "loadstart", /*loadStart*/ ctx[8], false, false, false),
    					listen_dev(audio, "waiting", /*waiting_handler*/ ctx[21], false, false, false),
    					listen_dev(audio, "canplaythrough", /*canplaythrough_handler*/ ctx[22], false, false, false),
    					listen_dev(div3, "mousemove", /*handleMousemove*/ ctx[14], false, false, false),
    					listen_dev(div3, "mousedown", /*handleMousedown*/ ctx[15], false, false, false),
    					listen_dev(button2, "click", /*toggleRandom*/ ctx[11], false, false, false),
    					listen_dev(button3, "click", /*toggleMuted*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(button0, null);
    			}

    			if (!current || dirty & /*$playingTrack*/ 64 && audio.src !== (audio_src_value = `https://archive.org/download/${/*$playingTrack*/ ctx[6].identifier}/${/*$playingTrack*/ ctx[6].name}`)) {
    				attr_dev(audio, "src", audio_src_value);
    			}

    			if (dirty & /*paused*/ 1 && audio_is_paused !== (audio_is_paused = /*paused*/ ctx[0])) {
    				audio[audio_is_paused ? "pause" : "play"]();
    			}

    			if (!audio_updating && dirty & /*currentTime*/ 2 && !isNaN_1(/*currentTime*/ ctx[1])) {
    				audio.currentTime = /*currentTime*/ ctx[1];
    			}

    			audio_updating = false;

    			if (dirty & /*muted*/ 8) {
    				audio.muted = /*muted*/ ctx[3];
    			}

    			if (!current || dirty & /*currentTime, duration*/ 6 && div2_style_value !== (div2_style_value = `transition: none;pointer-events:none; width:${/*currentTime*/ ctx[1] * 100 / /*duration*/ ctx[2]}%`)) {
    				attr_dev(div2, "style", div2_style_value);
    			}

    			if (!current || dirty & /*currentTime*/ 2 && div2_aria_valuenow_value !== (div2_aria_valuenow_value = /*currentTime*/ ctx[1] || 0)) {
    				attr_dev(div2, "aria-valuenow", div2_aria_valuenow_value);
    			}

    			if (!current || dirty & /*duration*/ 4) {
    				attr_dev(div2, "aria-valuemax", /*duration*/ ctx[2]);
    			}

    			if (dirty & /*waiting*/ 32) {
    				toggle_class(div3, "progress-bar-striped", /*waiting*/ ctx[5]);
    			}

    			if (dirty & /*waiting*/ 32) {
    				toggle_class(div3, "progress-bar-animated", /*waiting*/ ctx[5]);
    			}

    			if ((!current || dirty & /*$playingTrack*/ 64) && t4_value !== (t4_value = /*$playingTrack*/ ctx[6].identifierTitle + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*$playingTrack*/ 64) && t6_value !== (t6_value = /*$playingTrack*/ ctx[6].title + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*currentTime*/ 2) && t8_value !== (t8_value = formatSeconds(/*currentTime*/ ctx[1]) + "")) set_data_dev(t8, t8_value);
    			if ((!current || dirty & /*duration*/ 4) && t10_value !== (t10_value = formatSeconds(/*duration*/ ctx[2]) + "")) set_data_dev(t10, t10_value);
    			const shuffle_changes = {};
    			if (dirty & /*random*/ 16) shuffle_changes.fill = /*random*/ ctx[4] ? "black" : "gray";
    			shuffle.$set(shuffle_changes);
    			let previous_block_index_1 = current_block_type_index_1;
    			current_block_type_index_1 = select_block_type_1(ctx);

    			if (current_block_type_index_1 !== previous_block_index_1) {
    				group_outros();

    				transition_out(if_blocks_1[previous_block_index_1], 1, 1, () => {
    					if_blocks_1[previous_block_index_1] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks_1[current_block_type_index_1];

    				if (!if_block1) {
    					if_block1 = if_blocks_1[current_block_type_index_1] = if_block_creators_1[current_block_type_index_1](ctx);
    					if_block1.c();
    				} else {
    					if_block1.p(ctx, dirty);
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(button3, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(skipendfill.$$.fragment, local);
    			transition_in(shuffle.$$.fragment, local);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div13_transition) div13_transition = create_bidirectional_transition(div13, fly, { opacity: 1, duration: 1000, y: 100 }, true);
    				div13_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(skipendfill.$$.fragment, local);
    			transition_out(shuffle.$$.fragment, local);
    			transition_out(if_block1);
    			if (!div13_transition) div13_transition = create_bidirectional_transition(div13, fly, { opacity: 1, duration: 1000, y: 100 }, false);
    			div13_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div13);
    			if_blocks[current_block_type_index].d();
    			destroy_component(skipendfill);
    			destroy_component(shuffle);
    			if_blocks_1[current_block_type_index_1].d();
    			if (detaching && div13_transition) div13_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(162:0) {#if $playingTrack}",
    		ctx
    	});

    	return block;
    }

    // (173:12) {:else}
    function create_else_block_1(ctx) {
    	let pausefill;
    	let current;

    	pausefill = new PauseFill({
    			props: { class: "playerButton" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pausefill.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pausefill, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pausefill.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pausefill.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pausefill, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(173:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (171:12) {#if paused}
    function create_if_block_2(ctx) {
    	let playfill;
    	let current;

    	playfill = new PlayFill({
    			props: { class: "playerButton" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(playfill.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(playfill, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(playfill.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(playfill.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(playfill, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(171:12) {#if paused}",
    		ctx
    	});

    	return block;
    }

    // (242:12) {:else}
    function create_else_block$2(ctx) {
    	let volumeupfill;
    	let current;

    	volumeupfill = new VolumeUpFill({
    			props: { class: "playerButton" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(volumeupfill.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(volumeupfill, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(volumeupfill.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(volumeupfill.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(volumeupfill, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(242:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (240:12) {#if muted}
    function create_if_block_1$3(ctx) {
    	let volumemutefill;
    	let current;

    	volumemutefill = new VolumeMuteFill({
    			props: { class: "playerButton" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(volumemutefill.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(volumemutefill, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(volumemutefill.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(volumemutefill.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(volumemutefill, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(240:12) {#if muted}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$playingTrack*/ ctx[6] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$playingTrack*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$playingTrack*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function formatSeconds(seconds) {
    	if (isNaN(seconds)) return "No Data";
    	var sec_num = parseInt(seconds, 10);
    	var hours = Math.floor(sec_num / 3600);
    	var minutes = Math.floor(sec_num / 60) % 60;
    	var seconds = sec_num % 60;

    	return [hours, minutes, seconds].map(v => v < 10 ? "0" + v : v).//.filter((v, i) => v !== "00" || i > 0)
    	join(":");
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let $tracks;
    	let $playingTrack;
    	validate_store(tracks, "tracks");
    	component_subscribe($$self, tracks, $$value => $$invalidate(24, $tracks = $$value));
    	validate_store(playingTrack, "playingTrack");
    	component_subscribe($$self, playingTrack, $$value => $$invalidate(6, $playingTrack = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Player", slots, []);
    	let paused = true;
    	let currentTime = 0;
    	let duration = 0;
    	let muted = false;
    	let random = false;
    	let seeking = false;
    	let waiting = false;

    	function loadedData() {
    		$$invalidate(0, paused = false);
    	}

    	function loadStart() {
    		$$invalidate(0, paused = true);
    		$$invalidate(1, currentTime = 0);
    	}

    	function togglePlay() {
    		$$invalidate(0, paused = !paused);
    	}

    	function toggleMuted() {
    		$$invalidate(3, muted = !muted);
    	}

    	function toggleRandom() {
    		$$invalidate(4, random = !random);
    	}

    	function ended() {
    		playNext();
    	}

    	function getNextTrack() {
    		if (!tracks || !playingTrack) return;
    		const index = $tracks.findIndex(d => d.name + d.identifier === $playingTrack.name + $playingTrack.identifier);
    		let nextIndex = index + 1;

    		if (random) {
    			const randomArray = Array.from(Array($tracks.length).keys()).filter(d => d !== index);
    			const randomIndex = Math.floor(Math.random() * randomArray.length);
    			nextIndex = randomArray[randomIndex];
    		}

    		return nextIndex > $tracks.length ? 0 : nextIndex;
    	}

    	function playNext() {
    		playingTrack.set($tracks[getNextTrack()]);
    	}

    	function seek(e, element) {
    		const { left, right } = element.getBoundingClientRect();
    		$$invalidate(1, currentTime = duration * (e.clientX - left) / (right - left));
    	}

    	function handleMousemove(e) {
    		if (!(e.buttons & 1)) return; // mouse not down
    		if (!duration) return; // video not loaded yet
    		seeking = true;
    		seek(e, this);
    	}

    	function handleMousedown(e) {
    		function handleMouseup() {
    			if (duration) {
    				seek(e, this);
    			}

    			seeking = false;
    			cancel();
    		}

    		function cancel() {
    			e.target.removeEventListener("mouseup", handleMouseup);
    		}

    		e.target.addEventListener("mouseup", handleMouseup);
    		setTimeout(cancel, 200);
    	}

    	function toggleWaiting(value) {
    		$$invalidate(5, waiting = value);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Player> was created with unknown prop '${key}'`);
    	});

    	function audio_play_pause_handler() {
    		paused = this.paused;
    		$$invalidate(0, paused);
    	}

    	function audio_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(2, duration);
    	}

    	function audio_timeupdate_handler() {
    		currentTime = this.currentTime;
    		$$invalidate(1, currentTime);
    	}

    	function audio_volumechange_handler() {
    		muted = this.muted;
    		$$invalidate(3, muted);
    	}

    	const waiting_handler = () => toggleWaiting(true);
    	const canplaythrough_handler = () => toggleWaiting(false);

    	$$self.$capture_state = () => ({
    		PlayFill,
    		PauseFill,
    		SkipEndFill,
    		VolumeUpFill,
    		VolumeMuteFill,
    		Shuffle,
    		fly,
    		tracks,
    		playingTrack,
    		paused,
    		currentTime,
    		duration,
    		muted,
    		random,
    		seeking,
    		waiting,
    		loadedData,
    		loadStart,
    		togglePlay,
    		toggleMuted,
    		toggleRandom,
    		ended,
    		getNextTrack,
    		playNext,
    		seek,
    		handleMousemove,
    		handleMousedown,
    		formatSeconds,
    		toggleWaiting,
    		$tracks,
    		$playingTrack
    	});

    	$$self.$inject_state = $$props => {
    		if ("paused" in $$props) $$invalidate(0, paused = $$props.paused);
    		if ("currentTime" in $$props) $$invalidate(1, currentTime = $$props.currentTime);
    		if ("duration" in $$props) $$invalidate(2, duration = $$props.duration);
    		if ("muted" in $$props) $$invalidate(3, muted = $$props.muted);
    		if ("random" in $$props) $$invalidate(4, random = $$props.random);
    		if ("seeking" in $$props) seeking = $$props.seeking;
    		if ("waiting" in $$props) $$invalidate(5, waiting = $$props.waiting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		paused,
    		currentTime,
    		duration,
    		muted,
    		random,
    		waiting,
    		$playingTrack,
    		loadedData,
    		loadStart,
    		togglePlay,
    		toggleMuted,
    		toggleRandom,
    		ended,
    		playNext,
    		handleMousemove,
    		handleMousedown,
    		toggleWaiting,
    		audio_play_pause_handler,
    		audio_durationchange_handler,
    		audio_timeupdate_handler,
    		audio_volumechange_handler,
    		waiting_handler,
    		canplaythrough_handler
    	];
    }

    class Player extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Player",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.7 */
    const file$i = "src/App.svelte";

    function create_fragment$j(ctx) {
    	let div;
    	let header;
    	let t0;
    	let tracks;
    	let t1;
    	let footer;
    	let t2;
    	let player;
    	let current;
    	header = new Header({ $$inline: true });
    	tracks = new Tracks({ $$inline: true });
    	footer = new Footer({ $$inline: true });
    	player = new Player({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			create_component(tracks.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			t2 = space();
    			create_component(player.$$.fragment);
    			attr_dev(div, "class", "container-fluid h-100 flex-grow-1");
    			add_location(div, file$i, 7245, 0, 219579);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(header, div, null);
    			append_dev(div, t0);
    			mount_component(tracks, div, null);
    			append_dev(div, t1);
    			mount_component(footer, div, null);
    			insert_dev(target, t2, anchor);
    			mount_component(player, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(tracks.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			transition_in(player.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(tracks.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			transition_out(player.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(header);
    			destroy_component(tracks);
    			destroy_component(footer);
    			if (detaching) detach_dev(t2);
    			destroy_component(player, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Header, Tracks, Footer, Player });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$j.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    window.app = app;

    return app;

}());
//# sourceMappingURL=bundle.js.map
