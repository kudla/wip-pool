import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import {compose, setDisplayName} from 'recompose';
import {Tooltip} from '@blueprintjs/core';

class WipRender extends Component {
    componentDidMount() {
        const element = findDOMNode(this);
        const {wip: constructionOrder} = this.props;
        const {
            offsetLeft,
            offsetTop
        } = element;

        Object.assign(this, { element, checkpoint: {position: {offsetLeft, offsetTop}, constructionOrder}});
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
                const clientRect =  element.getBoundingClientRect();
                const containerRect =  element.offsetParent.getBoundingClientRect();
                const {offsetLeft, offsetTop} = element;
                const animatedX = clientRect.x - containerRect.x - offsetLeft;
                const animatedY = clientRect.y - containerRect.y - offsetTop;
                Object.assign(this, {animationStatus: {animatedX, animatedY}});
            }
        } catch (error) {
        }
    }
    trackTheMotion() {
        try{
            const {element, checkpoint, props} = this;
            const {offsetLeft, offsetTop} = element;
            const {wip: {constructionOrder}} = props;
            if (!element) {
                return;
            }

            Object.assign(this, {checkpoint: {constructionOrder, position: {offsetLeft, offsetTop}}});
            if (!isEqual(checkpoint.position, {offsetLeft, offsetTop})) {
                if (this.motionTimer) {
                    clearTimeout(this.motionTimer);
                    delete this.motionTimer;
                }
                element.classList.add('wps-wip_force-motion');
                if (constructionOrder !== checkpoint.constructionOrder) {
                    element.style = '';
                    element.classList.remove('wps-wip_force-motion');
                } else {
                    const motionX = offsetLeft - checkpoint.position.offsetLeft;
                    const motionY = offsetTop - checkpoint.position.offsetTop;
                    const {animatedX, animatedY} = this.animationStatus;
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