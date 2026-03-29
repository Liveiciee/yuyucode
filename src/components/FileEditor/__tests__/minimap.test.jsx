import React from "react";
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Minimap } from '../minimap.jsx';

describe('Minimap', () => {
  it.skip('renders canvas', () => {
    const viewRef = { current: null };
    const { container } = render(<Minimap viewRef={viewRef} T={{}} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeDefined();
    expect(canvas.width).toBe(64);
  });
});
