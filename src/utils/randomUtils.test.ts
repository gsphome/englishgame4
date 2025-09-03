import { describe, it, expect } from 'vitest'
import { shuffleArray } from './randomUtils'

describe('randomUtils', () => {
  describe('shuffleArray', () => {
    it('should return an array with the same length', () => {
      const input = [1, 2, 3, 4, 5]
      const result = shuffleArray([...input])
      expect(result).toHaveLength(input.length)
    })

    it('should contain all original elements', () => {
      const input = [1, 2, 3, 4, 5]
      const result = shuffleArray([...input])
      input.forEach(item => {
        expect(result).toContain(item)
      })
    })

    it('should handle empty array', () => {
      const result = shuffleArray([])
      expect(result).toEqual([])
    })

    it('should handle single element array', () => {
      const input = [42]
      const result = shuffleArray([...input])
      expect(result).toEqual([42])
    })
  })
})