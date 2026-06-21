'use client';

import React from 'react';
import Experience from '../scene/Experience';

interface SmartCitySceneProps {
  stage: number;
  onStageTransition: (nextStage: number) => void;
}

export default function SmartCityScene({ stage, onStageTransition }: SmartCitySceneProps) {
  return <Experience stage={stage} onStageTransition={onStageTransition} />;
}
