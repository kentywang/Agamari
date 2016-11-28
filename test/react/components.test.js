import React, { Component }  from 'react';
import {expect} from 'chai';
import {shallow} from 'enzyme';
import {spy} from 'sinon';

import ControlPanel from '../../browser/components/ControlPanel';

describe('ControlPanel component tests', () => {

    let slider, onChangeSpy;
    beforeEach('Create component and onChange spy', () => {
        onChangeSpy = spy();
        slider = shallow(<ColorSlider onChange={onChangeSpy} />);
    });

    it('has min 0 and max 255', () => {
        const el = slider.get(0);
        expect(el.props.min).to.be.equal('0');
        expect(el.props.max).to.be.equal('255');
    });

    it('calls passed in onChange prop with value of change event', () => {
        slider.simulate('change', { target: { value: 13 } });
        expect(onChangeSpy.called).to.be.true;
    });

});