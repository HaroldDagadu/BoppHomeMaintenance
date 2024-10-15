// src/components/Loading.js
import React from 'react';
import { PropagateLoader } from 'react-spinners';


const Loading = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
          <PropagateLoader color="green" />
      </div>
    </div>
  );
};


export default Loading;
