package com.andresouza.finance.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super("%s %s não encontrado".formatted(resource, id));
    }
}
