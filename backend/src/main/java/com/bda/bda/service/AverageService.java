package com.bda.bda.service;

import org.springframework.stereotype.Service;

@Service
public class AverageService {

    public double average(double[] grades, double[] coefficients) {
        if (grades == null || coefficients == null || grades.length == 0 || coefficients.length == 0) {
            return 0d;
        }
        if (grades.length != coefficients.length) {
            throw new IllegalArgumentException("grades and coefficients must have the same length");
        }

        double weightedSum = 0d;
        double coefficientSum = 0d;

        for (int i = 0; i < grades.length; i++) {
            double coefficient = coefficients[i];
            if (coefficient <= 0d) {
                throw new IllegalArgumentException("coefficient must be greater than 0");
            }
            weightedSum += grades[i] * coefficient;
            coefficientSum += coefficient;
        }

        return coefficientSum == 0d ? 0d : weightedSum / coefficientSum;
    }
}
