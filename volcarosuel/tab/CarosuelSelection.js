// CarouselContext.js
import React, { createContext, useState, useContext } from 'react';

const CarouselContext = createContext();

export const CarouselProvider = ({ children }) => {
    const [selectedCarousel, setSelectedCarousel] = useState('AnimalCarousel');

    return (
        <CarouselContext.Provider value={{ selectedCarousel, setSelectedCarousel }}>
            {children}
        </CarouselContext.Provider>
    );
};

export const useCarousel = () => useContext(CarouselContext);
