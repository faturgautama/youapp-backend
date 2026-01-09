import { ZodiacCalculator } from './zodiac.calculator';

describe('ZodiacCalculator', () => {
    let calculator: ZodiacCalculator;

    beforeEach(() => {
        calculator = new ZodiacCalculator();
    });

    it('should be defined', () => {
        expect(calculator).toBeDefined();
    });

    describe('calculate', () => {
        it('should return Aries for March 21 - April 19', () => {
            expect(calculator.calculate(new Date('1995-03-21'))).toBe('Aries');
            expect(calculator.calculate(new Date('1995-04-01'))).toBe('Aries');
            expect(calculator.calculate(new Date('1995-04-19'))).toBe('Aries');
        });

        it('should return Taurus for April 20 - May 20', () => {
            expect(calculator.calculate(new Date('1995-04-20'))).toBe('Taurus');
            expect(calculator.calculate(new Date('1995-05-15'))).toBe('Taurus');
            expect(calculator.calculate(new Date('1995-05-20'))).toBe('Taurus');
        });

        it('should return Gemini for May 21 - June 20', () => {
            expect(calculator.calculate(new Date('1995-05-21'))).toBe('Gemini');
            expect(calculator.calculate(new Date('1995-06-10'))).toBe('Gemini');
            expect(calculator.calculate(new Date('1995-06-20'))).toBe('Gemini');
        });

        it('should return Cancer for June 21 - July 22', () => {
            expect(calculator.calculate(new Date('1995-06-21'))).toBe('Cancer');
            expect(calculator.calculate(new Date('1995-07-15'))).toBe('Cancer');
            expect(calculator.calculate(new Date('1995-07-22'))).toBe('Cancer');
        });

        it('should return Leo for July 23 - August 22', () => {
            expect(calculator.calculate(new Date('1995-07-23'))).toBe('Leo');
            expect(calculator.calculate(new Date('1995-08-10'))).toBe('Leo');
            expect(calculator.calculate(new Date('1995-08-22'))).toBe('Leo');
        });

        it('should return Virgo for August 23 - September 22', () => {
            expect(calculator.calculate(new Date('1995-08-23'))).toBe('Virgo');
            expect(calculator.calculate(new Date('1995-09-15'))).toBe('Virgo');
            expect(calculator.calculate(new Date('1995-09-22'))).toBe('Virgo');
        });

        it('should return Libra for September 23 - October 22', () => {
            expect(calculator.calculate(new Date('1995-09-23'))).toBe('Libra');
            expect(calculator.calculate(new Date('1995-10-15'))).toBe('Libra');
            expect(calculator.calculate(new Date('1995-10-22'))).toBe('Libra');
        });

        it('should return Scorpio for October 23 - November 21', () => {
            expect(calculator.calculate(new Date('1995-10-23'))).toBe('Scorpio');
            expect(calculator.calculate(new Date('1995-11-10'))).toBe('Scorpio');
            expect(calculator.calculate(new Date('1995-11-21'))).toBe('Scorpio');
        });

        it('should return Sagittarius for November 22 - December 21', () => {
            expect(calculator.calculate(new Date('1995-11-22'))).toBe('Sagittarius');
            expect(calculator.calculate(new Date('1995-12-10'))).toBe('Sagittarius');
            expect(calculator.calculate(new Date('1995-12-21'))).toBe('Sagittarius');
        });

        it('should return Capricorn for December 22 - January 19', () => {
            expect(calculator.calculate(new Date('1995-12-22'))).toBe('Capricorn');
            expect(calculator.calculate(new Date('1996-01-10'))).toBe('Capricorn');
            expect(calculator.calculate(new Date('1996-01-19'))).toBe('Capricorn');
        });

        it('should return Aquarius for January 20 - February 18', () => {
            expect(calculator.calculate(new Date('1996-01-20'))).toBe('Aquarius');
            expect(calculator.calculate(new Date('1996-02-10'))).toBe('Aquarius');
            expect(calculator.calculate(new Date('1996-02-18'))).toBe('Aquarius');
        });

        it('should return Pisces for February 19 - March 20', () => {
            expect(calculator.calculate(new Date('1996-02-19'))).toBe('Pisces');
            expect(calculator.calculate(new Date('1996-03-10'))).toBe('Pisces');
            expect(calculator.calculate(new Date('1996-03-20'))).toBe('Pisces');
        });

        it('should handle leap year dates correctly', () => {
            expect(calculator.calculate(new Date('2000-02-29'))).toBe('Pisces');
            expect(calculator.calculate(new Date('2004-02-29'))).toBe('Pisces');
        });

        it('should handle year boundaries correctly', () => {
            expect(calculator.calculate(new Date('1995-12-31'))).toBe('Capricorn');
            expect(calculator.calculate(new Date('1996-01-01'))).toBe('Capricorn');
        });
    });
});
