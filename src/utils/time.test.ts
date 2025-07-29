import { describe, it, expect } from 'vitest';
import { FROZEN_TIME, getCurrentTime, formatTime, getRelativeTime } from './time';

describe('Time utilities', () => {
  describe('FROZEN_TIME', () => {
    it('should be March 14th, 2030 @ 3:14 PM', () => {
      expect(FROZEN_TIME.getFullYear()).toBe(2030);
      expect(FROZEN_TIME.getMonth()).toBe(2); // March is month 2 (0-indexed)
      expect(FROZEN_TIME.getDate()).toBe(14);
      expect(FROZEN_TIME.getHours()).toBe(15); // 3 PM in 24h format
      expect(FROZEN_TIME.getMinutes()).toBe(14);
    });
  });

  describe('getCurrentTime', () => {
    it('should always return the frozen time', () => {
      const time1 = getCurrentTime();
      const time2 = getCurrentTime();

      expect(time1.getTime()).toBe(FROZEN_TIME.getTime());
      expect(time2.getTime()).toBe(FROZEN_TIME.getTime());
      expect(time1.getTime()).toBe(time2.getTime());
    });

    it('should return a new Date instance each time', () => {
      const time1 = getCurrentTime();
      const time2 = getCurrentTime();

      expect(time1).not.toBe(time2); // Different instances
      expect(time1).toEqual(time2); // But same value
    });
  });

  describe('formatTime', () => {
    describe('with extendHourDisplay = true (BMail behavior)', () => {
      it('should show time format for same day', () => {
        // Same day, morning
        const sameDay = new Date('2030-03-14T09:15:00');
        expect(formatTime(sameDay, true)).toBe('9:15 AM');

        // Same day, afternoon
        const sameDayPM = new Date('2030-03-14T14:30:00');
        expect(formatTime(sameDayPM, true)).toBe('2:30 PM');

        // Same day, midnight
        const midnight = new Date('2030-03-14T00:00:00');
        expect(formatTime(midnight, true)).toBe('12:00 AM');

        // Same day, noon
        const noon = new Date('2030-03-14T12:00:00');
        expect(formatTime(noon, true)).toBe('12:00 PM');
      });

      it('should show date format for different days', () => {
        const yesterday = new Date('2030-03-13T09:15:00');
        expect(formatTime(yesterday, true)).toBe('Mar 13');

        const lastMonth = new Date('2030-02-14T09:15:00');
        expect(formatTime(lastMonth, true)).toBe('Feb 14');

        const lastYear = new Date('2029-03-14T09:15:00');
        expect(formatTime(lastYear, true)).toBe('Mar 14');
      });
    });

    describe('with extendHourDisplay = false (AMail behavior)', () => {
      it('should show date format even for same day', () => {
        const sameDay = new Date('2030-03-14T09:15:00');
        expect(formatTime(sameDay, false)).toBe('Mar 14');
      });

      it('should show date format for different days', () => {
        const yesterday = new Date('2030-03-13T09:15:00');
        expect(formatTime(yesterday, false)).toBe('Mar 13');
      });
    });

    it('should format various months correctly', () => {
      const dates = [
        { date: new Date('2030-01-15T10:00:00'), expected: 'Jan 15' },
        { date: new Date('2030-02-28T10:00:00'), expected: 'Feb 28' },
        { date: new Date('2030-04-01T10:00:00'), expected: 'Apr 1' },
        { date: new Date('2030-05-31T10:00:00'), expected: 'May 31' },
        { date: new Date('2030-06-15T10:00:00'), expected: 'Jun 15' },
        { date: new Date('2030-07-04T10:00:00'), expected: 'Jul 4' },
        { date: new Date('2030-08-15T10:00:00'), expected: 'Aug 15' },
        { date: new Date('2030-09-01T10:00:00'), expected: 'Sep 1' },
        { date: new Date('2030-10-31T10:00:00'), expected: 'Oct 31' },
        { date: new Date('2030-11-11T10:00:00'), expected: 'Nov 11' },
        { date: new Date('2030-12-25T10:00:00'), expected: 'Dec 25' },
      ];

      dates.forEach(({ date, expected }) => {
        expect(formatTime(date, false)).toBe(expected);
      });
    });

    it('should pad minutes with zeros', () => {
      const time1 = new Date('2030-03-14T09:05:00');
      const time2 = new Date('2030-03-14T09:00:00');

      expect(formatTime(time1, true)).toBe('9:05 AM');
      expect(formatTime(time2, true)).toBe('9:00 AM');
    });
  });

  describe('getRelativeTime', () => {
    it('should show minutes ago for recent times', () => {
      const time30MinAgo = new Date('2030-03-14T14:44:00'); // 30 minutes before frozen time
      expect(getRelativeTime(time30MinAgo)).toBe('30 minutes ago');

      const time59MinAgo = new Date('2030-03-14T14:15:00'); // 59 minutes before frozen time
      expect(getRelativeTime(time59MinAgo)).toBe('59 minutes ago');

      const time0MinAgo = new Date('2030-03-14T15:14:00'); // Same as frozen time
      expect(getRelativeTime(time0MinAgo)).toBe('0 minutes ago');
    });

    it('should show hours ago for times within 24 hours', () => {
      const time1HourAgo = new Date('2030-03-14T14:14:00'); // 1 hour before frozen time
      expect(getRelativeTime(time1HourAgo)).toBe('1 hour ago');

      const time3HoursAgo = new Date('2030-03-14T12:14:00'); // 3 hours before frozen time
      expect(getRelativeTime(time3HoursAgo)).toBe('3 hours ago');

      const time23HoursAgo = new Date('2030-03-13T16:14:00'); // 23 hours before frozen time
      expect(getRelativeTime(time23HoursAgo)).toBe('23 hours ago');
    });

    it('should show "1 day ago" for exactly 1 day', () => {
      const time1DayAgo = new Date('2030-03-13T15:14:00'); // Exactly 1 day before frozen time
      expect(getRelativeTime(time1DayAgo)).toBe('1 day ago');

      const time1Day23HoursAgo = new Date('2030-03-12T16:14:00'); // 1 day and 23 hours
      expect(getRelativeTime(time1Day23HoursAgo)).toBe('1 day ago');
    });

    it('should show days ago for older times', () => {
      const time2DaysAgo = new Date('2030-03-12T15:14:00'); // 2 days before frozen time
      expect(getRelativeTime(time2DaysAgo)).toBe('2 days ago');

      const time7DaysAgo = new Date('2030-03-07T15:14:00'); // 7 days before frozen time
      expect(getRelativeTime(time7DaysAgo)).toBe('7 days ago');

      const time30DaysAgo = new Date('2030-02-12T15:14:00'); // ~30 days before frozen time
      expect(getRelativeTime(time30DaysAgo)).toBe('30 days ago');
    });

    it('should handle edge cases correctly', () => {
      // Just under 1 hour (59 minutes 59 seconds)
      const almostHour = new Date('2030-03-14T14:14:01');
      expect(getRelativeTime(almostHour)).toBe('59 minutes ago');

      // Just over 1 hour (60 minutes)
      const justOverHour = new Date('2030-03-14T14:13:59');
      expect(getRelativeTime(justOverHour)).toBe('1 hour ago');
    });
  });
});
