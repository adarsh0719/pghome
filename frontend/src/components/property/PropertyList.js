// src/components/property/PropertyList.js
import React from 'react';
import PropertyItem from './PropertyItem';

const PropertyList = ({ properties }) => {
  return (
    <div>
      {properties.map(property => (
        <PropertyItem key={property._id} property={property} />
      ))}
    </div>
  );
};

export default PropertyList;