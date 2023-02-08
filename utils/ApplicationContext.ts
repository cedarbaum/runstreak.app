import React, {  createContext } from 'react';

export type ApplicationError = {
    message: string;
    code?: number;
}

export type ApplicationContextType = {
    isAthleteLoading: boolean;
    setAthleteLoading: (isLoading: boolean) => void;
    isActivitiesLoading: boolean;
    setIsActivitiesLoading: (isLoading: boolean) => void;
    error: ApplicationError | null;
    setError: (error: ApplicationError | null) => void;
}

export const ApplicationContext = createContext<ApplicationContextType>({
    isAthleteLoading: false,
    setAthleteLoading: () => {},
    isActivitiesLoading: false,
    setIsActivitiesLoading: () => {},
    error: null,
    setError: () => {},
});
