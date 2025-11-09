import { useState, useEffect } from 'react';

export const useDevice = () => {
  const [compactView, setCompactView] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setCompactView(/Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  return compactView;
};
