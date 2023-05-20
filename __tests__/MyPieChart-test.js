import React from 'react';
import { shallow } from 'enzyme';
import MyPieChart from '../Components/Visualisation/MyPieChart';
import { render, renderHook, waitFor } from '@testing-library/react-native';


describe('MyPieChart component', () => {
  const data = [
    { name: 'Item 1', amount: 10 },
    { name: 'Item 2', amount: 20 },
    { name: 'Item 3', amount: 30 },
  ];

  it('renders without crashing', () => {
    const wrapper = shallow(<MyPieChart data={data} />);
    expect(wrapper.exists()).toBe(true);
  });

  it('set the color to data', () => {
    render(<MyPieChart data={data} />);
  });

  it('applies the correct chartConfig prop', () => {
    const wrapper = shallow(<MyPieChart data={data} />);
    const pieChartProps = wrapper.find('PieChart').props();
    expect(pieChartProps.chartConfig).toEqual({
      backgroundColor: '#1cc910',
      backgroundGradientFrom: '#eff3ff',
      backgroundGradientTo: '#efefef',
      decimalPlaces: 4,
      color: expect.any(Function),
      style: {
        borderRadius: 16,
      },
    });
  });
});
