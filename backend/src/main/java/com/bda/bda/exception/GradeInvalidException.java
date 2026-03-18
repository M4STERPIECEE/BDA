package com.bda.bda.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class GradeInvalidException extends RuntimeException {
    public GradeInvalidException(String message) {
        super(message);
    }
}