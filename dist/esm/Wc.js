/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { Component } from 'react';
const ignoredProps = new Set(['children', 'wcType']);
/**
 * React Web Component wrapper Component
 *
 * @export
 * @class Wc
 * @extends {Component<WcTypeProps>}
 */
export class Wc extends Component {
    /**
     * Gets the web component element reference
     *
     * @readonly
     * @memberof Wc
     */
    get element() {
        return this._element;
    }
    /**
     * Gets the web component tag name from the 'wcType' prop
     *
     * @protected
     * @returns
     * @memberof Wc
     */
    getTag() {
        let tag;
        // when class is passed instead of tag name
        if (typeof this.props.wcType === 'function') {
            // convert to dash case
            tag = this.props.wcType.name
                .replace(/([a-zA-Z])(?=[A-Z])/g, '$1-')
                .toLowerCase();
        }
        else if (typeof this.props.wcType === 'string') {
            tag = this.props.wcType;
        }
        return tag;
    }
    /**
     * Renders the web component
     *
     * @returns
     * @memberof Wc
     */
    render() {
        const tag = this.getTag();
        if (!tag) {
            throw '"wcType" must be set!';
        }
        const allBools = {};
        for (const key of Object.keys(this.props)) {
            if (key && this.props[key] === true) {
                allBools[key] = true;
            }
        }
        return React.createElement(tag, Object.assign(Object.assign({}, allBools), { ref: (element) => this.setRef(element) }), this.props.children);
    }
    /**
     * Sets the web component reference and syncs the props
     *
     * @protected
     * @param {HTMLElement} element
     * @memberof Wc
     */
    setRef(element) {
        if (element) {
            if (element !== this._element) {
                this.cleanUp();
            }
            this._element = element;
            this.syncProps(this.props);
        }
        else {
            this.cleanUp();
        }
        if (this.props.innerRef) {
            if (typeof this.props.innerRef === 'function') {
                this.props.innerRef(element);
            }
            else {
                this.props.innerRef.current = element;
            }
        }
    }
    /**
     * Removes all event listeners from web component element
     *
     * @protected
     * @returns
     * @memberof Wc
     */
    cleanUp() {
        if (!this._element) {
            return;
        }
        for (const prop in this.props) {
            if (!this.props.hasOwnProperty(prop)) {
                continue;
            }
            if (this.isEventProp(prop, this.props)) {
                this._element.removeEventListener(prop[2].toLowerCase() + prop.substring(3), this.props[prop]);
            }
        }
        this._element = null;
    }
    /**
     * Updates props on web component
     *
     * @param {*} prevProps
     * @memberof Wc
     */
    componentDidUpdate(prevProps) {
        // only need to sync updated props
        // unsubscribe previous event handler if needed
        const newProps = {};
        for (const prop in this.props) {
            if (!this.props.hasOwnProperty(prop)) {
                continue;
            }
            if (!prevProps[prop] || prevProps[prop] !== this.props[prop]) {
                newProps[prop] = this.props[prop];
                if (prevProps[prop] && this.isEventProp(prop, prevProps[prop])) {
                    this.removeEventListener(prop, prevProps[prop]);
                }
            }
        }
        for (const prop in prevProps) {
            if (!prevProps.hasOwnProperty(prop)) {
                continue;
            }
            if (!this.props[prop] && this.isEventProp(prop, prevProps[prop])) {
                this.removeEventListener(prop, prevProps[prop]);
            }
        }
        this.syncProps(newProps);
    }
    /**
     * Syncs all React component props to web component
     *
     * @protected
     * @param {*} props
     * @memberof Wc
     */
    syncProps(props) {
        if (this._element) {
            for (const prop in props) {
                if (ignoredProps.has(prop)) {
                    continue;
                }
                if (this.isEventProp(prop, props[prop])) {
                    this.addEventListener(prop, props[prop]);
                }
                this._element[prop] = props[prop];
            }
        }
    }
    /**
     * Returns true if prop should be treated as event
     *
     * @protected
     * @param {string} prop
     * @param {*} value
     * @returns
     * @memberof Wc
     */
    isEventProp(prop, value) {
        return prop && typeof value === 'function';
    }
    /**
     * Adds event listener on web component
     *
     * @protected
     * @param {string} propName
     * @param {EventListenerOrEventListenerObject} handler
     * @memberof Wc
     */
    addEventListener(propName, handler) {
        let eventName = propName;
        if (eventName.match(/^on[A-Z]/gm)) {
            eventName = eventName.substring(2).toLowerCase();
        }
        this._element.addEventListener(eventName, handler);
    }
    /**
     * Removes event listener from web component
     *
     * @protected
     * @param {string} propName
     * @param {EventListenerOrEventListenerObject} handler
     * @memberof Wc
     */
    removeEventListener(propName, handler) {
        let eventName = propName;
        if (eventName.match(/^on[A-Z]/gm)) {
            eventName = eventName.substring(2).toLowerCase();
        }
        this._element.removeEventListener(eventName, handler);
    }
}
/**
 * Creates a new React Functional Component that wraps the
 * web component with the specified tag name
 *
 * @template T - optional props type for component
 * @param {(string | Function)} tag
 * @returns React component
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const wrapWc = (tag) => {
    const component = React.forwardRef((props, ref) => React.createElement(Wc, Object.assign({ wcType: tag, innerRef: ref }, props)));
    return component;
};
//# sourceMappingURL=Wc.js.map