import { describe, it, expect } from 'vitest';
import { parseRequestBody, invalidJsonResponse } from '@/lib/api/parse-request-body';
import { NextRequest } from 'next/server';

describe('JSON Parsing Helper', () => {
  describe('parseRequestBody', () => {
    it('should parse valid JSON', async () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'value' }),
      });
      
      const result = await parseRequestBody(req);
      expect(result).toEqual({ test: 'value' });
    });

    it('should return null for malformed JSON', async () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid json',
      });
      
      const result = await parseRequestBody(req);
      expect(result).toBeNull();
    });

    it('should handle empty body', async () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const result = await parseRequestBody(req);
      expect(result).toBeNull();
    });

    it('should parse complex nested objects', async () => {
      const complexData = {
        user: {
          id: '123',
          profile: {
            name: 'Test User',
            settings: { theme: 'dark' }
          }
        },
        metadata: ['tag1', 'tag2']
      };

      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complexData),
      });
      
      const result = await parseRequestBody(req);
      expect(result).toEqual(complexData);
    });

    it('should handle numeric values', async () => {
      const req = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 42, price: 99.99 }),
      });
      
      const result = await parseRequestBody(req);
      expect(result).toEqual({ count: 42, price: 99.99 });
    });
  });

  describe('invalidJsonResponse', () => {
    it('should return 400 status', () => {
      const response = invalidJsonResponse();
      expect(response.status).toBe(400);
    });

    it('should return error message', async () => {
      const response = invalidJsonResponse();
      const data = await response.json();
      expect(data.error).toBe('Invalid JSON in request body');
      expect(data.message).toBeDefined();
    });

    it('should return consistent error structure', async () => {
      const response = invalidJsonResponse();
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('message');
      expect(typeof data.error).toBe('string');
      expect(typeof data.message).toBe('string');
    });
  });
});
