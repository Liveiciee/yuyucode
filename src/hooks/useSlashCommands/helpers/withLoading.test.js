// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { withLoading } from './withLoading.js';

describe('withLoading', () => {
  it('calls setLoading(true) before fn', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(setLoading.mock.calls[0][0]).toBe(true);
  });

  it('calls setLoading(false) after fn resolves', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(setLoading.mock.calls[1][0]).toBe(false);
  });

  it('calls setLoading exactly twice on success', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(setLoading).toHaveBeenCalledTimes(2);
  });

  it('loading state is true before false - sequential order', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(setLoading.mock.calls[0][0]).toBe(true);
    expect(setLoading.mock.calls[1][0]).toBe(false);
  });

  it('fn is called after setLoading(true)', async () => {
    const callOrder = [];
    const setLoading = vi.fn(() => callOrder.push('setLoading'));
    const fn = vi.fn(() => { callOrder.push('fn'); return Promise.resolve(); });

    await withLoading(setLoading, fn);

    expect(callOrder[0]).toBe('setLoading'); // true
    expect(callOrder[1]).toBe('fn');
    expect(callOrder[2]).toBe('setLoading'); // false
  });

  it('setLoading(false) is called after fn finishes', async () => {
    const callOrder = [];
    const setLoading = vi.fn(v => callOrder.push(v));
    const fn = vi.fn(() => new Promise(resolve => {
      callOrder.push('fn-start');
      setTimeout(() => { callOrder.push('fn-end'); resolve(); }, 10);
    }));

    await withLoading(setLoading, fn);

    expect(callOrder).toEqual([true, 'fn-start', 'fn-end', false]);
  });

  it('executes fn exactly once', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls setLoading(false) even if fn rejects', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(withLoading(setLoading, fn)).rejects.toThrow('fail');

    expect(setLoading).toHaveBeenCalledTimes(2);
    expect(setLoading.mock.calls[1][0]).toBe(false);
  });

  it('calls setLoading(false) even if fn throws synchronously', async () => {
    const setLoading = vi.fn();
    const fn = () => { throw new Error('sync error'); };

    await expect(withLoading(setLoading, fn)).rejects.toThrow('sync error');

    expect(setLoading).toHaveBeenCalledTimes(2);
    expect(setLoading.mock.calls[0][0]).toBe(true);
    expect(setLoading.mock.calls[1][0]).toBe(false);
  });

  it('propagates the exact error object that fn throws', async () => {
    const setLoading = vi.fn();
    const originalError = new Error('specific error');
    const fn = vi.fn().mockRejectedValue(originalError);

    let caught;
    try {
      await withLoading(setLoading, fn);
    } catch (e) {
      caught = e;
    }

    expect(caught).toBe(originalError);
  });

  it('propagates non-Error rejections (string)', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockRejectedValue('string error');

    await expect(withLoading(setLoading, fn)).rejects.toBe('string error');
    expect(setLoading.mock.calls[1][0]).toBe(false);
  });

  it('propagates non-Error rejections (object)', async () => {
    const setLoading = vi.fn();
    const payload = { code: 404, message: 'not found' };
    const fn = vi.fn().mockRejectedValue(payload);

    await expect(withLoading(setLoading, fn)).rejects.toEqual(payload);
    expect(setLoading.mock.calls[1][0]).toBe(false);
  });

  it('returns the value from fn', async () => {
    const setLoading = vi.fn();
    const expected = { id: 123, name: 'test' };
    const fn = vi.fn().mockResolvedValue(expected);

    const result = await withLoading(setLoading, fn);

    expect(result).toEqual(expected);
  });

  it('returns exact same reference from fn', async () => {
    const setLoading = vi.fn();
    const result = { data: 'success' };
    const fn = vi.fn().mockResolvedValue(result);

    const returned = await withLoading(setLoading, fn);

    expect(returned).toBe(result);
  });

  it('returns undefined when fn resolves to undefined', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue(undefined);

    const result = await withLoading(setLoading, fn);

    expect(result).toBeUndefined();
  });

  it('returns null when fn resolves to null', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue(null);

    const result = await withLoading(setLoading, fn);

    expect(result).toBeNull();
  });

  it('returns false when fn resolves to false', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue(false);

    const result = await withLoading(setLoading, fn);

    expect(result).toBe(false);
  });

  it('handles async fn that takes time', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 10))
    );

    await withLoading(setLoading, fn);

    expect(setLoading).toHaveBeenCalledTimes(2);
  });

  it('handles setLoading as async function', async () => {
    const setLoading = vi.fn().mockResolvedValue();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(setLoading).toHaveBeenCalledTimes(2);
  });

  it('multiple sequential calls are independent', async () => {
    const setLoading = vi.fn();
    const fn1 = vi.fn().mockResolvedValue('a');
    const fn2 = vi.fn().mockResolvedValue('b');

    const r1 = await withLoading(setLoading, fn1);
    const r2 = await withLoading(setLoading, fn2);

    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).toHaveBeenCalledTimes(1);
    expect(setLoading).toHaveBeenCalledTimes(4);
    expect(r1).toBe('a');
    expect(r2).toBe('b');
  });

  it('each call gets its own independent setLoading', async () => {
    const setLoading1 = vi.fn();
    const setLoading2 = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading1, fn);
    await withLoading(setLoading2, fn);

    expect(setLoading1).toHaveBeenCalledTimes(2);
    expect(setLoading2).toHaveBeenCalledTimes(2);
  });

  it('fn receives no arguments', async () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    await withLoading(setLoading, fn);

    expect(fn).toHaveBeenCalledWith();
  });

  it('is async - returns a Promise', () => {
    const setLoading = vi.fn();
    const fn = vi.fn().mockResolvedValue();

    const returnValue = withLoading(setLoading, fn);

    expect(returnValue).toBeInstanceOf(Promise);
  });
});
