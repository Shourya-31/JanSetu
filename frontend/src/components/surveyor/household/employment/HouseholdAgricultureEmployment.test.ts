import { act, createElement, createRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HouseholdAgricultureEmployment, {
  type HouseholdAgricultureEmploymentRef
} from './HouseholdAgricultureEmployment';

const options = ['हाँ', 'नहीं', 'पात्रता नहीं'];

describe('animal employment radio options', () => {
  let dom: JSDOM;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>');
    vi.stubGlobal('window', dom.window);
    vi.stubGlobal('document', dom.window.document);
    vi.stubGlobal('navigator', dom.window.navigator);
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    dom.window.close();
    vi.unstubAllGlobals();
  });

  it('renders all three options as one mutually exclusive group and updates animalEmployment on selection', async () => {
    const ref = createRef<HouseholdAgricultureEmploymentRef>();
    await act(async () => {
      root.render(createElement(HouseholdAgricultureEmployment, { houseNumber: 1, ref }));
    });

    const getRadios = () => [...container.querySelectorAll<HTMLInputElement>('input[type="radio"][name="animalEmployment"]')];
    expect(getRadios().map((radio) => radio.value)).toEqual(options);
    expect(getRadios().filter((radio) => radio.checked)).toHaveLength(0);

    for (const [index, answer] of options.entries()) {
      await act(async () => getRadios()[index].click());
      expect(ref.current?.getData().animalEmployment).toBe(answer);
      expect(getRadios().filter((radio) => radio.checked).map((radio) => radio.value)).toEqual([answer]);
    }
  });

  it.each(options)('restores %s as the selected animal-employment answer', async (answer) => {
    const ref = createRef<HouseholdAgricultureEmploymentRef>();
    await act(async () => {
      root.render(createElement(HouseholdAgricultureEmployment, {
        houseNumber: 1,
        existingData: { animalEmployment: answer },
        ref
      }));
    });

    const selected = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"][name="animalEmployment"]')]
      .filter((radio) => radio.checked);
    expect(selected.map((radio) => radio.value)).toEqual([answer]);
    expect(ref.current?.getData().animalEmployment).toBe(answer);
  });
});
