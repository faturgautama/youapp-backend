import { HoroscopeCalculator } from './horoscope.calculator';

describe('HoroscopeCalculator', () => {
    let calculator: HoroscopeCalculator;

    beforeEach(() => {
        calculator = new HoroscopeCalculator();
    });

    it('should be defined', () => {
        expect(calculator).toBeDefined();
    });

    describe('calculate', () => {
        it('should return Rat for years ending in 4 (e.g., 1984, 1996, 2008)', () => {
            expect(calculator.calculate(1984)).toBe('Rat');
            expect(calculator.calculate(1996)).toBe('Rat');
            expect(calculator.calculate(2008)).toBe('Rat');
            expect(calculator.calculate(2020)).toBe('Rat');
        });

        it('should return Ox for years ending in 5 (e.g., 1985, 1997, 2009)', () => {
            expect(calculator.calculate(1985)).toBe('Ox');
            expect(calculator.calculate(1997)).toBe('Ox');
            expect(calculator.calculate(2009)).toBe('Ox');
            expect(calculator.calculate(2021)).toBe('Ox');
        });

        it('should return Tiger for years ending in 6 (e.g., 1986, 1998, 2010)', () => {
            expect(calculator.calculate(1986)).toBe('Tiger');
            expect(calculator.calculate(1998)).toBe('Tiger');
            expect(calculator.calculate(2010)).toBe('Tiger');
            expect(calculator.calculate(2022)).toBe('Tiger');
        });

        it('should return Rabbit for years ending in 7 (e.g., 1987, 1999, 2011)', () => {
            expect(calculator.calculate(1987)).toBe('Rabbit');
            expect(calculator.calculate(1999)).toBe('Rabbit');
            expect(calculator.calculate(2011)).toBe('Rabbit');
            expect(calculator.calculate(2023)).toBe('Rabbit');
        });

        it('should return Dragon for years ending in 8 (e.g., 1988, 2000, 2012)', () => {
            expect(calculator.calculate(1988)).toBe('Dragon');
            expect(calculator.calculate(2000)).toBe('Dragon');
            expect(calculator.calculate(2012)).toBe('Dragon');
            expect(calculator.calculate(2024)).toBe('Dragon');
        });

        it('should return Snake for years ending in 9 (e.g., 1989, 2001, 2013)', () => {
            expect(calculator.calculate(1989)).toBe('Snake');
            expect(calculator.calculate(2001)).toBe('Snake');
            expect(calculator.calculate(2013)).toBe('Snake');
            expect(calculator.calculate(2025)).toBe('Snake');
        });

        it('should return Horse for years ending in 10 (e.g., 1990, 2002, 2014)', () => {
            expect(calculator.calculate(1990)).toBe('Horse');
            expect(calculator.calculate(2002)).toBe('Horse');
            expect(calculator.calculate(2014)).toBe('Horse');
        });

        it('should return Goat for years ending in 11 (e.g., 1991, 2003, 2015)', () => {
            expect(calculator.calculate(1991)).toBe('Goat');
            expect(calculator.calculate(2003)).toBe('Goat');
            expect(calculator.calculate(2015)).toBe('Goat');
        });

        it('should return Monkey for years ending in 0 (e.g., 1980, 1992, 2004)', () => {
            expect(calculator.calculate(1980)).toBe('Monkey');
            expect(calculator.calculate(1992)).toBe('Monkey');
            expect(calculator.calculate(2004)).toBe('Monkey');
            expect(calculator.calculate(2016)).toBe('Monkey');
        });

        it('should return Rooster for years ending in 1 (e.g., 1981, 1993, 2005)', () => {
            expect(calculator.calculate(1981)).toBe('Rooster');
            expect(calculator.calculate(1993)).toBe('Rooster');
            expect(calculator.calculate(2005)).toBe('Rooster');
            expect(calculator.calculate(2017)).toBe('Rooster');
        });

        it('should return Dog for years ending in 2 (e.g., 1982, 1994, 2006)', () => {
            expect(calculator.calculate(1982)).toBe('Dog');
            expect(calculator.calculate(1994)).toBe('Dog');
            expect(calculator.calculate(2006)).toBe('Dog');
            expect(calculator.calculate(2018)).toBe('Dog');
        });

        it('should return Pig for years ending in 3 (e.g., 1983, 1995, 2007)', () => {
            expect(calculator.calculate(1983)).toBe('Pig');
            expect(calculator.calculate(1995)).toBe('Pig');
            expect(calculator.calculate(2007)).toBe('Pig');
            expect(calculator.calculate(2019)).toBe('Pig');
        });

        it('should handle very old years correctly', () => {
            expect(calculator.calculate(1900)).toBe('Rat');
            expect(calculator.calculate(1901)).toBe('Ox');
        });

        it('should handle future years correctly', () => {
            expect(calculator.calculate(2030)).toBe('Dog');
            expect(calculator.calculate(2040)).toBe('Monkey');
        });
    });
});
