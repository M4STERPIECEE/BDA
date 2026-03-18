package com.bda.bda.service;

import org.springframework.stereotype.Service;

@Service
public class AverageService {
    public double average(double... grades) {
        if (grades == null || grades.length == 0) return 0d;
        double sum = 0d;
        for (double grade : grades) {
            sum += grade;
        }
        return sum / grades.length;
    }
}
