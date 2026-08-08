"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CountryFocusState = {
  code: string;
  name: string;
  latitude: number;
  longitude: number;
} | null;

type CountryFocusContextValue = {
  focusedCountry: CountryFocusState;

  focusCountry: (
    country: NonNullable<CountryFocusState>,
  ) => void;

  clearFocus: () => void;
};

const CountryFocusContext =
  createContext<CountryFocusContextValue | null>(
    null,
  );

export function CountryFocusProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    focusedCountry,
    setFocusedCountry,
  ] =
    useState<CountryFocusState>(
      null,
    );

  const value =
    useMemo(
      () => ({
        focusedCountry,

        focusCountry: (
          country: NonNullable<CountryFocusState>,
        ) => {
          setFocusedCountry(
            country,
          );
        },

        clearFocus: () => {
          setFocusedCountry(
            null,
          );
        },
      }),
      [
        focusedCountry,
      ],
    );

  return (
    <CountryFocusContext.Provider
      value={value}
    >
      {children}
    </CountryFocusContext.Provider>
  );
}

export function useCountryFocus() {
  const context =
    useContext(
      CountryFocusContext,
    );

  if (!context) {
    throw new Error(
      "useCountryFocus must be used inside CountryFocusProvider",
    );
  }

  return context;
}