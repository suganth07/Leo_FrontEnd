import { useState, useEffect } from 'react';

export const usePageTransition = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setFadeIn(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return { isLoading, fadeIn };
};

export const useDelayedRender = (delay: number = 500) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return shouldRender;
};
