"use client";

import EnergyOrbit from "./EnergyOrbit";
import Satellite from "./Satellite";

type OrbitSystemProps = {
  reduced?: boolean;
};

export default function OrbitSystem({
  reduced = false,
}: OrbitSystemProps) {
  return (
    <group>
      {/*
       * Four restrained orbital paths.
       *
       * No floating UI cards.
       */}

      <EnergyOrbit
        radius={3.45}
        tilt={0.14}
        color="#8B7CC7"
        speed={0.13}
        phase={0.12}
        reduced={reduced}
      />

      <EnergyOrbit
        radius={4.15}
        tilt={-0.18}
        color="#7C6FE0"
        speed={-0.1}
        phase={0.35}
        reduced={reduced}
      />

      <EnergyOrbit
        radius={4.8}
        tilt={0.23}
        color="#667EEA"
        speed={0.085}
        phase={0.64}
        reduced={reduced}
      />

      <EnergyOrbit
        radius={5.4}
        tilt={-0.26}
        color="#B48AE6"
        speed={-0.075}
        phase={0.82}
        reduced={reduced}
      />

      {/*
       * Satellites stay.
       *
       * They give the scene motion
       * without covering Earth with UI.
       */}

      <Satellite
        radius={3.72}
        speed={0.19}
        phase={0.8}
        tilt={0.15}
        color="#8B7CC7"
        reduced={reduced}
      />

      <Satellite
        radius={4.42}
        speed={-0.14}
        phase={2.6}
        tilt={-0.22}
        color="#A78BFA"
        reduced={reduced}
      />

      <Satellite
        radius={4.95}
        speed={0.11}
        phase={4.2}
        tilt={0.26}
        color="#6D7DDB"
        reduced={reduced}
      />

      {/*
       * One distant satellite
       * adds depth.
       */}

      <Satellite
        radius={5.55}
        speed={-0.075}
        phase={5.4}
        tilt={-0.13}
        color="#B794E8"
        reduced={reduced}
      />
    </group>
  );
}