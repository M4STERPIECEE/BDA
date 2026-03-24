package com.bda.bda.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AverageServiceTest {

    private final AverageService averageService = new AverageService();

    @Test
    void shouldReturnWeightedAverage() {
        double[] grades = {10, 20};
        double[] coefficients = {1, 3};

        double result = averageService.average(grades, coefficients);

        assertEquals(17.5d, result, 0.0001d);
    }

    @Test
    void shouldReturnZeroWhenInputIsNullOrEmpty() {
        assertEquals(0d, averageService.average(null, new double[]{1}), 0.0001d);
        assertEquals(0d, averageService.average(new double[]{10}, null), 0.0001d);
        assertEquals(0d, averageService.average(new double[]{}, new double[]{}), 0.0001d);
    }

    @Test
    void shouldThrowWhenLengthsDiffer() {
        assertThrows(IllegalArgumentException.class,
                () -> averageService.average(new double[]{10, 12}, new double[]{2}));
    }

    @Test
    void shouldThrowWhenCoefficientIsNotPositive() {
        assertThrows(IllegalArgumentException.class,
                () -> averageService.average(new double[]{10}, new double[]{0}));
    }
}

