import { Injectable } from '@nestjs/common';

@Injectable()
export class HoroscopeCalculator {
    calculate(birthYear: number): string {
        const animals = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
        return animals[birthYear % 12];
    }
}
