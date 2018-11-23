import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import {compose, setDisplayName} from 'recompose';
import {Tooltip} from '@blueprintjs/core';

const wipStates  = {};
class WipRender extends Component {
    componentDidMount() {
        const element = findDOMNode(this);
        const {wip: {constructionOrder}} = this.props;
        if (constructionOrder && !(constructionOrder in wipStates)) {
            const {offsetLeft, offsetTop} = element;
            wipStates[constructionOrder] = {offsetLeft, offsetTop};
        }

        Object.assign(this, {element});
    }
    componentWillUnmount() {
        delete this.element;
    }
    componentWillUpdate() {
        this.storeAnimationStatus();
    }
    componentDidUpdate() {
        this.trackTheMotion();
    }

    storeAnimationStatus() {
        try{
            const {element} = this;
            if (element) {
                const {wip: {constructionOrder}} = this.props;
                const clientRect =  element.getBoundingClientRect();
                const containerRect =  element.offsetParent.getBoundingClientRect();
                const {offsetLeft, offsetTop} = element;
                const animatedX = clientRect.x - containerRect.x - offsetLeft;
                const animatedY = clientRect.y - containerRect.y - offsetTop;
                Object.assign(this, {animationStatus: {animatedX, animatedY}, constructionOrder});
            }
        } catch (error) {
        }
    }
    trackTheMotion() {
        try{
            const {element, props} = this;
            const {offsetLeft, offsetTop} = element;
            const {wip: {constructionOrder}} = props;
            if (!element) {
                return;
            }

            const storedPosition = wipStates[constructionOrder];
            if (constructionOrder) {
                wipStates[constructionOrder] = {offsetLeft, offsetTop};
            }
            if (!isEqual(storedPosition, {offsetLeft, offsetTop})) {
                if (this.motionTimer) {
                    clearTimeout(this.motionTimer);
                    delete this.motionTimer;
                }
                element.classList.add('wps-wip_force-motion');
                if (!constructionOrder || !storedPosition) {
                    element.style = '';
                    element.classList.remove('wps-wip_force-motion');
                } else {
                    const motionX = offsetLeft - storedPosition.offsetLeft;
                    const motionY = offsetTop - storedPosition.offsetTop;
                    const {animatedX, animatedY} = this.constructionOrder === constructionOrder
                        ? this.animationStatus
                        : {animatedX: 0, animatedY: 0};
                    element.style = `transform: translate(${animatedX-motionX}px, ${animatedY-motionY}px)`;
                    this.motionTimer = setTimeout(() => {
                        delete this.motionTimer;
                        if (element === this.element) {
                            element.classList.remove('wps-wip_force-motion');
                            element.style = '';
                        }
                    });
                }
            }
        } catch (error) {

        }
    }
    render() {
        const {props} = this;
        const { wip, completeConstruction } = props;
        const {
            doneOrder,
            constructionOrder,
            progress
        } = wip;

        const isDone = doneOrder !== undefined;

        const className = classNames(
            'wps-wip',
            {
                'wps-wip__done': isDone
            }
        );

        return (

                <div
                    className={className}
                    onClick={() => !isDone && completeConstruction(constructionOrder)}
                >
                    <Tooltip
                        content={!isDone && 'Click to force complete WIP preparation'}
                        disabled={isDone}
                    >
                        <div>
                            <div className="wps-wip_progress" style={{ height: progress }}></div>
                            <span className="wps-wip_id">#{constructionOrder}</span>
                        </div>
                    </Tooltip>
                </div>
        );
    }
}

export const Wip = compose(
    setDisplayName('Wip')
)(WipRender);

export default Wip;