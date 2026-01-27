import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Heading } from '@chakra-ui/react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data, options }) => {
  return (
    <Box p={5} shadow='md' borderWidth='1px' borderRadius='lg'>
      <Heading as='h3'fontWeight={600} size='md' mb={4}>
        Bar Chart
      </Heading>
      <Bar data={data} options={options} />
    </Box>
  );
};

export default BarChart;
