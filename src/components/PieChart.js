import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Heading } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data, options }) => {
  return (
    <Box p={5} shadow='md' borderWidth='1px' borderRadius='lg'>
      <Heading as='h3' fontWeight={600} size='md' mb={4}>
        Pie Chart
      </Heading>
      <Pie data={data} options={options} />
    </Box>
  );
};

export default PieChart;
