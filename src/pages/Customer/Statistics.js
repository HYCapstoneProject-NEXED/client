import React from 'react';
import CustomerLayout from '../../components/Customer/CustomerLayout';
import DefectSummary from './DefectSummary';
import DefectTrend from './DefectTrend';


const Statistics = () => {
    return (
        <CustomerLayout>
            <DefectSummary />
            <div style={{ height: 10 }} />
            <DefectTrend />
        </CustomerLayout>
    );
};

export default Statistics;