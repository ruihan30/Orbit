import React, { createContext, useContext, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

const BottomSheetContext = createContext(null);

export const BottomSheetProvider = ({ children }) => {
  const bottomSheetRef = useRef(null);
  // const [sheetData, setSheetData] = useState(null);

  return (
    <BottomSheetContext.Provider value={bottomSheetRef}>
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};
