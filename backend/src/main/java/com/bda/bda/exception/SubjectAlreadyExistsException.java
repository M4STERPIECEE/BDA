package com.bda.bda.exception;

public class SubjectAlreadyExistsException extends RuntimeException {
    public SubjectAlreadyExistsException(String message) {
        super(message);
    }
}