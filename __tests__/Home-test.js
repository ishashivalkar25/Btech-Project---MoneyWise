import 'react-native';
import React from 'react';
import HomePage from '../Components/HomePage';
import renderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native'; 
import { shallow } from 'enzyme';

describe('HomePage', () => {
  const navigation = { navigate: jest.fn() };
  const props = { navigation };

  it('renders without crashing', () => {
    const wrapper = shallow(<HomePage {...props} />);
    expect(wrapper.exists()).toBe(true);
  });

  // it('navigates to Visualisation when headerRight is pressed', () => {
  //   const wrapper = shallow(<HomePage {...props} />);
  //   wrapper.find('[testID="Visualization"]').simulate('press');
  //   expect(navigation.navigate).toHaveBeenCalledWith('Visualisation');
  // });

  // it('renders two tabs', () => {
  //   const wrapper = shallow(<HomePage {...props} />);
  //   expect(wrapper.find('[testID="tabs"]').children()).toHaveLength(2);
  // });
});
